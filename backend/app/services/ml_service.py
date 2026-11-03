"""ML Early Warning Service: feature extraction, scikit-learn classification,
risk factor explainability, interventions, and learning recommendations.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session

from app.core.audit import log_action
from app.core.errors import NotFoundError
from app.models.academics import Course, CourseOffering, Enrollment
from app.models.ai import AIPrediction, Intervention, LearningResource, Recommendation
from app.models.assessment import Assessment, AssessmentScore, Exam, ExamSeat
from app.models.attendance import AttendanceRecord
from app.models.canteen import CanteenOrder
from app.models.helpdesk import HelpdeskTicket
from app.models.identity import Department, Profile, Student
from app.schemas.ml import (
    AcademicFeatures,
    AtRiskStudentSummaryOut,
    BatchEvaluationResultOut,
    EarlyWarningPredictionOut,
    InterventionOut,
    LearningResourceOut,
    RecommendationOut,
    RiskFactorOut,
)

MODEL_VERSION = "v1.2.0-rf-academic"


# ── In-Memory Trained Scikit-Learn Model Singleton ────────────────────────────
class EarlyWarningMLPipeline:
    """Production scikit-learn pipeline for academic early warning.
    Trained strictly on non-protected academic signals.
    """

    def __init__(self) -> None:
        self.pipeline: Pipeline | None = None
        self._initialize_and_train()

    def _initialize_and_train(self) -> None:
        """Train pipeline on canonical academic performance distributions."""
        np.random.seed(42)

        # Features: [attendance_pct, attendance_trend, marks_pct, marks_trend, submission_rate, activity_count]
        # Class 0: Low Risk (healthy, engaged)
        x_low = np.column_stack(
            [
                np.random.uniform(80.0, 98.0, 200),
                np.random.uniform(-3.0, 10.0, 200),
                np.random.uniform(70.0, 95.0, 200),
                np.random.uniform(-4.0, 15.0, 200),
                np.random.uniform(0.85, 1.0, 200),
                np.random.uniform(8.0, 25.0, 200),
            ]
        )
        y_low = np.zeros(200)

        # Class 1: Medium Risk (slight dip or borderline metrics)
        x_med = np.column_stack(
            [
                np.random.uniform(75.0, 82.0, 150),
                np.random.uniform(-10.0, 2.0, 150),
                np.random.uniform(58.0, 72.0, 150),
                np.random.uniform(-12.0, 5.0, 150),
                np.random.uniform(0.65, 0.85, 150),
                np.random.uniform(4.0, 12.0, 150),
            ]
        )
        y_med = np.ones(150)

        # Class 2: High Risk (attendance < 75% or marks < 55%)
        x_high = np.column_stack(
            [
                np.random.uniform(65.0, 74.9, 120),
                np.random.uniform(-20.0, -2.0, 120),
                np.random.uniform(45.0, 60.0, 120),
                np.random.uniform(-20.0, -3.0, 120),
                np.random.uniform(0.40, 0.70, 120),
                np.random.uniform(1.0, 6.0, 120),
            ]
        )
        y_high = np.full(120, 2)

        # Class 3: Critical Risk (severe detention risk or failing scores)
        x_crit = np.column_stack(
            [
                np.random.uniform(40.0, 64.9, 80),
                np.random.uniform(-35.0, -10.0, 80),
                np.random.uniform(25.0, 48.0, 80),
                np.random.uniform(-30.0, -10.0, 80),
                np.random.uniform(0.10, 0.45, 80),
                np.random.uniform(0.0, 3.0, 80),
            ]
        )
        y_crit = np.full(80, 3)

        x_train = np.vstack([x_low, x_med, x_high, x_crit])
        y_train = np.concatenate([y_low, y_med, y_high, y_crit])

        self.pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("rf", RandomForestClassifier(n_estimators=40, max_depth=6, random_state=42)),
            ]
        )
        self.pipeline.fit(x_train, y_train)

    def predict_risk(
        self,
        features: AcademicFeatures,
        has_course_detention_risk: bool = False,
    ) -> tuple[str, float]:
        """Compute risk level and probability from academic feature vector."""
        vec = np.array(
            [
                [
                    features.attendance_percent,
                    features.attendance_trend_30d,
                    features.marks_average,
                    features.marks_trend,
                    features.assignment_submission_rate,
                    float(features.recent_activity_count),
                ]
            ]
        )

        probs = self.pipeline.predict_proba(vec)[0]  # probabilities for classes [0, 1, 2, 3]
        # Weighted risk score: 0 * P(0) + 0.33 * P(1) + 0.66 * P(2) + 1.0 * P(3)
        risk_probability = float(probs[1] * 0.35 + probs[2] * 0.70 + probs[3] * 1.0)
        risk_probability = min(max(risk_probability, 0.02), 0.99)

        # Hard institutional rules override for university compliance:
        # Mandatory 75% attendance rule (overall or course-specific detention risk)
        if features.attendance_percent < 65.0 or features.marks_average < 45.0:
            risk_level = "Critical"
            risk_probability = max(risk_probability, 0.85)
        elif (
            has_course_detention_risk
            or features.attendance_percent < 75.0
            or features.marks_average < 55.0
        ):
            risk_level = "High"
            risk_probability = max(risk_probability, 0.65)
        elif features.attendance_percent < 80.0 or risk_probability >= 0.40:
            risk_level = "Medium"
            risk_probability = max(risk_probability, 0.35)
        else:
            risk_level = "Low"

        return risk_level, round(risk_probability, 3)


_ml_engine = EarlyWarningMLPipeline()


# ── Feature Extraction ────────────────────────────────────────────────────────
def extract_student_academic_features(
    student_id: UUID, db: Session
) -> tuple[AcademicFeatures, list[dict[str, Any]]]:
    """Extract academic signals exclusively from student database records.
    Returns the feature object and course-level diagnostics.
    """
    now = datetime.now(UTC)

    # 1. Attendance percentage from enrollments
    enrollments = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
        )
        .all()
    )

    course_diagnostics: list[dict[str, Any]] = []
    if enrollments:
        att_pcts = []
        for enr in enrollments:
            offering = db.query(CourseOffering).filter_by(id=enr.offering_id).first()
            course = db.query(Course).filter_by(id=offering.course_id).first() if offering else None
            course_code = course.code if course else "N/A"
            course_name = course.name if course else "Course"
            pct = float(enr.attendance_percent) if enr.attendance_percent is not None else 0.0
            att_pcts.append(pct)
            course_diagnostics.append(
                {
                    "course_code": course_code,
                    "course_name": course_name,
                    "attendance_percent": pct,
                    "attended": enr.attended_classes,
                    "total": enr.total_classes,
                }
            )
        overall_attendance = float(sum(att_pcts) / len(att_pcts))
    else:
        overall_attendance = 100.0

    # 2. 30-Day Attendance Trend
    cutoff_30d = now - timedelta(days=30)
    cutoff_60d = now - timedelta(days=60)

    # Compare records in last 30d vs 30-60d
    recent_records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.created_at >= cutoff_30d,
        )
        .all()
    )
    prior_records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.created_at >= cutoff_60d,
            AttendanceRecord.created_at < cutoff_30d,
        )
        .all()
    )

    if recent_records and prior_records:
        rec_rate = (
            sum(1 for r in recent_records if r.status == "present") / len(recent_records) * 100.0
        )
        pri_rate = (
            sum(1 for r in prior_records if r.status == "present") / len(prior_records) * 100.0
        )
        attendance_trend = round(rec_rate - pri_rate, 1)
    else:
        attendance_trend = -2.5 if overall_attendance < 75.0 else 0.0

    # 3. Marks Average and Trend
    scores = db.query(AssessmentScore).filter_by(student_id=student_id).all()
    exam_seats = db.query(ExamSeat).filter_by(student_id=student_id).all()

    mark_percentages: list[float] = []
    for s in scores:
        assm = db.query(Assessment).filter_by(id=s.assessment_id).first()
        if assm and assm.max_marks > 0:
            mark_percentages.append((s.score / assm.max_marks) * 100.0)

    for es in exam_seats:
        if es.marks_obtained is not None:
            exam = db.query(Exam).filter_by(id=es.exam_id).first()
            if exam and exam.max_marks > 0:
                mark_percentages.append((es.marks_obtained / exam.max_marks) * 100.0)

    if mark_percentages:
        marks_average = round(float(sum(mark_percentages) / len(mark_percentages)), 1)
        if len(mark_percentages) >= 2:
            half = len(mark_percentages) // 2
            recent_avg = sum(mark_percentages[half:]) / len(mark_percentages[half:])
            older_avg = sum(mark_percentages[:half]) / len(mark_percentages[:half])
            marks_trend = round(recent_avg - older_avg, 1)
        else:
            marks_trend = 0.0
    else:
        marks_average = 82.0
        marks_trend = 0.0

    # 4. Coursework submission rate
    # Count assessments available across student's enrolled courses
    total_assessments_count = 0
    if enrollments:
        for enr in enrollments:
            offering = db.query(CourseOffering).filter_by(id=enr.offering_id).first()
            if offering:
                count = db.query(Assessment).filter_by(course_id=offering.course_id).count()
                total_assessments_count += count

    if total_assessments_count > 0:
        submission_rate = round(min(len(scores) / total_assessments_count, 1.0), 2)
    else:
        submission_rate = 1.0 if not scores else round(min(len(scores) / 5.0, 1.0), 2)

    # 5. Recent Campus Activity Count (last 14 days)
    cutoff_14d = now - timedelta(days=14)
    att_act = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.created_at >= cutoff_14d,
        )
        .count()
    )
    ticket_act = (
        db.query(HelpdeskTicket)
        .filter(
            HelpdeskTicket.student_id == student_id,
            HelpdeskTicket.created_at >= cutoff_14d,
        )
        .count()
    )
    canteen_act = (
        db.query(CanteenOrder)
        .filter(
            CanteenOrder.student_id == student_id,
            CanteenOrder.created_at >= cutoff_14d,
        )
        .count()
    )
    recent_activity = att_act + ticket_act + canteen_act

    features = AcademicFeatures(
        attendance_percent=round(overall_attendance, 1),
        attendance_trend_30d=round(attendance_trend, 1),
        marks_average=round(marks_average, 1),
        marks_trend=round(marks_trend, 1),
        assignment_submission_rate=submission_rate,
        recent_activity_count=recent_activity,
    )
    return features, course_diagnostics


def generate_explainable_factors(
    features: AcademicFeatures,
    course_diagnostics: list[dict[str, Any]],
) -> list[RiskFactorOut]:
    """Generate human-interpretable risk factors from academic indicators."""
    factors: list[RiskFactorOut] = []

    # Check course-level attendance alerts (university 75% rule)
    for c in course_diagnostics:
        c_att = c["attendance_percent"]
        code = c["course_code"]
        name = c["course_name"]
        if c_att < 75.0:
            severity = "Critical" if c_att < 65.0 else "High"
            deficit_classes = max(1, int((75.0 * c["total"] - 100.0 * c["attended"]) / 25.0) + 1)
            factors.append(
                RiskFactorOut(
                    factor=f"Detention Risk in {code} ({name})",
                    severity=severity,
                    description=f"Attendance is {c_att:.1f}% (below 75% threshold). Student must attend the next {deficit_classes} consecutive classes to regain exam eligibility.",
                )
            )

    # Overall attendance check
    if features.attendance_percent < 75.0 and not any(
        "Detention Risk" in f.factor for f in factors
    ):
        factors.append(
            RiskFactorOut(
                factor="Aggregate Attendance Below 75%",
                severity="High",
                description=f"Aggregate attendance is {features.attendance_percent:.1f}%. Immediate counseling recommended.",
            )
        )

    # Attendance trend check
    if features.attendance_trend_30d < -6.0:
        factors.append(
            RiskFactorOut(
                factor="Negative 30-Day Attendance Trajectory",
                severity="Medium",
                description=f"Attendance has dropped by {abs(features.attendance_trend_30d):.1f}% over the last 30 calendar days.",
            )
        )

    # Marks check
    if features.marks_average < 55.0:
        factors.append(
            RiskFactorOut(
                factor="Low Assessment Performance",
                severity="High" if features.marks_average < 45.0 else "Medium",
                description=f"Cumulative assessment score of {features.marks_average:.1f}% indicates academic distress.",
            )
        )

    # Marks trend check
    if features.marks_trend < -8.0:
        factors.append(
            RiskFactorOut(
                factor="Declining Test Performance",
                severity="Medium",
                description=f"Recent assessment marks have fallen by {abs(features.marks_trend):.1f}% compared to earlier evaluations.",
            )
        )

    # Submission rate check
    if features.assignment_submission_rate < 0.70:
        factors.append(
            RiskFactorOut(
                factor="Coursework Submission Deficit",
                severity="Medium",
                description=f"Coursework submission rate is {features.assignment_submission_rate * 100:.0f}%, signaling incomplete assignments.",
            )
        )

    # If no risk factors detected, provide a positive standing summary
    if not factors:
        factors.append(
            RiskFactorOut(
                factor="Healthy Academic Standing",
                severity="Low",
                description="Attendance and assessment metrics meet all institutional standards with no detention risk detected.",
            )
        )

    return factors


# ── Core Evaluation & Prediction ──────────────────────────────────────────────
def evaluate_student(
    student_id: UUID,
    db: Session,
    save_db: bool = True,
) -> EarlyWarningPredictionOut:
    """Run the early warning ML model on a student and optionally persist the prediction."""
    profile = db.query(Profile).filter_by(id=student_id).first()
    if not profile:
        raise NotFoundError("Student profile not found.")

    student = db.query(Student).filter_by(profile_id=student_id).first()
    dept = profile.department if profile else None

    features, course_diagnostics = extract_student_academic_features(student_id, db)
    has_course_detention = any(c["attendance_percent"] < 75.0 for c in course_diagnostics)
    risk_level, probability = _ml_engine.predict_risk(
        features, has_course_detention_risk=has_course_detention
    )
    factors = generate_explainable_factors(features, course_diagnostics)

    factors_payload = {
        "factors": [f.model_dump(by_alias=True) for f in factors],
        "academic_signals": features.model_dump(by_alias=True),
    }

    prediction_record: AIPrediction | None = None
    if save_db:
        # Check if an existing prediction exists
        prediction_record = db.query(AIPrediction).filter_by(student_id=student_id).first()
        if prediction_record:
            prediction_record.model_version = MODEL_VERSION
            prediction_record.risk_level = risk_level
            prediction_record.probability = probability
            prediction_record.factors_json = json.dumps(factors_payload)
        else:
            prediction_record = AIPrediction(
                student_id=student_id,
                model_version=MODEL_VERSION,
                risk_level=risk_level,
                probability=probability,
                factors_json=json.dumps(factors_payload),
            )
            db.add(prediction_record)
        db.flush()
        db.commit()
        pred_id = prediction_record.id
        created_at = prediction_record.created_at
    else:
        pred_id = UUID("00000000-0000-0000-0000-000000000000")
        created_at = datetime.now(UTC)

    return EarlyWarningPredictionOut(
        id=pred_id,
        student_id=student_id,
        student_name=profile.name,
        roll_number=student.roll_number if student else None,
        department=dept.name if dept else None,
        model_version=MODEL_VERSION,
        risk_level=risk_level,
        probability=probability,
        factors=factors,
        academic_signals=features,
        is_support_signal_only=True,
        disclaimer="Support signal, not an automated decision. Human faculty/counselor review is required before taking any institutional action.",
        created_at=created_at,
    )


def get_student_prediction(student_id: UUID, db: Session) -> EarlyWarningPredictionOut:
    """Retrieve existing prediction or run evaluate if not yet predicted."""
    pred = db.query(AIPrediction).filter_by(student_id=student_id).first()
    if not pred:
        return evaluate_student(student_id, db, save_db=True)

    profile = db.query(Profile).filter_by(id=student_id).first()
    student = db.query(Student).filter_by(profile_id=student_id).first()
    dept = profile.department if profile else None

    try:
        data = json.loads(pred.factors_json)
        raw_factors = data.get("factors", [])
        factors = [RiskFactorOut(**f) for f in raw_factors]
        raw_signals = data.get("academic_signals", {})
        academic_signals = AcademicFeatures(**raw_signals)
    except Exception:
        # Fallback to fresh extraction if JSON parsing fails
        features, course_diag = extract_student_academic_features(student_id, db)
        academic_signals = features
        factors = generate_explainable_factors(features, course_diag)

    return EarlyWarningPredictionOut(
        id=pred.id,
        student_id=student_id,
        student_name=profile.name if profile else None,
        roll_number=student.roll_number if student else None,
        department=dept.name if dept else None,
        model_version=pred.model_version,
        risk_level=pred.risk_level,
        probability=pred.probability,
        factors=factors,
        academic_signals=academic_signals,
        is_support_signal_only=True,
        disclaimer="Support signal, not an automated decision. Human faculty/counselor review is required before taking any institutional action.",
        created_at=pred.created_at,
    )


def get_at_risk_students(
    db: Session,
    min_risk_level: str = "Medium",
    department_code: str | None = None,
) -> list[AtRiskStudentSummaryOut]:
    """List students meeting or exceeding the specified risk threshold."""
    level_order = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    min_score = level_order.get(min_risk_level, 1)

    students_query = db.query(Student).join(Profile, Student.profile_id == Profile.id)
    if department_code:
        dept = db.query(Department).filter_by(code=department_code.upper()).first()
        if dept:
            students_query = students_query.filter(Profile.department_id == dept.id)

    students = students_query.all()
    results: list[AtRiskStudentSummaryOut] = []

    for st in students:
        pred_out = get_student_prediction(st.profile_id, db)
        score = level_order.get(pred_out.risk_level, 0)
        if score >= min_score:
            profile = db.query(Profile).filter_by(id=st.profile_id).first()
            dept = profile.department if profile else None

            # Check if active intervention exists
            active_inv = (
                db.query(Intervention)
                .join(AIPrediction)
                .filter(
                    AIPrediction.student_id == st.profile_id,
                    Intervention.status.in_(["Pending", "In Progress"]),
                )
                .first()
            )

            top_factor = pred_out.factors[0].factor if pred_out.factors else "No factors recorded"

            results.append(
                AtRiskStudentSummaryOut(
                    student_id=st.profile_id,
                    student_name=profile.name if profile else "Unknown",
                    roll_number=st.roll_number,
                    department=dept.name if dept else "N/A",
                    semester=st.semester,
                    risk_level=pred_out.risk_level,
                    probability=pred_out.probability,
                    top_risk_factor=top_factor,
                    has_active_intervention=active_inv is not None,
                    evaluated_at=pred_out.created_at,
                )
            )

    # Sort newest / highest risk first
    results.sort(key=lambda r: level_order.get(r.risk_level, 0), reverse=True)
    return results


def batch_evaluate_students(
    db: Session,
    department_code: str | None = None,
) -> BatchEvaluationResultOut:
    """Batch re-evaluate students across a department or the whole campus."""
    query = db.query(Student).join(Profile, Student.profile_id == Profile.id)
    if department_code:
        dept = db.query(Department).filter_by(code=department_code.upper()).first()
        if dept:
            query = query.filter(Profile.department_id == dept.id)

    students = query.all()
    counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}

    for st in students:
        pred = evaluate_student(st.profile_id, db, save_db=True)
        counts[pred.risk_level] = counts.get(pred.risk_level, 0) + 1

    at_risk_count = counts["Critical"] + counts["High"] + counts["Medium"]

    return BatchEvaluationResultOut(
        evaluated_count=len(students),
        at_risk_count=at_risk_count,
        critical_count=counts["Critical"],
        high_count=counts["High"],
        medium_count=counts["Medium"],
        low_count=counts["Low"],
    )


# ── Interventions ─────────────────────────────────────────────────────────────
def create_intervention(
    prediction_id: UUID,
    notes: str,
    owner: Profile,
    db: Session,
) -> InterventionOut:
    """Create an academic support intervention for an at-risk prediction."""
    pred = db.query(AIPrediction).filter_by(id=prediction_id).first()
    if not pred:
        raise NotFoundError("Early warning prediction not found.")

    intervention = Intervention(
        prediction_id=prediction_id,
        notes=notes,
        owner_id=owner.id,
        status="Pending",
    )
    db.add(intervention)
    db.flush()

    # Log to audit trail
    log_action(
        db,
        actor_id=str(owner.id),
        actor_role=owner.role,
        action="INTERVENTION_CREATED",
        target_entity="Intervention",
        entity_id=str(intervention.id),
        details=f"Created {pred.risk_level} risk intervention for student {pred.student_id}. Notes: {notes[:100]}",
    )
    db.commit()

    student_profile = db.query(Profile).filter_by(id=pred.student_id).first()
    student_obj = db.query(Student).filter_by(profile_id=pred.student_id).first()

    return InterventionOut(
        id=intervention.id,
        prediction_id=prediction_id,
        student_id=pred.student_id,
        student_name=student_profile.name if student_profile else "Student",
        roll_number=student_obj.roll_number if student_obj else None,
        status=intervention.status,
        notes=intervention.notes,
        owner_id=owner.id,
        owner_name=owner.name,
        risk_level=pred.risk_level,
        created_at=intervention.created_at,
        updated_at=intervention.updated_at,
    )


def update_intervention(
    intervention_id: UUID,
    status: str,
    notes: str | None,
    actor: Profile,
    db: Session,
) -> InterventionOut:
    """Update status and notes of an intervention."""
    inv = db.query(Intervention).filter_by(id=intervention_id).first()
    if not inv:
        raise NotFoundError("Intervention not found.")

    inv.status = status
    if notes:
        timestamp_prefix = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")
        inv.notes = f"{inv.notes}\n[{timestamp_prefix} by {actor.name}]: {notes}"
    inv.updated_at = datetime.now(UTC)

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="INTERVENTION_UPDATED",
        target_entity="Intervention",
        entity_id=str(inv.id),
        details=f"Updated intervention status to {status}.",
    )
    db.commit()

    pred = db.query(AIPrediction).filter_by(id=inv.prediction_id).first()
    student_profile = db.query(Profile).filter_by(id=pred.student_id).first() if pred else None
    student_obj = db.query(Student).filter_by(profile_id=pred.student_id).first() if pred else None
    owner = db.query(Profile).filter_by(id=inv.owner_id).first()

    return InterventionOut(
        id=inv.id,
        prediction_id=inv.prediction_id,
        student_id=pred.student_id if pred else UUID("00000000-0000-0000-0000-000000000000"),
        student_name=student_profile.name if student_profile else "Student",
        roll_number=student_obj.roll_number if student_obj else None,
        status=inv.status,
        notes=inv.notes,
        owner_id=inv.owner_id,
        owner_name=owner.name if owner else "Faculty/Staff",
        risk_level=pred.risk_level if pred else "Unknown",
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )


def list_interventions(
    db: Session,
    student_id: UUID | None = None,
    status: str | None = None,
) -> list[InterventionOut]:
    """List academic interventions with optional filters."""
    query = db.query(Intervention).join(AIPrediction)
    if student_id:
        query = query.filter(AIPrediction.student_id == student_id)
    if status:
        query = query.filter(Intervention.status == status)

    interventions = query.order_by(Intervention.created_at.desc()).all()
    results: list[InterventionOut] = []

    for inv in interventions:
        pred = db.query(AIPrediction).filter_by(id=inv.prediction_id).first()
        student_profile = db.query(Profile).filter_by(id=pred.student_id).first() if pred else None
        student_obj = (
            db.query(Student).filter_by(profile_id=pred.student_id).first() if pred else None
        )
        owner = db.query(Profile).filter_by(id=inv.owner_id).first()

        results.append(
            InterventionOut(
                id=inv.id,
                prediction_id=inv.prediction_id,
                student_id=pred.student_id
                if pred
                else UUID("00000000-0000-0000-0000-000000000000"),
                student_name=student_profile.name if student_profile else "Student",
                roll_number=student_obj.roll_number if student_obj else None,
                status=inv.status,
                notes=inv.notes,
                owner_id=inv.owner_id,
                owner_name=owner.name if owner else "Faculty/Staff",
                risk_level=pred.risk_level if pred else "Unknown",
                created_at=inv.created_at,
                updated_at=inv.updated_at,
            )
        )
    return results


# ── Learning Resources & Recommendations ──────────────────────────────────────
def list_student_recommendations(student_id: UUID, db: Session) -> list[RecommendationOut]:
    """Retrieve personalized learning recommendations for a student."""
    recs = db.query(Recommendation).filter_by(student_id=student_id).all()
    results: list[RecommendationOut] = []
    for r in recs:
        res = db.query(LearningResource).filter_by(id=r.resource_id).first()
        if res:
            results.append(
                RecommendationOut(
                    id=r.id,
                    student_id=r.student_id,
                    resource=LearningResourceOut(
                        id=res.id,
                        title=res.title,
                        url=res.url,
                        tags=res.tags,
                        difficulty=res.difficulty,
                    ),
                    reason=r.reason,
                    status=r.status,
                    created_at=r.created_at,
                )
            )
    return results


def generate_recommendations_for_student(student_id: UUID, db: Session) -> list[RecommendationOut]:
    """Analyze academic diagnostics and automatically link curated resources."""
    features, diagnostics = extract_student_academic_features(student_id, db)
    resources = db.query(LearningResource).all()

    existing_rec_res_ids = {
        r.resource_id for r in db.query(Recommendation).filter_by(student_id=student_id).all()
    }

    new_recs: list[Recommendation] = []

    # Check for weak courses in diagnostics
    for diag in diagnostics:
        code = diag["course_code"].upper()
        att = diag["attendance_percent"]

        # If attendance is low, suggest targeted course revision
        if att < 80.0:
            matching_res = [
                res
                for res in resources
                if code in res.tags.upper() and res.id not in existing_rec_res_ids
            ]
            for match in matching_res:
                rec = Recommendation(
                    student_id=student_id,
                    resource_id=match.id,
                    reason=f"Recommended for {code} reinforcement due to current attendance ({att:.1f}%).",
                    status="Active",
                )
                db.add(rec)
                new_recs.append(rec)
                existing_rec_res_ids.add(match.id)

    # If general resources exist and student has no recommendations, add foundational ones
    if not existing_rec_res_ids and resources:
        for res in resources[:2]:
            rec = Recommendation(
                student_id=student_id,
                resource_id=res.id,
                reason="Core foundational engineering reference material.",
                status="Active",
            )
            db.add(rec)
            new_recs.append(rec)
            existing_rec_res_ids.add(res.id)

    if new_recs:
        db.flush()
        db.commit()

    return list_student_recommendations(student_id, db)
