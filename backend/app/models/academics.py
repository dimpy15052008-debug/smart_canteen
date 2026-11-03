"""Academics domain models: Program, Course, Room, CourseOffering, TimetableSlot, Enrollment."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    pass


class Program(Base, UUIDPrimaryKey, TimestampMixin):
    """Academic program (e.g. B.Tech Computer Science)."""

    __tablename__ = "programs"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    duration_years: Mapped[int] = mapped_column(Integer, default=4, nullable=False)


class Room(Base, UUIDPrimaryKey, TimestampMixin):
    """Campus room with geofencing coordinates."""

    __tablename__ = "rooms"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    building: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geofence_radius_m: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)


class Course(Base, UUIDPrimaryKey, TimestampMixin):
    """University course."""

    __tablename__ = "courses"

    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    semester: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    offerings: Mapped[list[CourseOffering]] = relationship(back_populates="course")


class CourseOffering(Base, UUIDPrimaryKey, TimestampMixin):
    """Specific term offering of a course taught by a faculty member."""

    __tablename__ = "course_offerings"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    faculty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2025-2026")
    semester: Mapped[int] = mapped_column(Integer, nullable=False)

    course: Mapped[Course] = relationship(back_populates="offerings")
    timetable_slots: Mapped[list[TimetableSlot]] = relationship(back_populates="offering")
    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="offering")


class TimetableSlot(Base, UUIDPrimaryKey, TimestampMixin):
    """Weekly schedule slot for a course offering."""

    __tablename__ = "timetable_slots"

    offering_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_offerings.id"), nullable=False, index=True
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False, index=True
    )
    day_of_week: Mapped[str] = mapped_column(String(20), nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)

    offering: Mapped[CourseOffering] = relationship(back_populates="timetable_slots")
    room: Mapped[Room] = relationship()


class Enrollment(Base, UUIDPrimaryKey, TimestampMixin):
    """Student enrollment in a course offering."""

    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "offering_id", name="uq_student_offering"),)

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    offering_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_offerings.id"), nullable=False, index=True
    )
    total_classes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attended_classes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    attendance_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    syllabus_covered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    offering: Mapped[CourseOffering] = relationship(back_populates="enrollments")
