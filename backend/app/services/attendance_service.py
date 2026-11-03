"""Smart Attend service: geofenced verification, biometric anti-spoof checks, session windows, manual overrides."""

from __future__ import annotations

import json
import math
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.audit import log_action
from app.core.errors import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.core.logging import get_logger
from app.models.academics import Course, CourseOffering, Enrollment, Room, TimetableSlot
from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.identity import Profile, Student
from app.schemas.academics import AttendanceRecordOut, CoordinatesOut
from app.schemas.attendance import (
    AttendanceSessionOut,
    CreateSessionIn,
    ManualOverrideIn,
    MarkAttendanceIn,
    MarkAttendanceResponse,
    SessionRosterOut,
)

log = get_logger(__name__)


# ── Distance & Verification Helpers ──────────────────────────────────────────


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in meters between two coordinates."""
    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def _ensure_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _to_record_out(record: AttendanceRecord, db: Session) -> AttendanceRecordOut:
    session = record.session or db.query(AttendanceSession).filter_by(id=record.session_id).first()
    course = db.query(Course).filter_by(id=session.course_id).first() if session else None
    student_profile = db.query(Profile).filter_by(id=record.student_id).first()
    student = (
        db.query(Student).filter_by(profile_id=record.student_id).first()
        if student_profile
        else None
    )

    created_dt = record.created_at or datetime.now(UTC)
    coords = None
    if record.latitude is not None and record.longitude is not None:
        coords = CoordinatesOut(
            lat=float(record.latitude),
            lng=float(record.longitude),
            accuracy=float(record.accuracy_m or 5.0),
        )

    return AttendanceRecordOut(
        id=str(record.id),
        student_id=str(record.student_id),
        student_name=student_profile.name if student_profile else "Unknown Student",
        roll_number=student.roll_number if student else "N/A",
        course_id=course.code if course else str(session.course_id if session else ""),
        course_name=course.name if course else "Unknown Course",
        faculty_id=str(session.faculty_id if session else ""),
        date=created_dt.strftime("%Y-%m-%d"),
        time=created_dt.strftime("%I:%M %p"),
        status=record.status,  # type: ignore[arg-type]
        verification_method=record.verification_method,  # type: ignore[arg-type]
        location_verified=record.location_verified,
        coordinates=coords,
        face_confidence=float(record.face_confidence or 0.0),
        liveness_verified=record.liveness_verified,
        notes=record.notes,
        corrected_by=str(record.corrected_by) if record.corrected_by else None,
        corrected_at=record.corrected_at.isoformat() if record.corrected_at else None,
    )


def _to_session_out(session: AttendanceSession, db: Session) -> AttendanceSessionOut:
    course = db.query(Course).filter_by(id=session.course_id).first()
    faculty_profile = db.query(Profile).filter_by(id=session.faculty_id).first()
    room = db.query(Room).filter_by(id=session.room_id).first()

    records = db.query(AttendanceRecord).filter_by(session_id=session.id).all()
    records_count = len(records)
    present_count = sum(1 for r in records if r.status in ("present", "manual_override"))

    return AttendanceSessionOut(
        id=session.id,
        course_id=session.course_id,
        course_code=course.code if course else "N/A",
        course_name=course.name if course else "N/A",
        faculty_id=session.faculty_id,
        faculty_name=faculty_profile.name if faculty_profile else "Faculty",
        room_id=session.room_id,
        room_name=room.name if room else "Campus Room",
        code=session.code,
        opens_at=session.opens_at,
        expires_at=session.expires_at,
        status=session.status,
        records_count=records_count,
        present_count=present_count,
    )


# ── Session Management ────────────────────────────────────────────────────────


def create_session(
    actor: Profile,
    payload: CreateSessionIn,
    db: Session,
) -> AttendanceSessionOut:
    """Faculty or admin opens a live attendance verification window."""
    if actor.role not in ("faculty", "admin"):
        raise ForbiddenError("Only faculty or administrators can create attendance sessions.")

    # 1. Resolve course
    course: Course | None = None
    if payload.course_id:
        course = db.query(Course).filter_by(id=payload.course_id).first()
    elif payload.course_code:
        course = db.query(Course).filter_by(code=payload.course_code).first()

    if not course:
        raise NotFoundError("Course not found. Specify a valid course_id or course_code.")

    # 2. Check offering / faculty ownership (admins bypass)
    if actor.role == "faculty":
        offering = (
            db.query(CourseOffering).filter_by(course_id=course.id, faculty_id=actor.id).first()
        )
        if not offering:
            # Check if faculty teaches ANY offering of this course
            offering = db.query(CourseOffering).filter_by(course_id=course.id).first()
            if not offering or offering.faculty_id != actor.id:
                raise ForbiddenError("You are not assigned to teach this course.")
    else:
        offering = db.query(CourseOffering).filter_by(course_id=course.id).first()

    # 3. Resolve room
    room: Room | None = None
    if payload.room_id:
        room = db.query(Room).filter_by(id=payload.room_id).first()
    if not room and offering:
        slot = db.query(TimetableSlot).filter_by(offering_id=offering.id).first()
        if slot and slot.room_id:
            room = db.query(Room).filter_by(id=slot.room_id).first()
    if not room:
        room = db.query(Room).first()
    if not room:
        raise BadRequestError("No lecture room configured for attendance verification.")

    # 4. Close any active sessions for this course
    now = datetime.now(UTC)
    old_sessions = (
        db.query(AttendanceSession)
        .filter(AttendanceSession.course_id == course.id, AttendanceSession.status == "active")
        .all()
    )
    for s in old_sessions:
        s.status = "closed"
        s.expires_at = now

    # 5. Generate session code (e.g. SA-8421)
    code = f"SA-{secrets.token_hex(2).upper()}"

    duration = timedelta(minutes=payload.duration_minutes)
    session = AttendanceSession(
        id=uuid.uuid4(),
        course_id=course.id,
        faculty_id=actor.id,
        room_id=room.id,
        opens_at=now,
        expires_at=now + duration,
        code=code,
        status="active",
    )
    db.add(session)
    db.flush()

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="attendance.session_created",
        target_entity="attendance_sessions",
        entity_id=str(session.id),
        details=json.dumps(
            {
                "course_code": course.code,
                "room_name": room.name,
                "code": code,
                "duration_minutes": payload.duration_minutes,
            }
        ),
    )
    db.commit()
    db.refresh(session)
    return _to_session_out(session, db)


def get_active_sessions(actor: Profile, db: Session) -> list[AttendanceSessionOut]:
    """Retrieve currently active attendance sessions visible to the user."""
    now = datetime.now(UTC)
    # Auto-expire overdue sessions
    active_sessions = db.query(AttendanceSession).filter(AttendanceSession.status == "active").all()
    expired_count = 0
    for s in active_sessions:
        exp = _ensure_utc(s.expires_at)
        if exp and exp < now:
            s.status = "expired"
            expired_count += 1
    if expired_count > 0:
        db.commit()

    query = db.query(AttendanceSession).filter_by(status="active")

    if actor.role == "student":
        # Only sessions for courses the student is enrolled in
        enrolled_offering_ids = (
            db.query(Enrollment.offering_id).filter_by(student_id=actor.id).scalar_subquery()
        )
        enrolled_course_ids = (
            db.query(CourseOffering.course_id)
            .filter(CourseOffering.id.in_(enrolled_offering_ids))
            .scalar_subquery()
        )
        query = query.filter(AttendanceSession.course_id.in_(enrolled_course_ids))
    elif actor.role == "faculty":
        query = query.filter(AttendanceSession.faculty_id == actor.id)

    sessions = query.order_by(AttendanceSession.opens_at.desc()).all()
    return [_to_session_out(s, db) for s in sessions]


def get_session_by_id(session_id: uuid.UUID, db: Session) -> AttendanceSessionOut:
    session = db.query(AttendanceSession).filter_by(id=session_id).first()
    if not session:
        raise NotFoundError("Attendance session not found.")
    return _to_session_out(session, db)


def close_session(session_id: uuid.UUID, actor: Profile, db: Session) -> AttendanceSessionOut:
    """Faculty or admin closes an active attendance window."""
    session = db.query(AttendanceSession).filter_by(id=session_id).first()
    if not session:
        raise NotFoundError("Attendance session not found.")

    if actor.role != "admin" and session.faculty_id != actor.id:
        raise ForbiddenError("You can only close attendance sessions you created.")

    session.status = "closed"
    session.expires_at = datetime.now(UTC)
    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="attendance.session_closed",
        target_entity="attendance_sessions",
        entity_id=str(session.id),
        details=json.dumps({"code": session.code}),
    )
    db.commit()
    db.refresh(session)
    return _to_session_out(session, db)


# ── Student Smart Attend Marking ──────────────────────────────────────────────


def mark_attendance(
    student_profile: Profile,
    payload: MarkAttendanceIn,
    db: Session,
) -> MarkAttendanceResponse:
    """
    Validate classroom geofence, biometric facial landmark score, and anti-spoof liveness
    before creating an immutable attendance ledger record.
    """
    if student_profile.role != "student":
        raise ForbiddenError("Only students can mark classroom attendance.")

    # 1. Resolve session
    session: AttendanceSession | None = None
    if payload.session_id:
        session = db.query(AttendanceSession).filter_by(id=payload.session_id).first()
    elif payload.session_code:
        session = db.query(AttendanceSession).filter_by(code=payload.session_code.strip()).first()
    elif payload.course_id:
        # Check by course code or UUID
        c = (
            db.query(Course)
            .filter((Course.code == payload.course_id) | (Course.name == payload.course_id))
            .first()
        )
        if not c:
            try:
                c_uuid = uuid.UUID(payload.course_id)
                c = db.query(Course).filter_by(id=c_uuid).first()
            except ValueError:
                pass
        if c:
            session = (
                db.query(AttendanceSession)
                .filter(AttendanceSession.course_id == c.id, AttendanceSession.status == "active")
                .first()
            )

    if not session:
        raise NotFoundError(
            "Active attendance session not found. Please provide a valid session ID, code, or active course."
        )

    now = datetime.now(UTC)
    exp = _ensure_utc(session.expires_at)
    if session.status != "active" or (exp and exp < now):
        session.status = "expired"
        db.commit()
        raise BadRequestError("Attendance session is closed or expired.")

    # 2. Verify student enrollment in the course offering
    course = db.query(Course).filter_by(id=session.course_id).first()
    enrollment = (
        db.query(Enrollment)
        .join(CourseOffering, Enrollment.offering_id == CourseOffering.id)
        .filter(
            Enrollment.student_id == student_profile.id,
            CourseOffering.course_id == session.course_id,
        )
        .first()
    )
    if not enrollment:
        raise ForbiddenError(f"You are not enrolled in {course.code if course else 'this course'}.")

    # 3. Prevent duplicate attendance submission
    existing = (
        db.query(AttendanceRecord)
        .filter_by(session_id=session.id, student_id=student_profile.id)
        .first()
    )
    if existing and existing.status in ("present", "manual_override"):
        raise ConflictError("Attendance already recorded for this session.")

    # 4. Geofence Perimeter Verification
    room = db.query(Room).filter_by(id=session.room_id).first()
    if not room:
        raise BadRequestError("Classroom perimeter configuration missing.")

    dist_meters = haversine_distance_m(
        payload.latitude,
        payload.longitude,
        room.latitude,
        room.longitude,
    )
    allowed_radius = float(room.geofence_radius_m or 60.0)
    geofence_passed = dist_meters <= allowed_radius

    if not geofence_passed:
        # Record failed attempt
        failed_rec = existing or AttendanceRecord(
            id=uuid.uuid4(),
            session_id=session.id,
            student_id=student_profile.id,
        )
        failed_rec.status = "failed"
        failed_rec.verification_method = "geo_face_liveness"
        failed_rec.location_verified = False
        failed_rec.latitude = payload.latitude
        failed_rec.longitude = payload.longitude
        failed_rec.accuracy_m = payload.accuracy
        failed_rec.face_confidence = payload.face_confidence
        failed_rec.liveness_verified = payload.liveness_verified
        failed_rec.notes = f"Location verification failed: {dist_meters:.1f}m from {room.name} (Max radius: {allowed_radius}m)."
        db.add(failed_rec)
        db.commit()
        raise BadRequestError(
            f"Device outside authorized perimeter. Detected {dist_meters:.1f}m from {room.name} "
            f"(Authorized radius: {allowed_radius:.0f}m)."
        )

    # 5. Facial Biometric Landmark Match & Liveness Challenge
    face_conf = float(payload.face_confidence if payload.face_confidence is not None else 98.6)
    biometric_passed = face_conf >= 75.0 and payload.liveness_verified

    if not biometric_passed:
        failed_rec = existing or AttendanceRecord(
            id=uuid.uuid4(),
            session_id=session.id,
            student_id=student_profile.id,
        )
        failed_rec.status = "failed"
        failed_rec.verification_method = "geo_face_liveness"
        failed_rec.location_verified = True
        failed_rec.latitude = payload.latitude
        failed_rec.longitude = payload.longitude
        failed_rec.accuracy_m = payload.accuracy
        failed_rec.face_confidence = face_conf
        failed_rec.liveness_verified = payload.liveness_verified
        failed_rec.notes = "Facial landmark mesh or anti-spoof liveness challenge failed."
        db.add(failed_rec)
        db.commit()
        raise BadRequestError("Facial biometric landmark match or anti-spoof challenge failed.")

    # 6. Record Success & Update Academic Ledger
    record = existing or AttendanceRecord(
        id=uuid.uuid4(),
        session_id=session.id,
        student_id=student_profile.id,
    )
    record.status = "present"
    record.verification_method = "geo_face_liveness"
    record.location_verified = True
    record.latitude = payload.latitude
    record.longitude = payload.longitude
    record.accuracy_m = payload.accuracy
    record.face_confidence = face_conf
    record.liveness_verified = True
    record.notes = payload.notes or f"Verified via SmartAttend AI in {room.name}."
    db.add(record)

    # 7. Update Student Enrollment Attendance Stats
    enrollment.attended_classes = (enrollment.attended_classes or 0) + 1
    enrollment.total_classes = max((enrollment.total_classes or 0), enrollment.attended_classes)
    if enrollment.total_classes > 0:
        enrollment.attendance_percent = round(
            (enrollment.attended_classes / enrollment.total_classes) * 100.0, 1
        )
    db.add(enrollment)

    log_action(
        db,
        actor_id=str(student_profile.id),
        actor_role=student_profile.role,
        action="attendance.marked_success",
        target_entity="attendance_records",
        entity_id=str(record.id),
        details=json.dumps(
            {
                "course_code": course.code if course else "",
                "room": room.name,
                "distance_m": round(dist_meters, 2),
                "face_confidence": face_conf,
            }
        ),
    )

    db.commit()
    db.refresh(record)

    return MarkAttendanceResponse(
        success=True,
        record=_to_record_out(record, db),
        message=f"Attendance successfully recorded for {course.code if course else 'lecture'}!",
        geofence_distance_m=round(dist_meters, 2),
        geofence_passed=True,
        biometric_passed=True,
    )


# ── Faculty Manual Exception Override ─────────────────────────────────────────


def manual_override(
    actor: Profile,
    payload: ManualOverrideIn,
    db: Session,
) -> AttendanceRecordOut:
    """
    Faculty or administrator records an attendance exception with a mandatory justification note.
    Enforces a tamper-proof audit log.
    """
    if actor.role not in ("faculty", "admin"):
        raise ForbiddenError("Only faculty or administrators can grant attendance overrides.")

    if not payload.reason.strip():
        raise BadRequestError(
            "A formal department justification note is required for manual overrides."
        )

    # 1. Resolve student
    student_profile: Profile | None = None
    if payload.student_id:
        student_profile = db.query(Profile).filter_by(id=payload.student_id).first()
    elif payload.roll_number:
        stu = db.query(Student).filter_by(roll_number=payload.roll_number.strip()).first()
        if stu:
            student_profile = db.query(Profile).filter_by(id=stu.profile_id).first()

    if not student_profile:
        raise NotFoundError("Student profile not found. Provide a valid student_id or roll_number.")

    # 2. Resolve session
    session: AttendanceSession | None = None
    if payload.session_id:
        session = db.query(AttendanceSession).filter_by(id=payload.session_id).first()
    elif payload.course_code:
        course = db.query(Course).filter_by(code=payload.course_code.strip()).first()
        if course:
            session = (
                db.query(AttendanceSession)
                .filter_by(course_id=course.id)
                .order_by(AttendanceSession.created_at.desc())
                .first()
            )

    if not session:
        # Fallback to any active or latest session
        session = db.query(AttendanceSession).order_by(AttendanceSession.created_at.desc()).first()

    if not session:
        raise NotFoundError("No attendance session found to apply override against.")

    # 3. Create or update record
    now = datetime.now(UTC)
    rec = (
        db.query(AttendanceRecord)
        .filter_by(session_id=session.id, student_id=student_profile.id)
        .first()
    )
    is_new_presence = False
    if not rec:
        rec = AttendanceRecord(
            id=uuid.uuid4(),
            session_id=session.id,
            student_id=student_profile.id,
        )
        is_new_presence = payload.status in ("present", "manual_override")
    else:
        if rec.status not in ("present", "manual_override") and payload.status in (
            "present",
            "manual_override",
        ):
            is_new_presence = True

    rec.status = payload.status
    rec.verification_method = "manual_faculty"
    rec.location_verified = True
    rec.face_confidence = 100.0
    rec.liveness_verified = True
    rec.notes = f"Faculty manual exemption: {payload.reason.strip()}"
    rec.corrected_by = actor.id
    rec.corrected_at = now
    db.add(rec)

    # 4. Update student enrollment stats if marked present
    if is_new_presence:
        enrollment = (
            db.query(Enrollment)
            .join(CourseOffering, Enrollment.offering_id == CourseOffering.id)
            .filter(
                Enrollment.student_id == student_profile.id,
                CourseOffering.course_id == session.course_id,
            )
            .first()
        )
        if enrollment:
            enrollment.attended_classes = (enrollment.attended_classes or 0) + 1
            enrollment.total_classes = max(
                enrollment.total_classes or 0, enrollment.attended_classes
            )
            enrollment.attendance_percent = round(
                (enrollment.attended_classes / enrollment.total_classes) * 100.0, 1
            )
            db.add(enrollment)

    # 5. Tamper-proof audit log
    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="attendance.manual_override",
        target_entity="attendance_records",
        entity_id=str(rec.id),
        details=json.dumps(
            {
                "student_id": str(student_profile.id),
                "session_id": str(session.id),
                "status": payload.status,
                "reason": payload.reason,
            }
        ),
    )

    db.commit()
    db.refresh(rec)
    return _to_record_out(rec, db)


# ── Roster & Student History ──────────────────────────────────────────────────


def get_session_roster(
    session_id: uuid.UUID,
    actor: Profile,
    db: Session,
) -> SessionRosterOut:
    """Retrieve full live classroom attendance roster."""
    session = db.query(AttendanceSession).filter_by(id=session_id).first()
    if not session:
        raise NotFoundError("Attendance session not found.")

    records = (
        db.query(AttendanceRecord)
        .filter_by(session_id=session.id)
        .order_by(AttendanceRecord.created_at.desc())
        .all()
    )
    return SessionRosterOut(
        session=_to_session_out(session, db),
        records=[_to_record_out(r, db) for r in records],
    )


def get_student_records(
    student_profile: Profile,
    db: Session,
    limit: int = 50,
) -> list[AttendanceRecordOut]:
    """Retrieve recent attendance verification records for a student."""
    records = (
        db.query(AttendanceRecord)
        .filter_by(student_id=student_profile.id)
        .order_by(AttendanceRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_to_record_out(r, db) for r in records]
