"""Helpdesk service: AI classification, ticket management, thread messages, and SLA escalation job."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.core.audit import log_action
from app.core.errors import ForbiddenError, NotFoundError
from app.models.helpdesk import HelpdeskMessage, HelpdeskTicket
from app.models.identity import Profile
from app.models.platform import Notification
from app.schemas.helpdesk import (
    ClassifyTicketResponse,
    CreateTicketRequest,
    HelpdeskTicketOut,
    TicketMessageOut,
)

# Priority escalation order
PRIORITY_BUMP = {
    "Low": "Medium",
    "Medium": "High",
    "High": "Urgent",
    "Urgent": "Urgent",
}


def classify_ticket(subject: str, description: str) -> ClassifyTicketResponse:
    """Classify ticket category, priority, sentiment, department, and SLA hours."""
    text = f"{subject} {description}".lower()

    category = "General"
    assigned_department = "Estate & Facilities Office"
    priority: Any = "Medium"
    sla_hours = 48
    sentiment = "Neutral"

    if any(
        kw in text
        for kw in ("wifi", "wi-fi", "internet", "network", "portal", "login", "dns", "server")
    ):
        category = "IT & Wi-Fi"
        assigned_department = "Campus Network & IT Infrastructure Cell"
        priority = (
            "High"
            if any(kw in text for kw in ("urgent", "exam", "broken", "drop", "frequent"))
            else "Medium"
        )
        sla_hours = 24
        sentiment = (
            "Frustrated"
            if any(kw in text for kw in ("frequent", "bad", "terrible", "keeps"))
            else "Neutral"
        )
    elif any(kw in text for kw in ("hostel", "room", "water", "mess", "curfew", "bed")):
        category = "Hostel & Mess"
        assigned_department = "Hostel Affairs & Mess Committee"
        priority = (
            "High" if any(kw in text for kw in ("water", "leak", "urgent", "food")) else "Medium"
        )
        sla_hours = 24
    elif any(kw in text for kw in ("fee", "refund", "receipt", "scholarship", "payment", "due")):
        category = "Finance"
        assigned_department = "Finance & Accounts Office"
        priority = "Medium"
        sla_hours = 72
    elif any(
        kw in text for kw in ("grade", "marksheet", "exam", "hall ticket", "credit", "re-eval")
    ):
        category = "Academics & Exams"
        assigned_department = "Controller of Examinations"
        priority = "High"
        sla_hours = 48
    elif any(kw in text for kw in ("bus", "transport", "driver", "route")):
        category = "Transport"
        assigned_department = "Estate & Facilities Office"
        priority = "Medium"
        sla_hours = 24

    if any(
        kw in text for kw in ("frustrated", "angry", "terrible", "worst", "unacceptable", "furious")
    ):
        sentiment = "Frustrated"
    elif any(kw in text for kw in ("please", "kindly", "request", "politely")):
        sentiment = "Polite"

    return ClassifyTicketResponse(
        category=category,
        priority=priority,
        sentiment=sentiment,
        assigned_department=assigned_department,
        sla_hours=sla_hours,
        summary=f"Automated routing to {assigned_department} with {sla_hours}h SLA.",
    )


def _ticket_to_out(t: HelpdeskTicket, db: Session) -> HelpdeskTicketOut:
    """Format HelpdeskTicket ORM object into HelpdeskTicketOut schema."""
    student_profile = db.get(Profile, t.student_id)
    student_name = student_profile.name if student_profile else "Student"
    roll_number = (
        student_profile.student.roll_number
        if (student_profile and student_profile.student)
        else "0827CS221045"
    )

    messages_out = []
    for m in t.messages:
        sender = db.get(Profile, m.sender_id)
        messages_out.append(
            TicketMessageOut(
                id=str(m.id),
                sender_id=str(m.sender_id),
                sender_name=sender.name if sender else "User",
                sender_role=sender.role if sender else "student",
                message=m.message,
                timestamp=m.created_at.strftime("%Y-%m-%d %I:%M %p"),
            )
        )

    return HelpdeskTicketOut(
        id=str(t.id),
        ticket_number=t.ticket_number,
        student_id=str(t.student_id),
        student_name=student_name,
        roll_number=roll_number,
        subject=t.subject,
        description=t.description,
        category=t.category,
        priority=t.priority,
        ai_sentiment=t.ai_sentiment,
        assigned_department=t.assigned_department,
        status=t.status,
        created_at=t.created_at.strftime("%Y-%m-%d %I:%M %p"),
        sla_deadline=t.sla_deadline.strftime("%Y-%m-%d %I:%M %p") if t.sla_deadline else None,
        resolution_notes=t.resolution_notes,
        escalation_count=t.escalation_count,
        messages=messages_out,
    )


def create_ticket(data: CreateTicketRequest, current_user: Any, db: Session) -> HelpdeskTicketOut:
    """Create a new helpdesk ticket with server-side AI classification if omitted."""
    classification = classify_ticket(data.subject, data.description)

    category = data.category or classification.category
    priority = data.priority or classification.priority
    assigned_dept = classification.assigned_department
    sla_hours = classification.sla_hours

    now = datetime.now(UTC)
    sla_deadline = now + timedelta(hours=sla_hours)

    count = db.query(HelpdeskTicket).count() + 1
    ticket_num = f"TKT-2026-{880 + count}"

    ticket = HelpdeskTicket(
        ticket_number=ticket_num,
        student_id=current_user.id,
        subject=data.subject,
        description=data.description,
        category=category,
        priority=priority,
        ai_sentiment=classification.sentiment,
        assigned_department=assigned_dept,
        status="Open",
        sla_deadline=sla_deadline,
        escalation_count=0,
    )
    db.add(ticket)
    db.flush()

    log_action(
        db,
        actor_id=str(current_user.id),
        actor_role=current_user.role,
        action="HELPDESK_TICKET_CREATED",
        target_entity="HelpdeskTicket",
        entity_id=str(ticket.id),
        details=f"Ticket {ticket.ticket_number} created in {category} priority {priority}.",
    )
    db.commit()
    return _ticket_to_out(ticket, db)


def list_tickets(
    current_user: Any,
    db: Session,
    status: str | None = None,
    category: str | None = None,
) -> list[HelpdeskTicketOut]:
    """List tickets: student sees only their own; faculty/admin sees all."""
    query = db.query(HelpdeskTicket)

    if current_user.role == "student":
        query = query.filter(HelpdeskTicket.student_id == current_user.id)

    if status:
        query = query.filter(HelpdeskTicket.status.ilike(f"%{status}%"))
    if category:
        query = query.filter(HelpdeskTicket.category == category)

    tickets = query.order_by(HelpdeskTicket.created_at.desc()).all()
    return [_ticket_to_out(t, db) for t in tickets]


def get_ticket(ticket_id: str, current_user: Any, db: Session) -> HelpdeskTicketOut:
    """Retrieve ticket details with thread messages. Enforces ownership for students."""
    t = None
    try:
        t = db.get(HelpdeskTicket, uuid.UUID(ticket_id))
    except Exception:
        pass
    if not t:
        t = db.query(HelpdeskTicket).filter_by(ticket_number=ticket_id).first()

    if not t:
        raise NotFoundError(f"Ticket '{ticket_id}' not found.")

    if current_user.role == "student" and str(t.student_id) != str(current_user.id):
        raise ForbiddenError("You can only access your own tickets.")

    return _ticket_to_out(t, db)


def resolve_ticket(
    ticket_id: str, resolution_notes: str, current_user: Any, db: Session
) -> HelpdeskTicketOut:
    """Resolve a ticket (admin/faculty only)."""
    t = None
    try:
        t = db.get(HelpdeskTicket, uuid.UUID(ticket_id))
    except Exception:
        pass
    if not t:
        t = db.query(HelpdeskTicket).filter_by(ticket_number=ticket_id).first()

    if not t:
        raise NotFoundError(f"Ticket '{ticket_id}' not found.")

    t.status = "Resolved"
    t.resolution_notes = resolution_notes
    t.resolved_at = datetime.now(UTC)

    # Notify student
    notif = Notification(
        user_id=t.student_id,
        title=f"Ticket {t.ticket_number} Resolved",
        message=f"Your ticket regarding '{t.subject}' has been resolved: {resolution_notes}",
        type="helpdesk",
        action_link="helpdesk",
    )
    db.add(notif)

    log_action(
        db,
        actor_id=str(current_user.id),
        actor_role=current_user.role,
        action="HELPDESK_TICKET_RESOLVED",
        target_entity="HelpdeskTicket",
        entity_id=str(t.id),
        details=f"Ticket {t.ticket_number} resolved by {current_user.name}.",
    )
    db.commit()
    return _ticket_to_out(t, db)


def add_ticket_message(
    ticket_id: str, message: str, current_user: Any, db: Session
) -> TicketMessageOut:
    """Add message to ticket conversation."""
    t = None
    try:
        t = db.get(HelpdeskTicket, uuid.UUID(ticket_id))
    except Exception:
        pass
    if not t:
        t = db.query(HelpdeskTicket).filter_by(ticket_number=ticket_id).first()

    if not t:
        raise NotFoundError(f"Ticket '{ticket_id}' not found.")

    if current_user.role == "student" and str(t.student_id) != str(current_user.id):
        raise ForbiddenError("You can only message on your own tickets.")

    msg = HelpdeskMessage(
        ticket_id=t.id,
        sender_id=current_user.id,
        message=message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return TicketMessageOut(
        id=str(msg.id),
        sender_id=str(msg.sender_id),
        sender_name=current_user.name,
        sender_role=current_user.role,
        message=msg.message,
        timestamp=msg.created_at.strftime("%Y-%m-%d %I:%M %p"),
    )


def run_sla_escalation_job(db: Session) -> dict[str, Any]:
    """Background / scheduler job: checks overdue tickets, bumps priority, escalates, and alerts admins.

    Idempotent: tickets already in 'Escalated' or 'Resolved' status are skipped.
    """
    now = datetime.now(UTC)
    active_statuses = ["Open", "in_progress", "In Progress"]

    overdue_tickets = (
        db.query(HelpdeskTicket)
        .filter(
            HelpdeskTicket.status.in_(active_statuses),
            HelpdeskTicket.sla_deadline != None,
            HelpdeskTicket.sla_deadline < now,
        )
        .all()
    )

    escalated_ids = []
    admin_profile = db.query(Profile).filter_by(role="admin").first()

    for ticket in overdue_tickets:
        ticket.status = "Escalated"
        ticket.escalation_count += 1
        old_priority = ticket.priority
        ticket.priority = PRIORITY_BUMP.get(ticket.priority, "Urgent")

        escalated_ids.append(ticket.ticket_number)

        if admin_profile:
            notif = Notification(
                user_id=admin_profile.id,
                title=f"SLA Breach: Ticket {ticket.ticket_number} Escalated",
                message=(
                    f"Ticket '{ticket.subject}' breached SLA deadline. "
                    f"Priority bumped {old_priority} -> {ticket.priority}."
                ),
                type="helpdesk",
                action_link="helpdesk",
            )
            db.add(notif)

        log_action(
            db,
            actor_id="system_sla_scheduler",
            actor_role="system",
            action="HELPDESK_TICKET_ESCALATED",
            target_entity="HelpdeskTicket",
            entity_id=str(ticket.id),
            details=f"SLA deadline breached. Escalated to priority {ticket.priority}.",
        )

    db.commit()
    return {
        "status": "success",
        "escalated_count": len(escalated_ids),
        "escalated_tickets": escalated_ids,
    }
