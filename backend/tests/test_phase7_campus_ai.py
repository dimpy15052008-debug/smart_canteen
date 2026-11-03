"""Phase 7 tests: CampusAI, tool-calling executors, persistence, heuristic fallback.

Tests
-----
1. Attendance query via /api/v1/ai/chat returns attendance action + reply
2. Fee query returns fee action + balance info
3. Timetable query returns timetable action
4. Transport query returns transport action
5. Hostel query returns hostel action
6. Conversation persistence: conversation ID returned, message history retrieved
7. List conversations endpoint returns conversations
8. Persona tone support (cool_buddy, wise_prof)
9. Legacy /api/ai/chat endpoint works
10. Legacy /api/ai/classify-ticket endpoint works
"""

from __future__ import annotations

import pytest

from app.seed.seed_demo import seed

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_token(client, role: str) -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": role})
    data = resp.json()
    return data.get("accessToken") or data.get("access_token", "")


# ── Test 1: Attendance query ──────────────────────────────────────────────────


def test_ai_chat_attendance(client):
    """Asking about attendance returns real attendance lookup data."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/ai/chat",
        json={"message": "What is my attendance percentage?", "persona": "default"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data.get("actionExecuted") is not None
    action = data["actionExecuted"]
    assert action["type"] == "attendance_lookup"
    # Verify course data is returned
    courses = action.get("data", [])
    assert len(courses) > 0


# ── Test 2: Fee query ─────────────────────────────────────────────────────────


def test_ai_chat_fees(client):
    """Asking about fees returns fee status and balance."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/ai/chat",
        json={"message": "How much fee is pending for my semester?", "persona": "default"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "reply" in data
    assert data.get("actionExecuted") is not None
    action = data["actionExecuted"]
    assert action["type"] == "fee_lookup"
    fee_data = action.get("data", {})
    assert "pending" in fee_data or "total" in fee_data


# ── Test 3: Timetable query ───────────────────────────────────────────────────


def test_ai_chat_timetable(client):
    """Asking about timetable returns timetable lookup action."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/ai/chat",
        json={"message": "What is my timetable today?", "persona": "default"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "reply" in data
    assert data.get("actionExecuted") is not None
    assert data["actionExecuted"]["type"] == "timetable_lookup"


# ── Test 4: Transport query ───────────────────────────────────────────────────


def test_ai_chat_transport(client):
    """Asking about campus bus/transport returns transport info."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/ai/chat",
        json={"message": "Where is my bus route?", "persona": "default"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "reply" in data
    assert data.get("actionExecuted") is not None
    assert data["actionExecuted"]["type"] == "transport_lookup"


# ── Test 5: Hostel query ──────────────────────────────────────────────────────


def test_ai_chat_hostel(client):
    """Asking about hostel returns hostel info."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/ai/chat",
        json={"message": "Tell me about my hostel and warden details", "persona": "default"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "reply" in data
    assert data.get("actionExecuted") is not None
    assert data["actionExecuted"]["type"] == "hostel_lookup"


# ── Test 6: Conversation persistence & message history ────────────────────────


def test_conversation_persistence_and_history(client):
    """Chat messages are persisted and can be retrieved by conversation ID."""
    token = get_token(client, "student")
    headers = {"Authorization": f"Bearer {token}"}

    # First turn
    resp1 = client.post(
        "/api/v1/ai/chat",
        json={"message": "Hello CampusAI", "persona": "cool_buddy"},
        headers=headers,
    )
    assert resp1.status_code == 200
    conv_id = resp1.json().get("conversationId")
    assert conv_id is not None

    # Second turn in the same conversation
    resp2 = client.post(
        "/api/v1/ai/chat",
        json={
            "conversationId": conv_id,
            "message": "What is my attendance?",
            "persona": "cool_buddy",
        },
        headers=headers,
    )
    assert resp2.status_code == 200
    assert resp2.json().get("conversationId") == conv_id

    # Retrieve history
    hist_resp = client.get(f"/api/v1/ai/conversations/{conv_id}/messages", headers=headers)
    assert hist_resp.status_code == 200
    messages = hist_resp.json()
    assert len(messages) >= 4  # 2 user messages + 2 model/assistant messages
    roles = [m["role"] for m in messages]
    assert "user" in roles


# ── Test 7: List conversations ────────────────────────────────────────────────


def test_list_conversations(client):
    """Listing conversations returns the user's recent conversations."""
    token = get_token(client, "student")
    headers = {"Authorization": f"Bearer {token}"}

    # Start a chat to ensure at least one conversation exists
    client.post(
        "/api/v1/ai/chat",
        json={"message": "Who are you?", "persona": "wise_prof"},
        headers=headers,
    )

    resp = client.get("/api/v1/ai/conversations", headers=headers)
    assert resp.status_code == 200
    convs = resp.json()
    assert isinstance(convs, list)
    assert len(convs) >= 1
    assert "title" in convs[0]
    assert "id" in convs[0]


# ── Test 8: Personas support ──────────────────────────────────────────────────


def test_ai_chat_personas(client):
    """Different personas are accepted and produce successful responses."""
    token = get_token(client, "student")
    headers = {"Authorization": f"Bearer {token}"}

    for persona in ["cool_buddy", "wise_prof", "sparky", "comedic"]:
        resp = client.post(
            "/api/v1/ai/chat",
            json={"message": "Tell me a joke", "persona": persona},
            headers=headers,
        )
        assert resp.status_code == 200, f"Failed for persona {persona}"
        data = resp.json()
        assert len(data.get("reply", "")) > 0


# ── Test 9: Legacy chat endpoint ──────────────────────────────────────────────


def test_legacy_chat_endpoint(client):
    """Legacy /api/ai/chat endpoint works without authentication in dev mode."""
    resp = client.post(
        "/api/ai/chat",
        json={"message": "What is my attendance?", "persona": "cool_buddy"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert len(data["reply"]) > 0


# ── Test 10: Legacy ticket classification ─────────────────────────────────────


def test_legacy_classify_ticket(client):
    """Legacy /api/ai/classify-ticket delegates to real classifier."""
    resp = client.post(
        "/api/ai/classify-ticket",
        json={
            "subject": "Wi-Fi not connecting in hostel room 304",
            "description": "The campus wifi router keeps disconnecting frequently.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "IT & Wi-Fi"
    assert data["assignedDepartment"] == "Campus Network & IT Infrastructure Cell"
    assert "slaHours" in data
