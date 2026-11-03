"""Phase 5 helpdesk grievance tickets, AI classification, and SLA escalation job tests.

Acceptance:
  - Escalation test green (SLA job escalates overdue tickets, bumps priority, idempotent)
  - Accurate department routing table
  - Thread messages and ticket resolution
  - Student data isolation
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from app.models.helpdesk import HelpdeskTicket
from app.models.identity import Profile
from app.seed.seed_demo import seed
from app.services.helpdesk_service import run_sla_escalation_job


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_token(client, role: str = "student") -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": role})
    return resp.json().get("accessToken") or resp.json().get("access_token")


def test_classify_ticket_routing(client):
    """POST /api/v1/helpdesk/classify accurately categorizes IT and Finance issues."""
    resp = client.post(
        "/api/v1/helpdesk/classify",
        json={
            "subject": "Wi-Fi is terrible and frequent DNS disconnects in hostel corridor",
            "description": "Cannot connect to campus internet during lab assignments.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "IT & Wi-Fi"
    assert data["assignedDepartment"] == "Campus Network & IT Infrastructure Cell"
    assert data["priority"] == "High"
    assert data["slaHours"] == 24
    assert data["sentiment"] == "Frustrated"


def test_create_ticket_auto_classifies(client):
    """POST /api/v1/helpdesk/tickets runs server-side classification if category omitted."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/helpdesk/tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "subject": "Mess food quality in Block B",
            "description": "Water leaking in dining area and dinner food was cold.",
        },
    )
    assert resp.status_code == 200
    ticket = resp.json()
    assert ticket["category"] == "Hostel & Mess"
    assert ticket["assignedDepartment"] == "Hostel Affairs & Mess Committee"
    assert ticket["status"] == "Open"
    assert "ticketNumber" in ticket
    assert "slaDeadline" in ticket


def test_student_ticket_isolation(client):
    """Students see only their own tickets, while admins see all tickets."""
    student_token = get_token(client, "student")
    resp_student = client.get(
        "/api/v1/helpdesk/tickets", headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp_student.status_code == 200
    student_tickets = resp_student.json()
    assert all(t["studentName"] == "Faizan Ali" for t in student_tickets)

    admin_token = get_token(client, "admin")
    resp_admin = client.get(
        "/api/v1/helpdesk/tickets", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_admin.status_code == 200
    assert len(resp_admin.json()) >= len(student_tickets)


def test_messages_and_resolve_flow(client):
    """Thread messages can be appended, and admin can resolve the ticket."""
    student_token = get_token(client, "student")
    admin_token = get_token(client, "admin")

    # 1. Student adds message
    msg_resp = client.post(
        "/api/v1/helpdesk/tickets/TKT-2026-881/messages",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"message": "Any update on the technician visit?"},
    )
    assert msg_resp.status_code == 200
    assert msg_resp.json()["message"] == "Any update on the technician visit?"

    # 2. Admin resolves ticket
    resolve_resp = client.post(
        "/api/v1/helpdesk/tickets/TKT-2026-881/resolve",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"resolutionNotes": "Replaced Cisco Catalyst switch. Wi-Fi restored."},
    )
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "Resolved"
    assert "Replaced Cisco Catalyst switch" in resolve_resp.json()["resolutionNotes"]


def test_sla_escalation_job(db):
    """SLA escalation job identifies overdue active tickets, bumps priority, and escalates."""
    student = db.query(Profile).filter_by(role="student").first()
    now = datetime.now(UTC)

    # Create an overdue ticket (deadline was 3 hours ago)
    overdue_ticket = HelpdeskTicket(
        ticket_number="TKT-OVERDUE-001",
        student_id=student.id,
        subject="Water leakage in room 304",
        description="Bathroom tap broken and leaking onto the floor.",
        category="Hostel & Mess",
        priority="Medium",
        assigned_department="Hostel Affairs & Mess Committee",
        status="Open",
        sla_deadline=now - timedelta(hours=3),
        escalation_count=0,
    )
    db.add(overdue_ticket)
    db.commit()

    # 1. Run SLA escalation job
    result = run_sla_escalation_job(db)
    assert result["status"] == "success"
    assert "TKT-OVERDUE-001" in result["escalated_tickets"]

    # Verify ticket state
    db.refresh(overdue_ticket)
    assert overdue_ticket.status == "Escalated"
    assert overdue_ticket.priority == "High"  # Medium was bumped to High
    assert overdue_ticket.escalation_count == 1

    # 2. Re-run SLA job to verify idempotency (should not re-escalate)
    result_second = run_sla_escalation_job(db)
    assert "TKT-OVERDUE-001" not in result_second["escalated_tickets"]
    db.refresh(overdue_ticket)
    assert overdue_ticket.escalation_count == 1
