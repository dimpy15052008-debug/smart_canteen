"""Students router — personal dashboard and student entity endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbDep
from app.services import academic_service, auth_service

router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("/me")
def get_student_dashboard(user: CurrentUser, db: DbDep):
    """Retrieve full student dashboard profile and academic overview."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    profile_out = auth_service.profile_to_response(user, db)
    attendance_summary = academic_service.get_student_attendance_summary(user_id, db)
    exams = academic_service.get_student_exams(user_id, db)

    return {
        "profile": profile_out,
        "attendance": attendance_summary,
        "upcomingExams": exams[:3],
    }
