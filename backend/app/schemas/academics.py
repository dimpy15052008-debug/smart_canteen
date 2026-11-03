"""Academics, timetable, exam, and attendance schemas.

Matches the frontend TypeScript interfaces: CourseSchedule, ExamRecord, AttendanceRecord.
"""

from __future__ import annotations

from typing import Literal

from app.schemas.base import CamelModel


class CourseScheduleOut(CamelModel):
    """Course schedule card with attendance stats."""

    id: str
    code: str
    name: str
    faculty: str
    credits: int
    room: str
    day: str
    start_time: str
    end_time: str
    total_classes: int
    attended_classes: int
    attendance_percent: float
    syllabus_covered: int
    is_current_class: bool = False


class ExamRecordOut(CamelModel):
    """Exam seating and schedule record."""

    id: str
    course_code: str
    course_name: str
    exam_type: str
    date: str
    time: str
    hall_number: str
    seat_number: str
    max_marks: int
    obtained_marks: float | None = None
    grade: str | None = None
    status: str = "Upcoming"


class CoordinatesOut(CamelModel):
    lat: float
    lng: float
    accuracy: float


class AttendanceRecordOut(CamelModel):
    """Detailed verification record for a class attendance event."""

    id: str
    student_id: str
    student_name: str
    roll_number: str
    course_id: str
    course_name: str
    faculty_id: str
    date: str
    time: str
    status: Literal["present", "absent", "failed", "manual_override"]
    verification_method: Literal["geo_face_liveness", "manual_faculty"]
    location_verified: bool
    coordinates: CoordinatesOut | None = None
    face_confidence: float
    liveness_verified: bool
    notes: str | None = None
    corrected_by: str | None = None
    corrected_at: str | None = None


class AttendanceSummaryOut(CamelModel):
    """Overall attendance metrics and warnings."""

    overall_percentage: float
    total_classes: int
    attended_classes: int
    at_risk_count: int
    minimum_required: float = 75.0
    courses: list[CourseScheduleOut]
