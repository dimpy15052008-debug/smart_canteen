"""ML Early Warning and Student Support API Router.

Endpoints
---------
GET   /api/v1/ml/early-warning/me                     — Student views own early warning assessment
GET   /api/v1/ml/early-warning/students/{student_id}  — Faculty/Admin (or self) views student assessment
POST  /api/v1/ml/early-warning/evaluate/{student_id}  — Faculty/Admin triggers fresh ML re-evaluation
POST  /api/v1/ml/early-warning/batch-evaluate         — Faculty/Admin batch evaluates student cohort
GET   /api/v1/ml/early-warning/at-risk                — Faculty/Admin lists at-risk students
POST  /api/v1/ml/interventions                        — Faculty/Admin creates academic intervention
GET   /api/v1/ml/interventions                        — List interventions (student sees own, staff sees all)
PATCH /api/v1/ml/interventions/{id}                   — Faculty/Admin updates intervention status/notes
GET   /api/v1/ml/recommendations/me                   — Student views personalized recommendations
GET   /api/v1/ml/recommendations/students/{student_id}— Faculty/Admin views recommendations for student
POST  /api/v1/ml/recommendations/generate/{student_id}— Faculty/Admin generates remediation recommendations
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUser, DbDep
from app.core.errors import ForbiddenError
from app.schemas.ml import (
    AtRiskStudentSummaryOut,
    BatchEvaluationResultOut,
    CreateInterventionIn,
    EarlyWarningPredictionOut,
    InterventionOut,
    RecommendationOut,
    UpdateInterventionIn,
)
from app.services import ml_service

router = APIRouter(prefix="/api/v1/ml", tags=["ml-early-warning"])


def _require_faculty_or_admin(user: CurrentUser) -> None:
    """Ensure user is faculty, counselor, or admin."""
    if user.role not in ("faculty", "admin"):
        raise ForbiddenError("Faculty or Administrator access required.")


@router.get("/early-warning/me", response_model=EarlyWarningPredictionOut)
def get_my_early_warning(user: CurrentUser, db: DbDep):
    """Retrieve the authenticated student's ML early warning assessment."""
    return ml_service.get_student_prediction(user.id, db)


@router.get("/early-warning/students/{student_id}", response_model=EarlyWarningPredictionOut)
def get_student_early_warning(student_id: UUID, user: CurrentUser, db: DbDep):
    """Retrieve a specific student's ML early warning assessment.
    Students can only view their own profile; faculty and admin can view any student.
    """
    if user.role not in ("faculty", "admin") and user.id != student_id:
        raise ForbiddenError("You may only access your own academic assessment.")
    return ml_service.get_student_prediction(student_id, db)


@router.post("/early-warning/evaluate/{student_id}", response_model=EarlyWarningPredictionOut)
def evaluate_student(student_id: UUID, user: CurrentUser, db: DbDep):
    """Trigger an on-demand ML evaluation and save the prediction. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.evaluate_student(student_id, db, save_db=True)


@router.post("/early-warning/batch-evaluate", response_model=BatchEvaluationResultOut)
def batch_evaluate_students(
    user: CurrentUser,
    db: DbDep,
    department: str | None = Query(None, description="Department code, e.g. CSE"),
):
    """Batch re-evaluate students across a department or the whole campus. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.batch_evaluate_students(db, department_code=department)


@router.get("/early-warning/at-risk", response_model=list[AtRiskStudentSummaryOut])
def get_at_risk_students(
    user: CurrentUser,
    db: DbDep,
    min_risk_level: str = Query(
        "Medium", description="Minimum risk level: Low, Medium, High, or Critical"
    ),
    department: str | None = Query(None, description="Department code, e.g. CSE"),
):
    """Retrieve students flagged by the ML early warning engine. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.get_at_risk_students(
        db,
        min_risk_level=min_risk_level,
        department_code=department,
    )


# ── Interventions ─────────────────────────────────────────────────────────────
@router.post("/interventions", response_model=InterventionOut, status_code=status.HTTP_201_CREATED)
def create_intervention(
    payload: CreateInterventionIn,
    user: CurrentUser,
    db: DbDep,
):
    """Create an academic or wellbeing support intervention for an at-risk student. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.create_intervention(
        prediction_id=payload.prediction_id,
        notes=payload.notes,
        owner=user,
        db=db,
    )


@router.get("/interventions", response_model=list[InterventionOut])
def list_interventions(
    user: CurrentUser,
    db: DbDep,
    student_id: UUID | None = Query(None, description="Filter by student ID"),
    status: str | None = Query(
        None, description="Filter by status: Pending, In Progress, Resolved"
    ),
):
    """List academic interventions. Students only see their own interventions."""
    effective_student_id = student_id
    if user.role not in ("faculty", "admin"):
        effective_student_id = user.id

    return ml_service.list_interventions(
        db=db,
        student_id=effective_student_id,
        status=status,
    )


@router.patch("/interventions/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: UUID,
    payload: UpdateInterventionIn,
    user: CurrentUser,
    db: DbDep,
):
    """Update intervention status and notes. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.update_intervention(
        intervention_id=intervention_id,
        status=payload.status,
        notes=payload.notes,
        actor=user,
        db=db,
    )


# ── Recommendations ───────────────────────────────────────────────────────────
@router.get("/recommendations/me", response_model=list[RecommendationOut])
def get_my_recommendations(user: CurrentUser, db: DbDep):
    """Retrieve personalized learning recommendations for the current student."""
    return ml_service.list_student_recommendations(user.id, db)


@router.get("/recommendations/students/{student_id}", response_model=list[RecommendationOut])
def get_student_recommendations(student_id: UUID, user: CurrentUser, db: DbDep):
    """Retrieve personalized learning recommendations for a student. Faculty/Admin or self."""
    if user.role not in ("faculty", "admin") and user.id != student_id:
        raise ForbiddenError("You may only access your own learning recommendations.")
    return ml_service.list_student_recommendations(student_id, db)


@router.post("/recommendations/generate/{student_id}", response_model=list[RecommendationOut])
def generate_recommendations(student_id: UUID, user: CurrentUser, db: DbDep):
    """Automatically generate learning recommendations based on student academic signals. Faculty/Admin only."""
    _require_faculty_or_admin(user)
    return ml_service.generate_recommendations_for_student(student_id, db)
