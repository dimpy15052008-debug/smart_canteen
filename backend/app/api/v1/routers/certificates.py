"""Certificates API router.

Endpoints
---------
POST   /api/v1/certificates/request        — student requests a certificate
GET    /api/v1/certificates/me             — list own requests
POST   /api/v1/certificates/{id}/action    — admin/faculty approve or reject
GET    /api/v1/certificates/{id}/download  — download PDF (student/admin/faculty)
GET    /api/v1/certificates/verify/{code}  — public QR-code verification (no auth)
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Request
from fastapi.responses import Response

from app.core.deps import CurrentUser, DbDep
from app.core.errors import ForbiddenError
from app.schemas.certificates import (
    ApproveRejectIn,
    CertificateRequestOut,
    PublicVerifyOut,
    RequestCertificateIn,
)
from app.services import certificate_service

router = APIRouter(prefix="/api/v1/certificates", tags=["certificates"])


def _base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


# ── Student: request a certificate ────────────────────────────────────────────


@router.post("/request", response_model=CertificateRequestOut, status_code=201)
def request_certificate(
    body: RequestCertificateIn,
    request: Request,
    user: CurrentUser,
    db: DbDep,
):
    """Submit a new certificate request. Eligibility is evaluated immediately."""
    if user.role != "student":
        raise ForbiddenError("Only students can request certificates.")
    return certificate_service.request_certificate(
        profile=user, body=body, db=db, base_url=_base_url(request)
    )


# ── Student: list own requests ─────────────────────────────────────────────────


@router.get("/me", response_model=list[CertificateRequestOut])
def list_my_certificates(user: CurrentUser, db: DbDep):
    """Return all certificate requests for the authenticated student."""
    if user.role != "student":
        raise ForbiddenError("Only students can view their own certificate requests.")
    return certificate_service.list_certificates(profile_id=user.id, db=db)


# ── Admin / Faculty: approve or reject ────────────────────────────────────────


@router.post("/{cert_id}/action", response_model=CertificateRequestOut)
def action_certificate(
    cert_id: uuid.UUID,
    body: ApproveRejectIn,
    request: Request,
    user: CurrentUser,
    db: DbDep,
):
    """Approve or reject a pending certificate request."""
    if user.role not in ("admin", "faculty"):
        raise ForbiddenError("Only admin or faculty can approve/reject certificates.")
    return certificate_service.approve_or_reject(
        cert_id=cert_id,
        approver=user,
        body=body,
        db=db,
        base_url=_base_url(request),
    )


# ── Download PDF ───────────────────────────────────────────────────────────────


@router.get("/{cert_id}/download")
def download_certificate(
    cert_id: uuid.UUID,
    request: Request,
    user: CurrentUser,
    db: DbDep,
):
    """Stream the PDF for an approved certificate."""
    pdf_bytes = certificate_service.download_certificate_pdf(
        cert_id=cert_id,
        requester=user,
        db=db,
        base_url=_base_url(request),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="certificate_{cert_id}.pdf"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


# ── Public verification (no auth) ─────────────────────────────────────────────


@router.get("/verify/{verification_code}", response_model=PublicVerifyOut)
def public_verify(verification_code: str, db: DbDep):
    """
    Public endpoint — verify a certificate using the QR-encoded code.
    No authentication required; safe to expose on the internet.
    """
    return certificate_service.public_verify(verification_code=verification_code, db=db)
