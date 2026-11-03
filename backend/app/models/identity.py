"""Identity domain models: Profile, Department, Student, Faculty."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    pass  # Avoid circular imports in type hints


class Department(Base, UUIDPrimaryKey, TimestampMixin):
    """University department."""

    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)

    profiles: Mapped[list[Profile]] = relationship(back_populates="department")


class Profile(Base, TimestampMixin):
    """Universal user profile. id = Supabase auth user id (or local UUID in dev mode)."""

    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    # role must be one of: student, faculty, admin, canteen, parent
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    staff_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Password hash (only used in AUTH_MODE=dev)
    hashed_password: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Foreign key to department
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True, index=True
    )
    department: Mapped[Department | None] = relationship(back_populates="profiles")

    # Optional designation (used for faculty / admin display)
    designation: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Back-references (optional — populated from child tables)
    student: Mapped[Student | None] = relationship(back_populates="profile", uselist=False)
    faculty: Mapped[Faculty | None] = relationship(back_populates="profile", uselist=False)

    def __repr__(self) -> str:
        return f"<Profile id={self.id} email={self.email} role={self.role}>"


class Student(Base, UUIDPrimaryKey, TimestampMixin):
    """Extended student-specific fields, linked 1-to-1 with Profile."""

    __tablename__ = "students"

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), unique=True, nullable=False, index=True
    )
    profile: Mapped[Profile] = relationship(back_populates="student")

    roll_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    enrollment_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    program: Mapped[str] = mapped_column(String(200), nullable=False)
    batch: Mapped[str] = mapped_column(String(20), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    cgpa: Mapped[float | None] = mapped_column(Numeric(4, 2), nullable=True)

    # Accommodation
    hostel_room_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hostel_rooms.id"), nullable=True
    )
    bus_route_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bus_routes.id"), nullable=True
    )

    def __repr__(self) -> str:
        return f"<Student roll={self.roll_number} program={self.program}>"


class Faculty(Base, UUIDPrimaryKey, TimestampMixin):
    """Extended faculty-specific fields."""

    __tablename__ = "faculty"

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), unique=True, nullable=False, index=True
    )
    profile: Mapped[Profile] = relationship(back_populates="faculty")

    cabin_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employee_id: Mapped[str | None] = mapped_column(
        String(50), unique=True, nullable=True, index=True
    )

    def __repr__(self) -> str:
        return f"<Faculty profile_id={self.profile_id}>"


class Parent(Base, UUIDPrimaryKey, TimestampMixin):
    """Parent profile details."""

    __tablename__ = "parents"

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), unique=True, nullable=False, index=True
    )
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)


class ParentStudentLink(Base, UUIDPrimaryKey, TimestampMixin):
    """Relationship linking parents to students."""

    __tablename__ = "parent_student_links"

    parent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("parents.id"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), nullable=False, index=True
    )
    relationship_type: Mapped[str] = mapped_column(String(30), default="Father", nullable=False)
