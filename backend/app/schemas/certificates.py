"""Certificate domain schemas (Pydantic v2 / camelCase)."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

# ── Request bodies ─────────────────────────────────────────────────────────────


class RequestCertificateIn(CamelModel):
    certificate_type: str = Field(
        ...,
        description=(
            "One of: Bonafide Certificate, Course Completion Certificate, "
            "Official Transcript, Character Certificate"
        ),
        examples=["Bonafide Certificate"],
    )
    purpose: str = Field(..., min_length=10, max_length=500)
    academic_year: str = Field(default="2025-2026", pattern=r"^\d{4}-\d{4}$")


class ApproveRejectIn(CamelModel):
    action: str = Field(..., pattern=r"^(approve|reject)$")
    remarks: str | None = Field(default=None, max_length=500)


# ── Response bodies ────────────────────────────────────────────────────────────


class EligibilityDetail(CamelModel):
    rule: str
    passed: bool
    detail: str


class CertificateRequestOut(CamelModel):
    id: UUID
    student_id: UUID
    certificate_type: str
    purpose: str
    academic_year: str
    status: str
    eligibility_checks: list[EligibilityDetail] = Field(default_factory=list)
    verification_code: str | None = None
    document_hash: str | None = None
    approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class PublicVerifyOut(CamelModel):
    valid: bool
    certificate_type: str | None = None
    student_name: str | None = None
    roll_number: str | None = None
    academic_year: str | None = None
    issued_at: datetime | None = None
    document_hash: str | None = None
    message: str
