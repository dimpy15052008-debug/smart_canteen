"""Phase 8 tests: Smart Attend geofenced biometric verification, session windows, manual overrides, rosters.

Tests
-----
1. Faculty creates attendance session for assigned course (201 Created)
2. Student cannot create attendance session (403 Forbidden)
3. Student lists active sessions for enrolled courses
4. Student marks attendance within geofence + verified biometrics (200 OK, present)
5. Student marking duplicate attendance in same session returns 409 Conflict
6. Geofence violation: coordinates outside perimeter returns 400
7. Biometric violation: failed liveness or low face confidence returns 400
8. Student not enrolled in course cannot mark attendance (403 Forbidden)
9. Marking attendance on closed/expired session returns 400
10. Faculty grants manual exception override with justification note
11. Faculty views live classroom roster for a session
12. Faculty closes active session
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


# ── Test 1: Faculty creates attendance session ─────────────────────────────────


def test_faculty_create_session(client):
    """Faculty assigned to CS601 creates a live attendance session."""
    token = get_token(client, "faculty")
    resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS601", "durationMinutes": 15},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["courseCode"] == "CS601"
    assert data["status"] == "active"
    assert data["code"].startswith("SA-")
    assert "expiresAt" in data


# ── Test 2: Student forbidden from creating session ────────────────────────────


def test_student_cannot_create_session(client):
    """Students cannot create attendance session windows (403)."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS601", "durationMinutes": 15},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


# ── Test 3: List active sessions ──────────────────────────────────────────────


