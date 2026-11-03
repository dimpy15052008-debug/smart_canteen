"""Academics and attendance student endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.deps import CurrentUser, DbDep
from app.schemas.academics import (
    AttendanceRecordOut,
    AttendanceSummaryOut,
    CourseScheduleOut,
    ExamRecordOut,
)
from app.services import academic_service

router = APIRouter(prefix="/api/v1/academics", tags=["academics"])


@router.get("/courses/me", response_model=list[CourseScheduleOut])
def get_my_courses(user: CurrentUser, db: DbDep):
    """Retrieve enrolled courses and schedules for the logged in student."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    return academic_service.get_student_courses(user_id, db)


@router.get("/exams/me", response_model=list[ExamRecordOut])
def get_my_exams(user: CurrentUser, db: DbDep):
    """Retrieve exam schedules, seating allocations, and venues for the logged in student."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    return academic_service.get_student_exams(user_id, db)


@router.get("/attendance/summary/me", response_model=AttendanceSummaryOut)
def get_my_attendance_summary(user: CurrentUser, db: DbDep):
    """Retrieve aggregate attendance percentage, at-risk count, and per-course breakdown."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    return academic_service.get_student_attendance_summary(user_id, db)


@router.get("/attendance/history/me", response_model=list[AttendanceRecordOut])
def get_my_attendance_history(user: CurrentUser, db: DbDep):
    """Retrieve recent attendance verification log records for the logged in student."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    return academic_service.get_student_attendance_history(user_id, db)
