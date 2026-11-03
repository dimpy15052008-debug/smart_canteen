"""Helpdesk grievance tickets, AI classification, messages, and SLA escalation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbDep, require_roles
from app.schemas.helpdesk import (
    ClassifyTicketRequest,
    ClassifyTicketResponse,
    CreateTicketRequest,
    HelpdeskTicketOut,
    ResolveTicketRequest,
    TicketMessageOut,
    TicketMessageRequest,
)
from app.services import helpdesk_service

router = APIRouter(prefix="/api/v1/helpdesk", tags=["helpdesk"])


@router.post("/classify", response_model=ClassifyTicketResponse)
def classify_ticket_endpoint(payload: ClassifyTicketRequest):
    """Classify ticket text into category, priority, sentiment, and SLA routing."""
    return helpdesk_service.classify_ticket(payload.subject, payload.description)


@router.post("/tickets", response_model=HelpdeskTicketOut)
def create_ticket_endpoint(payload: CreateTicketRequest, user: CurrentUser, db: DbDep):
    """Create a new helpdesk ticket with server-side AI classification."""
    return helpdesk_service.create_ticket(payload, user, db)


@router.get("/tickets", response_model=list[HelpdeskTicketOut])
def list_tickets_endpoint(
    user: CurrentUser,
    db: DbDep,
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
):
    """List tickets (students see own; admin/faculty see all)."""
    return helpdesk_service.list_tickets(user, db, status=status, category=category)


@router.get("/tickets/{id}", response_model=HelpdeskTicketOut)
def get_ticket_endpoint(id: str, user: CurrentUser, db: DbDep):
    """Get ticket details and conversation thread."""
    return helpdesk_service.get_ticket(id, user, db)


@router.post(
    "/tickets/{id}/resolve",
    response_model=HelpdeskTicketOut,
    dependencies=[require_roles("admin", "faculty")],
)
def resolve_ticket_endpoint(
    id: str,
    payload: ResolveTicketRequest,
    user: CurrentUser,
    db: DbDep,
):
    """Resolve ticket (faculty / admin only)."""
    return helpdesk_service.resolve_ticket(id, payload.resolution_notes, user, db)


@router.post("/tickets/{id}/messages", response_model=TicketMessageOut)
def add_message_endpoint(
    id: str,
    payload: TicketMessageRequest,
    user: CurrentUser,
    db: DbDep,
):
    """Add a new message to a ticket conversation thread."""
    return helpdesk_service.add_ticket_message(id, payload.message, user, db)


@router.post("/sla/run", dependencies=[require_roles("admin")])
def trigger_sla_escalation_endpoint(
    db: DbDep,
):
    """Run the SLA escalation job on demand."""
    return helpdesk_service.run_sla_escalation_job(db)