def test_list_active_sessions(client):
    """Student can list active sessions for courses they are enrolled in."""
    token = get_token(client, "student")
    resp = client.get(
        "/api/v1/attendance/sessions/active",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    sessions = resp.json()
    assert isinstance(sessions, list)
    # Seed data provides an active session for CS601 (SA-601)
    assert len(sessions) >= 1
    codes = [s["courseCode"] for s in sessions]
    assert "CS601" in codes


# ── Test 4: Student marks attendance successfully (Geofence + Biometrics) ─────


def test_student_mark_attendance_success(client):
    """Student within classroom geofence with valid landmarks marks attendance."""
    # First, let faculty open a session for CS602 (since CS601 has a seed record already)
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS602", "durationMinutes": 20},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert s_resp.status_code == 201
    session_data = s_resp.json()
    session_id = session_data["id"]

    # Student marks attendance in Lab 2B - IT Center (23.2605, 77.4131)
    s_token = get_token(client, "student")
    mark_resp = client.post(
        "/api/v1/attendance/mark",
        json={
            "sessionId": session_id,
            "latitude": 23.26051,
            "longitude": 77.41312,
            "accuracy": 3.5,
            "faceConfidence": 98.4,
            "livenessVerified": True,
            "notes": "Verified via SmartAttend AI in Lab 2B",
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert mark_resp.status_code == 200, mark_resp.text
    result = mark_resp.json()
    assert result["success"] is True
    assert result["geofencePassed"] is True
    assert result["biometricPassed"] is True
    assert result["record"]["status"] == "present"
    assert result["record"]["locationVerified"] is True


# ── Test 5: Duplicate attendance prevented ────────────────────────────────────


def test_student_duplicate_attendance_rejected(client):
    """Submitting attendance twice for the same session returns 409 Conflict."""
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS603", "durationMinutes": 20},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    s_token = get_token(client, "student")
    payload = {
        "sessionId": session_id,
        "latitude": 23.2595,
        "longitude": 77.4120,
        "accuracy": 4.0,
        "faceConfidence": 96.0,
        "livenessVerified": True,
    }
    # First attempt: succeeds
    r1 = client.post(
        "/api/v1/attendance/mark", json=payload, headers={"Authorization": f"Bearer {s_token}"}
    )
    assert r1.status_code == 200

    # Second attempt: 409 Conflict
    r2 = client.post(
        "/api/v1/attendance/mark", json=payload, headers={"Authorization": f"Bearer {s_token}"}
    )
    assert r2.status_code == 409


# ── Test 6: Geofence perimeter violation ──────────────────────────────────────


def test_student_geofence_violation(client):
    """Coordinates outside the authorized classroom perimeter return 400 Bad Request."""
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS604", "durationMinutes": 20},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    s_token = get_token(client, "student")
    # CS604 is in Room 305 (23.2588, 77.4115). Student sends coordinates ~1.5km away:
    resp = client.post(
        "/api/v1/attendance/mark",
        json={
            "sessionId": session_id,
            "latitude": 23.2750,
            "longitude": 77.4250,
            "accuracy": 5.0,
            "faceConfidence": 98.0,
            "livenessVerified": True,
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 400
    assert "perimeter" in resp.text.lower() or "geofence" in resp.text.lower()


# ── Test 7: Biometric & anti-spoof violation ──────────────────────────────────


def test_student_biometric_violation(client):
    """Failed anti-spoof liveness or low face confidence returns 400 Bad Request."""
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS605", "durationMinutes": 20},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    s_token = get_token(client, "student")
    resp = client.post(
        "/api/v1/attendance/mark",
        json={
            "sessionId": session_id,
            "latitude": 23.2600,
            "longitude": 77.4128,
            "accuracy": 3.0,
            "faceConfidence": 45.0,  # Below 75% threshold
            "livenessVerified": False,  # Failed liveness challenge
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 400
    assert "biometric" in resp.text.lower() or "liveness" in resp.text.lower()


# ── Test 8: Student not enrolled in course ────────────────────────────────────


def test_student_not_enrolled(client, db):
    """Student cannot mark attendance in a course offering they are not enrolled in."""
    import uuid

    from app.models.academics import Course, Room

    # Create an un-enrolled course
    room = db.query(Room).first()
    f_token = get_token(client, "faculty")
    unrelated_course = Course(
        id=uuid.uuid4(),
        code="ME301",
        name="Thermodynamics",
        credits=4,
        semester=3,
    )
    db.add(unrelated_course)
    db.flush()

    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "ME301", "roomId": str(room.id), "durationMinutes": 15},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    if s_resp.status_code == 201:
        session_id = s_resp.json()["id"]
        s_token = get_token(client, "student")
        resp = client.post(
            "/api/v1/attendance/mark",
            json={
                "sessionId": session_id,
                "latitude": room.latitude,
                "longitude": room.longitude,
                "accuracy": 3.0,
                "faceConfidence": 99.0,
                "livenessVerified": True,
            },
            headers={"Authorization": f"Bearer {s_token}"},
        )
        assert resp.status_code == 403


# ── Test 9: Expired or closed session ─────────────────────────────────────────


def test_mark_on_closed_session(client):
    """Marking attendance on a closed session returns 400."""
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS601", "durationMinutes": 15},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    session_id = s_resp.json()["id"]

    # Close session
    close_resp = client.post(
        f"/api/v1/attendance/sessions/{session_id}/close",
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert close_resp.status_code == 200

    # Attempt to mark
    s_token = get_token(client, "student")
    resp = client.post(
        "/api/v1/attendance/mark",
        json={
            "sessionId": session_id,
            "latitude": 23.2599,
            "longitude": 77.4126,
            "accuracy": 3.0,
            "faceConfidence": 98.0,
            "livenessVerified": True,
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert resp.status_code == 400


# ── Test 10: Faculty manual exception override ────────────────────────────────


def test_faculty_manual_override(client):
    """Faculty grants a manual attendance exception with mandatory justification."""
    token = get_token(client, "faculty")
    resp = client.post(
        "/api/v1/attendance/override",
        json={
            "rollNumber": "0827CS221045",
            "courseCode": "CS604",
            "status": "manual_override",
            "reason": "Authorized university research paper presentation at IIT Delhi.",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "manual_override"
    assert data["verificationMethod"] == "manual_faculty"
    assert "IIT Delhi" in (data.get("notes") or "")
    assert data.get("correctedBy") is not None


# ── Test 11: Live classroom roster ────────────────────────────────────────────


def test_get_session_roster(client):
    """Faculty retrieves live classroom roster for a session."""
    f_token = get_token(client, "faculty")
    s_resp = client.post(
        "/api/v1/attendance/sessions",
        json={"courseCode": "CS601", "durationMinutes": 15},
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert s_resp.status_code == 201
    session_id = s_resp.json()["id"]

    # Add an override to ensure a record exists in this session
    client.post(
        f"/api/v1/attendance/{session_id}/override",
        json={
            "rollNumber": "0827CS221045",
            "status": "manual_override",
            "reason": "Class representative duty",
        },
        headers={"Authorization": f"Bearer {f_token}"},
    )

    roster_resp = client.get(
        f"/api/v1/attendance/sessions/{session_id}/roster",
        headers={"Authorization": f"Bearer {f_token}"},
    )
    assert roster_resp.status_code == 200
    data = roster_resp.json()
    assert "session" in data
    assert "records" in data
    assert isinstance(data["records"], list)
    assert len(data["records"]) >= 1


# ── Test 12: Student attendance history ───────────────────────────────────────


def test_student_attendance_records_me(client):
    """Student can retrieve their attendance records."""
    token = get_token(client, "student")
    resp = client.get(
        "/api/v1/attendance/records/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    records = resp.json()
    assert isinstance(records, list)
    assert len(records) >= 1
    assert "status" in records[0]
