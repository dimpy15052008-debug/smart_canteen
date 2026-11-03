"""Phase 0 health endpoint smoke tests."""

from __future__ import annotations


def test_liveness(client):
    """GET /api/health returns 200 with status=healthy."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "env" in data


def test_auth_status(client):
    """GET /api/v1/auth/status returns auth mode."""
    resp = client.get("/api/v1/auth/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["authMode"] in ("dev", "supabase")


def test_legacy_classify_ticket_it_wifi(client):
    """POST /api/ai/classify-ticket correctly classifies an IT/Wi-Fi issue."""
    resp = client.post(
        "/api/ai/classify-ticket",
        json={
            "subject": "Wi-Fi disconnects every 15 minutes",
            "description": "The network in hostel block B keeps dropping DNS.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "IT & Wi-Fi"
    assert data["assignedDepartment"] == "Campus Network & IT Infrastructure Cell"
    assert data["slaHours"] == 24


def test_legacy_classify_ticket_finance(client):
    """POST /api/ai/classify-ticket correctly classifies a Finance issue."""
    resp = client.post(
        "/api/ai/classify-ticket",
        json={
            "subject": "Fee payment receipt not received",
            "description": "I paid my semester fee but have not received the receipt.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "Finance"
    assert data["slaHours"] == 72


def test_legacy_chat_returns_reply(client):
    """POST /api/ai/chat returns a reply string."""
    resp = client.post(
        "/api/ai/chat",
        json={"message": "What are my pending fees?"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0
