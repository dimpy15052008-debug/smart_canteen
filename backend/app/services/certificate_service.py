"""Certificate service: eligibility engine, PDF+QR generation, public verification."""

from __future__ import annotations

import hashlib
import io
import json
import secrets
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.audit import log_action
from app.core.errors import BadRequestError, ForbiddenError, NotFoundError
from app.core.logging import get_logger
from app.models.academics import Enrollment
from app.models.certificates import CertificateRequest
from app.models.fees import FeeInvoice, Payment
from app.models.identity import Profile, Student
from app.schemas.certificates import (
    ApproveRejectIn,
    CertificateRequestOut,
    EligibilityDetail,
    PublicVerifyOut,
    RequestCertificateIn,
)

log = get_logger(__name__)

# ── Eligibility thresholds ─────────────────────────────────────────────────────

ATTENDANCE_MINIMUM = 75.0  # %
CGPA_MINIMUM = 5.0  # out of 10
FEE_CLEARANCE_REQUIRED = True  # all dues must be cleared

VALID_TYPES = [
    "Bonafide Certificate",
    "Course Completion Certificate",
    "Official Transcript",
    "Character Certificate",
]


# ── Helpers ────────────────────────────────────────────────────────────────────


def _make_verification_code() -> str:
    """16-char hex token (32 uppercase chars) that fits in the QR code comfortably."""
    return secrets.token_hex(16).upper()


def _hash_payload(payload: dict[str, Any]) -> str:
    """SHA-256 hex digest of the certificate's canonical JSON representation."""
    canonical = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


