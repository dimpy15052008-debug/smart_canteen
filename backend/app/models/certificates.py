"""Certificates domain models: CertificateRequest."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class CertificateRequest(Base, UUIDPrimaryKey, TimestampMixin):
    """Digital certificate application with public verification support."""

    __tablename__ = "certificate_requests"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    certificate_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Bonafide Certificate, Course Completion, Transcript, Character Certificate
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), default="2025-2026", nullable=False)

    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False, index=True)
    # status: pending, approved, rejected, ready_for_download

    eligibility_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    verified_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    verification_code: Mapped[str | None] = mapped_column(
        String(60), unique=True, nullable=True, index=True
    )
    document_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(300), nullable=True)
