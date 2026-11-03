"""Phase 11 tests: Admin Analytics — KPIs, departmental attendance, grievance breakdown, audit trail.

Tests
-----
 1. Admin retrieves full analytics snapshot (200 OK)
 2. Analytics KPIs contain required fields with sensible values
 3. Departmental attendance contains all 5 benchmarked departments
 4. Campus overall attendance % is >= 79% (worst dept floor)
 5. Grievance breakdown list is non-empty
 6. Recent audit logs list is non-empty and matches seeded entries
 7. Audit log entries have required fields (action, performed_by, timestamp, etc.)
 8. Student role cannot access /admin/analytics (403 Forbidden)
 9. Admin retrieves paginated audit trail via /admin/audit-logs
10. Pagination offset param works (offset=1 returns one fewer entry)
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


# ── Test 1: Admin Gets Analytics ──────────────────────────────────────────────


def test_admin_gets_analytics_snapshot(client):
    """Admin can retrieve the full analytics snapshot."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "kpis" in data
    assert "departmentalAttendance" in data
    assert "grievanceBreakdown" in data
    assert "recentAuditLogs" in data


# ── Test 2: KPIs Have Correct Fields and Values ───────────────────────────────


def test_analytics_kpis_sensible_values(client):
    """KPI fields are present and have realistic values."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    kpis = resp.json()["kpis"]

    # Required fields
    assert "campusOverallAttendancePct" in kpis
    assert "canteenDailyOrderCount" in kpis
    assert "grievanceSlaCompliancePct" in kpis
    assert "certificatesIssued" in kpis
    assert "activeStudents" in kpis
    assert "openTickets" in kpis
    assert "avgResolutionHours" in kpis

    # Sanity bounds
    assert 0 <= kpis["campusOverallAttendancePct"] <= 100
    assert kpis["canteenDailyOrderCount"] >= 0
    assert 0 <= kpis["grievanceSlaCompliancePct"] <= 100
    assert kpis["certificatesIssued"] >= 0
    assert kpis["activeStudents"] >= 1  # at least seeded student
    assert kpis["avgResolutionHours"] >= 0


# ── Test 3: Departmental Attendance Contains All 5 Departments ────────────────


def test_departmental_attendance_five_rows(client):
    """Analytics returns departmental attendance for all 5 benchmarked departments."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    dept_rows = resp.json()["departmentalAttendance"]

    assert len(dept_rows) == 5
    dept_names = {r["department"] for r in dept_rows}
    assert "Computer Science & Engineering" in dept_names
    assert "Information Technology" in dept_names
    assert "Electronics & Communication" in dept_names
    assert "Mechanical Engineering" in dept_names
    assert "Civil Engineering" in dept_names


# ── Test 4: Campus Overall Attendance >=79% ───────────────────────────────────


def test_campus_overall_attendance_floor(client):
    """Campus overall attendance must be above the worst department (79.5%)."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    pct = resp.json()["kpis"]["campusOverallAttendancePct"]
    assert pct >= 79.0, f"Expected >= 79%, got {pct}%"


# ── Test 5: Grievance Breakdown Non-Empty ─────────────────────────────────────


def test_grievance_breakdown_non_empty(client):
    """Grievance category breakdown returns at least one entry."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    breakdown = resp.json()["grievanceBreakdown"]
    assert isinstance(breakdown, list)
    assert len(breakdown) >= 1
    # Each row must have required fields
    row = breakdown[0]
    assert "category" in row
    assert "count" in row
    assert "sharePct" in row


# ── Test 6: Audit Logs Non-Empty ──────────────────────────────────────────────


def test_audit_logs_non_empty(client):
    """Recent audit logs list contains at least the 4 seeded entries."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    logs = resp.json()["recentAuditLogs"]
    assert isinstance(logs, list)
    assert len(logs) >= 4  # 4 seeded audit log entries


# ── Test 7: Audit Log Entry Fields ───────────────────────────────────────────


def test_audit_log_entry_fields(client):
    """Each audit log entry has all required fields matching AuditLog frontend type."""
    token = get_token(client, "admin")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    entry = resp.json()["recentAuditLogs"][0]

    assert "id" in entry
    assert "action" in entry
    assert "performedBy" in entry
    assert "role" in entry
    assert "targetEntity" in entry
    assert "entityId" in entry
    assert "details" in entry
    assert "timestamp" in entry
    assert "ipAddress" in entry

    # Verify seeded action names appear
    actions = {e["action"] for e in resp.json()["recentAuditLogs"]}
    assert any(
        a in actions
        for a in [
            "ATTENDANCE_VERIFIED_GEO_FACE",
            "CERTIFICATE_DIGITALLY_SIGNED",
            "FEE_PAYMENT_PROCESSED",
            "CANTEEN_ORDER_PLACED",
        ]
    )


# ── Test 8: Student Forbidden from Admin Analytics ────────────────────────────


def test_student_cannot_access_admin_analytics(client):
    """Student role receives 403 when accessing admin analytics endpoint."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403, resp.text


# ── Test 9: Paginated Audit Trail ─────────────────────────────────────────────


def test_admin_audit_trail_paginated(client):
    """GET /api/v1/admin/audit-logs returns audit log entries."""
    token = get_token(client, "admin")
    resp = client.get(
        "/api/v1/admin/audit-logs?limit=10&offset=0",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    logs = resp.json()
    assert isinstance(logs, list)
    assert len(logs) >= 4  # at least 4 seeded


# ── Test 10: Pagination Offset Works ─────────────────────────────────────────


def test_audit_trail_offset_reduces_results(client):
    """Applying offset=1 returns one fewer entry than offset=0."""
    token = get_token(client, "admin")

    resp_0 = client.get(
        "/api/v1/admin/audit-logs?limit=100&offset=0",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp_1 = client.get(
        "/api/v1/admin/audit-logs?limit=100&offset=1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_0.status_code == 200
    assert resp_1.status_code == 200

    all_count = len(resp_0.json())
    offset_count = len(resp_1.json())
    assert all_count > 0
    assert offset_count == all_count - 1
