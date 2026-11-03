"""Smart Attend v1 router — sessions, geofenced biometric verification, manual overrides, rosters.

Endpoints
---------
POST /api/v1/attendance/sessions           — Faculty/Admin open attendance window
GET  /api/v1/attendance/sessions/active    — List active sessions
GET  /api/v1/attendance/sessions/{id}      — Get session details
POST /api/v1/attendance/sessions/{id}/close — Faculty/Admin close session
POST /api/v1/attendance/mark               — Student verify and mark attendance
POST /api/v1/attendance/override           — Faculty/Admin manual exception override
POST /api/v1/attendance/{id}/override      — Faculty/Admin manual override (by session id)
GET  /api/v1/attendance/sessions/{id}/roster — Live session classroom roster
GET  /api/v1/attendance/records/me         — Student attendance history
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbDep
from app.schemas.academics import AttendanceRecordOut
from app.schemas.attendance import (
    AttendanceSessionOut,
    CreateSessionIn,
    ManualOverrideIn,
    MarkAttendanceIn,
    MarkAttendanceResponse,
    SessionRosterOut,
)
from app.services import attendance_service

router = APIRouter(prefix="/api/v1/attendance", tags=["attendance"])


@router.post(
    "/sessions",
    response_model=AttendanceSessionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    body: CreateSessionIn,
    user: CurrentUser,
    db: DbDep,
):
    """Faculty or admin opens a live attendance verification window."""
    return attendance_service.create_session(actor=user, payload=body, db=db)


@router.get("/sessions/active", response_model=list[AttendanceSessionOut])
def get_active_sessions(
    user: CurrentUser,
    db: DbDep,
):
    """List active attendance sessions visible to the current user."""
    return attendance_service.get_active_sessions(actor=user, db=db)


@router.get("/sessions/{session_id}", response_model=AttendanceSessionOut)
def get_session(
    session_id: uuid.UUID,
    user: CurrentUser,
    db: DbDep,
):
    """Get details for an attendance session."""
    return attendance_service.get_session_by_id(session_id=session_id, db=db)


@router.post("/sessions/{session_id}/close", response_model=AttendanceSessionOut)
def close_session(
    session_id: uuid.UUID,
    user: CurrentUser,
    db: DbDep,
):
    """Faculty or admin closes an active attendance window."""
    return attendance_service.close_session(session_id=session_id, actor=user, db=db)


@router.post(
    "/mark",
    response_model=MarkAttendanceResponse,
    status_code=status.HTTP_200_OK,
)
def mark_attendance(
    body: MarkAttendanceIn,
    user: CurrentUser,
    db: DbDep,
):
    """
    Student submits geofence coordinates and biometric landmark results
    to mark present in an active lecture session.
    """
    return attendance_service.mark_attendance(student_profile=user, payload=body, db=db)


@router.post("/override", response_model=AttendanceRecordOut)
def manual_override(
    body: ManualOverrideIn,
    user: CurrentUser,
    db: DbDep,
):
    """Faculty or admin records an attendance exception with a mandatory justification note."""
    return attendance_service.manual_override(actor=user, payload=body, db=db)


@router.post("/{session_id}/override", response_model=AttendanceRecordOut)
def manual_override_for_session(
    session_id: uuid.UUID,
    body: ManualOverrideIn,
    user: CurrentUser,
    db: DbDep,
):
    """Faculty or admin records an attendance exception for a specific session."""
    body.session_id = session_id
    return attendance_service.manual_override(actor=user, payload=body, db=db)


@router.get("/sessions/{session_id}/roster", response_model=SessionRosterOut)
def get_session_roster(
    session_id: uuid.UUID,
    user: CurrentUser,
    db: DbDep,
):
    """Retrieve full classroom verification roster for a session."""
    return attendance_service.get_session_roster(session_id=session_id, actor=user, db=db)


@router.get("/records/me", response_model=list[AttendanceRecordOut])
def get_my_attendance_records(
    user: CurrentUser,
    db: DbDep,
):
    """Retrieve the student's recent attendance records."""
    return attendance_service.get_student_records(student_profile=user, db=db)