def _row_to_out(req: CertificateRequest) -> CertificateRequestOut:
    checks: list[EligibilityDetail] = []
    if req.eligibility_json:
        try:
            raw = json.loads(req.eligibility_json)
            checks = [EligibilityDetail(**c) for c in raw]
        except Exception:
            pass
    return CertificateRequestOut(
        id=req.id,
        student_id=req.student_id,
        certificate_type=req.certificate_type,
        purpose=req.purpose,
        academic_year=req.academic_year,
        status=req.status,
        eligibility_checks=checks,
        verification_code=req.verification_code,
        document_hash=req.document_hash,
        approved_at=req.approved_at,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


def _audit(db: Session, actor: Profile, action: str, resource_id: str, details: dict):
    """Helper to call log_action with the correct signature."""
    try:
        log_action(
            db,
            actor_id=str(actor.id),
            actor_role=actor.role,
            action=action,
            target_entity="certificate_request",
            entity_id=resource_id,
            details=json.dumps(details, default=str),
        )
    except Exception:
        pass  # Audit failure must never break the main flow


# ── Eligibility engine ─────────────────────────────────────────────────────────


def _run_eligibility(
    student: Student,
    profile: Profile,
    db: Session,
    cert_type: str,
) -> tuple[bool, list[dict[str, Any]]]:
    """
    Run the eligibility rules against the student's current record.
    Returns (all_passed, list_of_check_dicts).
    """
    checks: list[dict[str, Any]] = []

    # ── 1. Account active / enrollment check ──────────────────────────────────
    enrolled = bool(profile.active)
    checks.append(
        {
            "rule": "enrollment_status",
            "passed": enrolled,
            "detail": (
                "Student account is active and enrolled."
                if enrolled
                else "Student account is not active."
            ),
        }
    )

    # ── 2. Attendance check (skip for Character Certificate) ──────────────────
    if cert_type != "Character Certificate":
        # Average attendance across all enrollments for this student
        enrollments = db.query(Enrollment).filter_by(student_id=profile.id).all()
        if enrollments:
            avg_att = sum(e.attendance_percent for e in enrollments) / len(enrollments)
        else:
            avg_att = 100.0  # No enrollments yet → no restriction
        att_ok = avg_att >= ATTENDANCE_MINIMUM
        checks.append(
            {
                "rule": "minimum_attendance",
                "passed": att_ok,
                "detail": (
                    f"Average attendance {avg_att:.1f}% ≥ {ATTENDANCE_MINIMUM}%"
                    if att_ok
                    else f"Average attendance {avg_att:.1f}% is below the {ATTENDANCE_MINIMUM}% threshold."
                ),
            }
        )
    else:
        checks.append(
            {
                "rule": "minimum_attendance",
                "passed": True,
                "detail": "Attendance check waived for Character Certificate.",
            }
        )

    # ── 3. CGPA check (Transcript / Completion only) ──────────────────────────
    if cert_type in ("Official Transcript", "Course Completion Certificate"):
        cgpa = float(student.cgpa or 0.0)
        cgpa_ok = cgpa >= CGPA_MINIMUM
        checks.append(
            {
                "rule": "minimum_cgpa",
                "passed": cgpa_ok,
                "detail": (
                    f"CGPA {cgpa:.2f} ≥ {CGPA_MINIMUM}"
                    if cgpa_ok
                    else f"CGPA {cgpa:.2f} is below the {CGPA_MINIMUM} minimum."
                ),
            }
        )

    # ── 4. Fee clearance check ────────────────────────────────────────────────
    if FEE_CLEARANCE_REQUIRED:
        invoices = db.query(FeeInvoice).filter_by(student_id=profile.id).all()
        dues_cleared = True
        outstanding_details: list[str] = []
        for inv in invoices:
            paid_sum = sum(
                float(p.amount)
                for p in db.query(Payment)
                .filter(Payment.invoice_id == inv.id, Payment.status == "success")
                .all()
            )
            outstanding = float(inv.total_amount) - paid_sum
            if outstanding > 0.01:
                dues_cleared = False
                outstanding_details.append(f"{inv.invoice_number}: ₹{outstanding:,.0f} outstanding")
        checks.append(
            {
                "rule": "fee_clearance",
                "passed": dues_cleared,
                "detail": (
                    "All fees cleared."
                    if dues_cleared
                    else "Outstanding dues: " + "; ".join(outstanding_details)
                ),
            }
        )

    all_passed = all(c["passed"] for c in checks)
    return all_passed, checks


# ── PDF + QR generation ────────────────────────────────────────────────────────


def _generate_certificate_pdf(
    cert_req: CertificateRequest,
    profile: Profile,
    student: Student,
    verify_url: str,
) -> bytes:
    """Generate a styled PDF certificate with embedded QR code."""
    try:
        import qrcode  # type: ignore
        from reportlab.lib import colors  # type: ignore
        from reportlab.lib.pagesizes import A4  # type: ignore
        from reportlab.lib.styles import ParagraphStyle  # type: ignore
        from reportlab.lib.units import cm  # type: ignore
        from reportlab.platypus import (
            Image as RLImage,
        )
        from reportlab.platypus import (  # type: ignore
            Paragraph,
            SimpleDocTemplate,
            Spacer,
            Table,
            TableStyle,
        )
    except ImportError as exc:
        raise RuntimeError(f"PDF dependencies not installed: {exc}") from exc

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    W, _H = A4
    issued_at = (cert_req.approved_at or datetime.now(UTC)).strftime("%d %B %Y")
    full_name = profile.name or "Student"
    roll_number = student.roll_number or "N/A"
    program = student.program or "B.Tech Computer Science and Engineering"
    batch = student.batch or "2022-2026"
    semester = student.semester or 6

    # ── Styles ─────────────────────────────────────────────────────────────────
    header_style = ParagraphStyle(
        "header", fontName="Helvetica-Bold", fontSize=16, alignment=1, spaceAfter=4
    )
    sub_style = ParagraphStyle("sub", fontName="Helvetica", fontSize=11, alignment=1, spaceAfter=2)
    title_style = ParagraphStyle(
        "title",
        fontName="Helvetica-Bold",
        fontSize=14,
        alignment=1,
        spaceBefore=12,
        spaceAfter=8,
        textColor=colors.HexColor("#1a3c6e"),
    )
    body_style = ParagraphStyle("body", fontName="Helvetica", fontSize=11, alignment=4, leading=16)
    small_style = ParagraphStyle(
        "small",
        fontName="Helvetica-Oblique",
        fontSize=8,
        alignment=1,
        textColor=colors.grey,
    )

    # ── Body text per certificate type ────────────────────────────────────────
    body_texts = {
        "Bonafide Certificate": (
            f"This is to certify that <b>{full_name}</b> (Roll No. <b>{roll_number}</b>) "
            f"is a bonafide student of <b>{program}</b>, Semester <b>{semester}</b>, "
            f"Batch <b>{batch}</b> at <b>SmartUni.Ai University</b>. "
            f"This certificate is issued for the academic year <b>{cert_req.academic_year}</b> "
            f"for the purpose of: <i>{cert_req.purpose}</i>."
        ),
        "Course Completion Certificate": (
            f"This is to certify that <b>{full_name}</b> (Roll No. <b>{roll_number}</b>) "
            f"has successfully completed all courses of <b>{program}</b> "
            f"for the academic year <b>{cert_req.academic_year}</b>. "
            f"CGPA Achieved: <b>{student.cgpa or 'N/A'}</b>."
        ),
        "Official Transcript": (
            f"This official transcript is issued for <b>{full_name}</b> "
            f"(Roll No. <b>{roll_number}</b>), enrolled in <b>{program}</b>, "
            f"Batch <b>{batch}</b>. CGPA: <b>{student.cgpa or 'N/A'}</b> "
            f"(as of academic year <b>{cert_req.academic_year}</b>)."
        ),
        "Character Certificate": (
            f"This is to certify that <b>{full_name}</b> (Roll No. <b>{roll_number}</b>), "
            f"student of <b>{program}</b>, Batch <b>{batch}</b> at SmartUni.Ai University, "
            f"bears good moral character and conduct during the academic year "
            f"<b>{cert_req.academic_year}</b>."
        ),
    }
    body_text = body_texts.get(cert_req.certificate_type, f"Certificate for {full_name}.")

    # ── QR code ────────────────────────────────────────────────────────────────
    qr = qrcode.QRCode(box_size=4, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buf = io.BytesIO()
    qr_img.save(qr_buf, format="PNG")
    qr_buf.seek(0)

    # ── Build flowable elements ───────────────────────────────────────────────
    elements = []

    elements.append(Paragraph("SmartUni.Ai University", header_style))
    elements.append(Paragraph("Established 2010 | NAAC A++ | Autonomous Institution", sub_style))
    elements.append(Spacer(1, 0.4 * cm))

    elements.append(
        Table(
            [[""]],
            colWidths=[W - 5 * cm],
            style=TableStyle(
                [
                    ("LINEABOVE", (0, 0), (-1, 0), 1.5, colors.HexColor("#1a3c6e")),
                ]
            ),
        )
    )
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(Paragraph(cert_req.certificate_type.upper(), title_style))
    elements.append(Spacer(1, 0.4 * cm))
    elements.append(Paragraph(body_text, body_style))
    elements.append(Spacer(1, 0.6 * cm))

    meta = [
        ["Certificate No.:", cert_req.verification_code or "N/A"],
        ["Issued On:", issued_at],
        ["Academic Year:", cert_req.academic_year],
        ["Verified By:", "Academic Registrar, SmartUni.Ai"],
    ]
    meta_table = Table(meta, colWidths=[4.5 * cm, 11 * cm])
    meta_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    elements.append(meta_table)
    elements.append(Spacer(1, 0.8 * cm))

    qr_rl = RLImage(qr_buf, width=2.5 * cm, height=2.5 * cm)
    sig_block = Paragraph(
        "<br/><br/>________________________<br/><b>Registrar</b><br/>SmartUni.Ai University",
        ParagraphStyle("sig", fontName="Helvetica", fontSize=9, alignment=1),
    )
    bottom_row = Table(
        [[qr_rl, "", sig_block]],
        colWidths=[3 * cm, 8 * cm, 5 * cm],
    )
    bottom_row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("ALIGN", (0, 0), (0, 0), "CENTER"),
                ("ALIGN", (2, 0), (2, 0), "CENTER"),
            ]
        )
    )
    elements.append(bottom_row)
    elements.append(Spacer(1, 0.3 * cm))

    elements.append(
        Table(
            [[""]],
            colWidths=[W - 5 * cm],
            style=TableStyle(
                [
                    ("LINEABOVE", (0, 0), (-1, 0), 0.8, colors.grey),
                ]
            ),
        )
    )
    elements.append(Spacer(1, 0.2 * cm))
    elements.append(
        Paragraph(
            f"Verify online: {verify_url}  |  Hash: {cert_req.document_hash or 'N/A'}",
            small_style,
        )
    )

    doc.build(elements)
    return buf.getvalue()


