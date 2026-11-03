"""Fee invoices, payments, checkout, receipts, and webhooks."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Header, Request, Response

from app.core.deps import CurrentUser, DbDep
from app.schemas.fees import (
    FeeInvoiceOut,
    InitiatePaymentRequest,
    InitiatePaymentResponse,
    PaymentOut,
    VerifyPaymentRequest,
)
from app.services import fee_service

router = APIRouter(prefix="/api/v1", tags=["fees"])


@router.get("/fees/invoices/me", response_model=list[FeeInvoiceOut])
def get_my_fee_invoices(user: CurrentUser, db: DbDep):
    """Retrieve all fee invoices for the authenticated student with computed status."""
    user_id = user.id if isinstance(user.id, uuid.UUID) else uuid.UUID(str(user.id))
    return fee_service.get_student_invoices(user_id, db)


@router.post("/fees/invoices/{id}/pay", response_model=InitiatePaymentResponse)
def initiate_fee_payment(
    id: str,
    payload: InitiatePaymentRequest,
    user: CurrentUser,
    db: DbDep,
):
    """Validate payment amount and initiate checkout order (converts to paise)."""
    return fee_service.initiate_payment(id, payload.amount, user, db)


@router.post("/fees/payments/verify", response_model=PaymentOut)
def verify_payment_signature(
    payload: VerifyPaymentRequest,
    user: CurrentUser,
    db: DbDep,
):
    """Verify checkout HMAC signature, record payment, and issue receipt."""
    return fee_service.verify_payment(payload, user, db)


@router.get("/fees/payments/{id}/receipt")
def download_payment_receipt(id: str, db: DbDep):
    """Download official PDF payment receipt."""
    pdf_bytes = fee_service.generate_receipt_pdf(id, db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=receipt_{id[:8]}.pdf"},
    )


@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    db: DbDep,
    x_razorpay_signature: str = Header(default=""),
):
    """Process incoming Razorpay webhook on the raw body. Replay-safe and deduplicated."""
    raw_body = await request.body()
    return fee_service.process_razorpay_webhook(raw_body, x_razorpay_signature, db)
