"""Attendance schemas for Smart Attend (sessions, geofenced marking, biometric verification, overrides)."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.academics import AttendanceRecordOut
from app.schemas.base import CamelModel


class CreateSessionIn(CamelModel):
    """Faculty request to create an attendance session window."""

    course_id: uuid.UUID | None = None
    course_code: str | None = None
    room_id: uuid.UUID | None = None
    duration_minutes: int = Field(default=15, ge=1, le=120)


class AttendanceSessionOut(CamelModel):
    """Attendance session details."""

    id: uuid.UUID
    course_id: uuid.UUID
    course_code: str
    course_name: str
    faculty_id: uuid.UUID
    faculty_name: str
    room_id: uuid.UUID
    room_name: str
    code: str
    opens_at: datetime
    expires_at: datetime
    status: str
    records_count: int = 0
    present_count: int = 0


class MarkAttendanceIn(CamelModel):
    """Student request to verify and mark attendance."""

    session_id: uuid.UUID | None = None
    session_code: str | None = None
    course_id: str | None = None  # UUID string or code like 'CS601'
    latitude: float
    longitude: float
    accuracy: float | None = 5.0
    face_confidence: float | None = 98.6
    liveness_verified: bool = True
    notes: str | None = None


class MarkAttendanceResponse(CamelModel):
    """Response returned upon marking attendance."""

    success: bool
    record: AttendanceRecordOut
    message: str
    geofence_distance_m: float
    geofence_passed: bool
    biometric_passed: bool


class ManualOverrideIn(CamelModel):
    """Faculty / Admin manual attendance override."""

    student_id: uuid.UUID | None = None
    roll_number: str | None = None
    session_id: uuid.UUID | None = None
    course_code: str | None = None
    status: Literal["present", "manual_override", "absent"] = "manual_override"
    reason: str


class SessionRosterOut(CamelModel):
    """Live classroom roster for an attendance session."""

    session: AttendanceSessionOut
    records: list[AttendanceRecordOut]
