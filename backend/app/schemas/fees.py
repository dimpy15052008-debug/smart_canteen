"""Fee invoices, payments, and checkout schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel


class FeeInvoiceOut(CamelModel):
    """Fee invoice response with computed status and breakdown matching frontend."""

    id: str
    invoice_number: str
    semester: str
    academic_year: str
    due_date: str
    tuition_fee: float
    development_fee: float
    exam_fee: float
    hostel_fee: float
    total_amount: float
    paid_amount: float
    outstanding_amount: float
    status: Literal["paid", "partial", "due", "overdue"]
    payment_date: str | None = None
    transaction_id: str | None = None


class InitiatePaymentRequest(CamelModel):
    """Payment initiation request with amount in rupees."""

    amount: float = Field(gt=0, description="Amount in rupees to pay")


class InitiatePaymentResponse(CamelModel):
    """Checkout payload for Razorpay / mock gateway."""

    order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str
    invoice_id: str


class VerifyPaymentRequest(CamelModel):
    """Payment verification payload from frontend checkout modal."""

    order_id: str
    payment_id: str
    signature: str
    invoice_id: str


class PaymentOut(CamelModel):
    """Payment transaction summary."""

    id: str
    invoice_id: str
    amount: float
    gateway: str
    gateway_payment_id: str | None = None
    status: str
    receipt_url: str | None = None
