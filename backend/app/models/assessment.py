"""Assessment domain models: Exam, ExamSeat, Assessment, AssessmentScore."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class Exam(Base, UUIDPrimaryKey, TimestampMixin):
    """University examination schedule."""

    __tablename__ = "exams"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    exam_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # exam_type: Mid Term, End Semester, Quiz, Practical
    exam_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)
    hall: Mapped[str] = mapped_column(String(100), nullable=False)
    max_marks: Mapped[int] = mapped_column(Integer, default=100, nullable=False)

    seats: Mapped[list[ExamSeat]] = relationship(back_populates="exam")


class ExamSeat(Base, UUIDPrimaryKey, TimestampMixin):
    """Assigned seat for a student in an exam."""

    __tablename__ = "exam_seats"
    __table_args__ = (UniqueConstraint("exam_id", "student_id", name="uq_exam_student_seat"),)

    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    seat_number: Mapped[str] = mapped_column(String(30), nullable=False)
    marks_obtained: Mapped[float | None] = mapped_column(Float, nullable=True)

    exam: Mapped[Exam] = relationship(back_populates="seats")


class Assessment(Base, UUIDPrimaryKey, TimestampMixin):
    """Course coursework/assignment/quiz."""

    __tablename__ = "assessments"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    assessment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # assignment, quiz, mid, end, lab
    max_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    topic_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)


class AssessmentScore(Base, UUIDPrimaryKey, TimestampMixin):
    """Individual student score for an assessment."""

    __tablename__ = "assessment_scores"
    __table_args__ = (
        UniqueConstraint("assessment_id", "student_id", name="uq_assessment_student"),
    )

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, nullable=False)
    submitted_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
