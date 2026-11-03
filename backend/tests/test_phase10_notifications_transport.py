"""Phase 10 tests: Notifications + SSE + Live Transport Telemetry.

Tests
-----
 1. Student retrieves all notifications (4 seeded)
 2. Student can filter to unread-only notifications
 3. Student marks a single notification as read
 4. Marking an unknown notification ID returns 404
 5. Marking a notification belonging to another user returns 403
 6. Student marks all notifications as read
 7. List bus routes returns all seeded routes (Route 4 + Route 2)
 8. Route 4 details include correct driver, vehicle, and coordinates
 9. Route 4 stops list is populated with correct names
10. Get unknown route ID returns 404
11. SSE transport stream endpoint returns text/event-stream content type
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


# ── Test 1: List All Notifications ────────────────────────────────────────────


def test_list_all_notifications(client):
    """Student retrieves all 4 seeded notifications."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    # Each notification has required fields
    n = data[0]
    assert "id" in n
    assert "title" in n
    assert "message" in n
    assert "type" in n
    assert "timestamp" in n
    assert "read" in n


# ── Test 2: Unread Only Filter ────────────────────────────────────────────────


def test_list_unread_only_notifications(client):
    """Student filters to only unread notifications."""
    token = get_token(client, "student")
    resp = client.get(
        "/api/v1/notifications?unreadOnly=true",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    # All returned must be unread
    for n in data:
        assert n["read"] is False


# ── Test 3: Mark Single Notification Read ─────────────────────────────────────


def test_mark_single_notification_read(client):
    """Student marks one notification as read."""
    token = get_token(client, "student")

    # Get the first unread notification
    all_resp = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    notifications = all_resp.json()
    unread = [n for n in notifications if not n["read"]]
    assert len(unread) > 0, "Expected at least one unread notification"

    target_id = unread[0]["id"]
    resp = client.patch(
        f"/api/v1/notifications/{target_id}/read",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    result = resp.json()
    assert result["id"] == target_id
    assert result["read"] is True


# ── Test 4: Unknown Notification ID ───────────────────────────────────────────


def test_mark_unknown_notification_returns_404(client):
    """Marking a non-existent notification ID returns 404."""
    import uuid

    token = get_token(client, "student")
    fake_id = str(uuid.uuid4())
    resp = client.patch(
        f"/api/v1/notifications/{fake_id}/read",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404, resp.text


# ── Test 5: Cross-User Notification Isolation ─────────────────────────────────


def test_mark_other_user_notification_returns_403(client, db):
    """Marking another user's notification returns 403."""
    from app.models.identity import Profile
    from app.models.platform import Notification

    # Get student profile
    student_profile = db.query(Profile).filter_by(email="faizan.ali@smartuni.edu.in").first()
    assert student_profile is not None

    # Create a notification for the admin profile instead
    admin_profile = db.query(Profile).filter_by(role="admin").first()
    assert admin_profile is not None

    admin_notif = Notification(
        user_id=admin_profile.id,
        title="Admin Only Notification",
        message="Not for student",
        type="system",
        read=False,
    )
    db.add(admin_notif)
    db.flush()
    notif_id = str(admin_notif.id)

    # Student tries to mark admin's notification as read
    token = get_token(client, "student")
    resp = client.patch(
        f"/api/v1/notifications/{notif_id}/read",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403, resp.text


# ── Test 6: Mark All Notifications Read ───────────────────────────────────────


def test_mark_all_notifications_read(client):
    """Mark all unread notifications at once."""
    token = get_token(client, "student")

    # Confirm there are unread first
    before = client.get(
        "/api/v1/notifications?unreadOnly=true",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    assert len(before) > 0, "Need at least one unread to test mark-all"

    resp = client.post(
        "/api/v1/notifications/read-all",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    result = resp.json()
    assert "updated" in result
    assert result["updated"] >= len(before)

    # Confirm no more unread
    after = client.get(
        "/api/v1/notifications?unreadOnly=true",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    assert len(after) == 0


# ── Test 7: List Bus Routes ───────────────────────────────────────────────────


def test_list_bus_routes(client):
    """Returns all seeded bus routes (Route 4 + Route 2)."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/transport/routes", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    route_numbers = {r["routeNumber"] for r in data}
    assert "Route 4" in route_numbers
    assert "Route 2" in route_numbers


# ── Test 8: Route 4 Details ───────────────────────────────────────────────────


def test_route4_details(client, db):
    """Route 4 has correct driver, vehicle number, and coordinates."""
    from app.models.hostel_transport import BusRoute

    route4 = db.query(BusRoute).filter_by(route_number="Route 4").first()
    assert route4 is not None, "Route 4 must be seeded"
    route4_id = str(route4.id)

    token = get_token(client, "student")
    resp = client.get(
        f"/api/v1/transport/routes/{route4_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["routeNumber"] == "Route 4"
    assert data["driverName"] == "Sukhdev Singh"
    assert data["driverPhone"] == "+91 94250 11223"
    assert data["vehicleNumber"] == "MP-04-E-4421"
    assert data["capacity"] == 48
    assert "coordinates" in data
    coords = data["coordinates"]
    assert abs(coords["lat"] - 23.259933) < 0.01
    assert abs(coords["lng"] - 77.412615) < 0.01


# ── Test 9: Route 4 Stops ─────────────────────────────────────────────────────


def test_route4_stops_populated(client, db):
    """Route 4 stop list includes Gandhi Nagar Square and University Main Gate."""
    from app.models.hostel_transport import BusRoute

    route4 = db.query(BusRoute).filter_by(route_number="Route 4").first()
    assert route4 is not None

    token = get_token(client, "student")
    resp = client.get(
        f"/api/v1/transport/routes/{str(route4.id)}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert "stops" in data
    stop_names = {s["name"] for s in data["stops"]}
    assert "Gandhi Nagar Square" in stop_names
    assert "University Main Gate" in stop_names

    # Current stop and next stop must be populated
    assert data["currentStop"] == "Gandhi Nagar Square"
    assert data["nextStop"] == "University Main Gate"
    assert data["etaMinutes"] == 6


# ── Test 10: Unknown Route Returns 404 ───────────────────────────────────────


def test_get_unknown_route_returns_404(client):
    """Requesting a non-existent route ID returns 404."""
    import uuid

    token = get_token(client, "student")
    fake_id = str(uuid.uuid4())
    resp = client.get(
        f"/api/v1/transport/routes/{fake_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404, resp.text


# ── Test 11: SSE Stream Content-Type ─────────────────────────────────────────


def test_sse_stream_content_type(client):
    """SSE /transport/stream endpoint returns text/event-stream content type with valid data."""
    token = get_token(client, "student")
    # max_events=1 + interval=0 ensures the generator terminates after exactly one push
    resp = client.get(
        "/api/v1/transport/stream?max_events=1&interval=0",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    content_type = resp.headers.get("content-type", "")
    assert "text/event-stream" in content_type
    # Body should contain the SSE data prefix
    assert b"data:" in resp.content