# ── CRUD ───────────────────────────────────────────────────────────────────────


def request_certificate(
    profile: Profile,
    body: RequestCertificateIn,
    db: Session,
    base_url: str = "http://localhost:8000",
) -> CertificateRequestOut:
    """Student submits a certificate request; eligibility is evaluated immediately."""
    if body.certificate_type not in VALID_TYPES:
        raise BadRequestError(f"Invalid certificate_type. Must be one of: {', '.join(VALID_TYPES)}")

    student = db.query(Student).filter_by(profile_id=profile.id).first()
    if not student:
        raise NotFoundError("Student record not found.")

    all_passed, checks = _run_eligibility(student, profile, db, body.certificate_type)
    initial_status = "pending" if all_passed else "ineligible"

    req = CertificateRequest(
        id=uuid.uuid4(),
        student_id=profile.id,
        certificate_type=body.certificate_type,
        purpose=body.purpose,
        academic_year=body.academic_year,
        status=initial_status,
        eligibility_json=json.dumps(checks),
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    _audit(
        db,
        profile,
        "certificate_requested",
        str(req.id),
        {"type": body.certificate_type, "status": initial_status},
    )

    return _row_to_out(req)


def list_certificates(profile_id: uuid.UUID, db: Session) -> list[CertificateRequestOut]:
    """Return all certificate requests for a student, most recent first."""
    reqs = (
        db.query(CertificateRequest)
        .filter_by(student_id=profile_id)
        .order_by(CertificateRequest.created_at.desc())
        .all()
    )
    return [_row_to_out(r) for r in reqs]


def approve_or_reject(
    cert_id: uuid.UUID,
    approver: Profile,
    body: ApproveRejectIn,
    db: Session,
    base_url: str = "http://localhost:8000",
) -> CertificateRequestOut:
    """Faculty/Admin approves or rejects a certificate request."""
    req = db.query(CertificateRequest).filter_by(id=cert_id).first()
    if not req:
        raise NotFoundError("Certificate request not found.")

    if req.status not in ("pending", "ineligible"):
        raise BadRequestError(f"Cannot action a request in '{req.status}' status.")

    if body.action == "reject":
        req.status = "rejected"
        remarks = body.remarks or "Rejected by registrar."
        checks = json.loads(req.eligibility_json or "[]")
        checks.append({"rule": "admin_decision", "passed": False, "detail": remarks})
        req.eligibility_json = json.dumps(checks)
        db.commit()
        db.refresh(req)
        _audit(db, approver, "certificate_rejected", str(req.id), {"remarks": remarks})
        return _row_to_out(req)

    # Approve: generate verification code, document hash, mark ready
    vc = _make_verification_code()
    now = datetime.now(UTC)
    payload = {
        "cert_id": str(req.id),
        "student_id": str(req.student_id),
        "certificate_type": req.certificate_type,
        "academic_year": req.academic_year,
        "verification_code": vc,
        "approved_at": now.isoformat(),
    }
    doc_hash = _hash_payload(payload)

    req.status = "ready_for_download"
    req.verification_code = vc
    req.document_hash = doc_hash
    req.verified_by = approver.id
    req.approved_at = now

    db.commit()
    db.refresh(req)

    _audit(
        db,
        approver,
        "certificate_approved",
        str(req.id),
        {"verification_code": vc, "hash": doc_hash},
    )

    return _row_to_out(req)


def download_certificate_pdf(
    cert_id: uuid.UUID,
    requester: Profile,
    db: Session,
    base_url: str = "http://localhost:8000",
) -> bytes:
    """Generate and return PDF bytes for an approved certificate."""
    req = db.query(CertificateRequest).filter_by(id=cert_id).first()
    if not req:
        raise NotFoundError("Certificate request not found.")

    if str(req.student_id) != str(requester.id) and requester.role not in ("admin", "faculty"):
        raise ForbiddenError("You are not authorised to download this certificate.")

    if req.status != "ready_for_download":
        raise BadRequestError(f"Certificate is not ready for download (status: {req.status}).")

    student = db.query(Student).filter_by(profile_id=req.student_id).first()
    profile = db.query(Profile).filter_by(id=req.student_id).first()
    if not student or not profile:
        raise NotFoundError("Student data not found.")

    verify_url = f"{base_url}/api/v1/certificates/verify/{req.verification_code}"
    return _generate_certificate_pdf(req, profile, student, verify_url)


def public_verify(verification_code: str, db: Session) -> PublicVerifyOut:
    """Public endpoint — verify a certificate by its unique code."""
    req = db.query(CertificateRequest).filter_by(verification_code=verification_code).first()
    if not req or req.status != "ready_for_download":
        return PublicVerifyOut(
            valid=False,
            message="Certificate not found or has not been issued.",
        )

    profile = db.query(Profile).filter_by(id=req.student_id).first()
    student = db.query(Student).filter_by(profile_id=req.student_id).first()

    return PublicVerifyOut(
        valid=True,
        certificate_type=req.certificate_type,
        student_name=profile.name if profile else None,
        roll_number=student.roll_number if student else None,
        academic_year=req.academic_year,
        issued_at=req.approved_at,
        document_hash=req.document_hash,
        message="Certificate is authentic and was issued by SmartUni.Ai University.",
    )
