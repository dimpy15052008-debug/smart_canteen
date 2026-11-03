"""Fees domain models: FeeInvoice, Payment, WebhookEvent."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class FeeInvoice(Base, UUIDPrimaryKey, TimestampMixin):
    """University fee invoice."""

    __tablename__ = "fee_invoices"

    invoice_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    semester: Mapped[int] = mapped_column(Numeric(2, 0), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)

    tuition_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    development_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    exam_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    hostel_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    # status: pending, paid, overdue, partially_paid

    payments: Mapped[list[Payment]] = relationship(back_populates="invoice")


class Payment(Base, UUIDPrimaryKey, TimestampMixin):
    """Payment transaction record for fee invoices."""

    __tablename__ = "payments"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_invoices.id"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    gateway: Mapped[str] = mapped_column(String(30), default="razorpay", nullable=False)
    # gateway: razorpay, mock, manual

    gateway_order_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    gateway_payment_id: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True, index=True
    )
    gateway_signature: Mapped[str | None] = mapped_column(String(200), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="initiated", nullable=False)
    # status: initiated, success, failed, refunded

    receipt_path: Mapped[str | None] = mapped_column(String(300), nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True, index=True
    )

    invoice: Mapped[FeeInvoice] = relationship(back_populates="payments")


class WebhookEvent(Base, UUIDPrimaryKey):
    """Payment gateway webhook idempotency log."""

    __tablename__ = "webhook_events"

    event_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    gateway: Mapped[str] = mapped_column(String(30), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
