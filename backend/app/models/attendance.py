"""Attendance domain models: AttendanceSession, AttendanceRecord."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class AttendanceSession(Base, UUIDPrimaryKey, TimestampMixin):
    """Live attendance session created by faculty."""

    __tablename__ = "attendance_sessions"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    faculty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False, index=True
    )
    opens_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    # status: active, closed, expired

    records: Mapped[list[AttendanceRecord]] = relationship(back_populates="session")


class AttendanceRecord(Base, UUIDPrimaryKey, TimestampMixin):
    """Attendance verification record for a student in a session."""

    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("session_id", "student_id", name="uq_session_student"),)

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attendance_sessions.id"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    # status: present, absent, failed, manual_override

    verification_method: Mapped[str] = mapped_column(
        String(50), default="geo_face_liveness", nullable=False
    )
    # verification_method: geo_face_liveness, manual_faculty

    location_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    accuracy_m: Mapped[float | None] = mapped_column(Float, nullable=True)

    face_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    liveness_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrected_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True
    )
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped[AttendanceSession] = relationship(back_populates="records")
