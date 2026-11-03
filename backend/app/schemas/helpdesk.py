"""Helpdesk ticket, message, classification, and SLA schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel


class ClassifyTicketRequest(CamelModel):
    """Payload to classify a student ticket with AI/heuristic models."""

    subject: str
    description: str


class ClassifyTicketResponse(CamelModel):
    """Classification result with SLA and department routing."""

    category: str
    priority: Literal["Low", "Medium", "High", "Urgent"]
    sentiment: str
    assigned_department: str
    sla_hours: int
    summary: str


class CreateTicketRequest(CamelModel):
    """Payload to create a new helpdesk ticket."""

    subject: str
    description: str
    category: str | None = None
    priority: Literal["Low", "Medium", "High", "Urgent"] | None = None


class UpdateTicketRequest(CamelModel):
    """Update ticket status or department."""

    status: str | None = None
    priority: str | None = None
    assigned_department: str | None = None


class ResolveTicketRequest(CamelModel):
    """Resolution details when closing a ticket."""

    resolution_notes: str


class TicketMessageRequest(CamelModel):
    """New reply message in a ticket thread."""

    message: str


class TicketMessageOut(CamelModel):
    """Message item in a ticket conversation."""

    id: str
    sender_id: str
    sender_name: str
    sender_role: str
    message: str
    timestamp: str


class HelpdeskTicketOut(CamelModel):
    """Helpdesk ticket response matching frontend HelpdeskTicket interface."""

    id: str
    ticket_number: str
    student_id: str
    student_name: str
    roll_number: str
    subject: str
    description: str
    category: str
    priority: str
    ai_sentiment: str | None = None
    assigned_department: str
    status: str
    created_at: str
    sla_deadline: str | None = None
    resolution_notes: str | None = None
    escalation_count: int = 0
    messages: list[TicketMessageOut] = Field(default_factory=list)
