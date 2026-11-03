"""Helpdesk domain models: HelpdeskTicket, HelpdeskMessage."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class HelpdeskTicket(Base, UUIDPrimaryKey, TimestampMixin):
    """Grievance / support ticket with AI classification and SLA tracking."""

    __tablename__ = "helpdesk_tickets"

    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    subject: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    # category: IT & Wi-Fi, Hostel & Mess, Academics & Exams, Finance, Transport, General
    priority: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False)
    # priority: Low, Medium, High, Urgent
    ai_sentiment: Mapped[str | None] = mapped_column(String(30), nullable=True)

    assigned_department: Mapped[str] = mapped_column(String(200), nullable=False)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True
    )

    status: Mapped[str] = mapped_column(String(30), default="Open", nullable=False, index=True)
    # status: Open, In Progress, Escalated, Resolved, Closed

    sla_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    escalation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    messages: Mapped[list[HelpdeskMessage]] = relationship(back_populates="ticket")


class HelpdeskMessage(Base, UUIDPrimaryKey, TimestampMixin):
    """Message thread within a helpdesk ticket."""

    __tablename__ = "helpdesk_messages"

    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("helpdesk_tickets.id"), nullable=False, index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)

    ticket: Mapped[HelpdeskTicket] = relationship(back_populates="messages")
