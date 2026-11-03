"""Phase 6 tests: Certificates, eligibility engine, PDF+QR, public verify.

Tests
-----
1. Student can request a Bonafide Certificate — eligibility checks present
2. Invalid certificate type is rejected (400)
3. Student can list own certificate requests
4. Admin can approve a pending certificate → status = ready_for_download
5. Admin can reject a pending certificate → status = rejected
6. Student can download an approved certificate PDF (valid PDF bytes)
7. Public verify returns valid=True for an issued certificate
8. Public verify returns valid=False for unknown code
9. Downloading a not-yet-approved certificate returns 400
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


# ── Test 1: Request Bonafide Certificate ──────────────────────────────────────


def test_request_certificate_bonafide(client):
    """Student with active enrollment can submit a Bonafide Certificate request."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Bonafide Certificate",
            "purpose": "Required for bank account opening.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["certificateType"] == "Bonafide Certificate"
    assert data["status"] in ("pending", "ineligible")
    checks = data["eligibilityChecks"]
    assert isinstance(checks, list) and len(checks) > 0
    rules = [c["rule"] for c in checks]
    assert "enrollment_status" in rules
    assert "fee_clearance" in rules


# ── Test 2: Invalid certificate type rejected ─────────────────────────────────


def test_request_invalid_cert_type(client):
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Degree Certificate",
            "purpose": "For job application purposes.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400, resp.text


# ── Test 3: List own certificates ─────────────────────────────────────────────


def test_list_my_certificates(client):
    token = get_token(client, "student")
    # Create one first
    client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Character Certificate",
            "purpose": "Required for passport application.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    items = resp.json()
    assert isinstance(items, list) and len(items) >= 1


# ── Test 4: Admin approves a certificate ─────────────────────────────────────


def test_admin_approve_certificate(client):
    student_token = get_token(client, "student")
    admin_token = get_token(client, "admin")

    # Student requests
    req_resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Bonafide Certificate",
            "purpose": "Needed for scholarship application.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert req_resp.status_code == 201, req_resp.text
    cert_id = req_resp.json()["id"]

    # Admin approves
    action_resp = client.post(
        f"/api/v1/certificates/{cert_id}/action",
        json={"action": "approve"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert action_resp.status_code == 200, action_resp.text
    data = action_resp.json()
    assert data["status"] == "ready_for_download"
    assert data["verificationCode"] is not None
    assert len(data["verificationCode"]) == 32  # 16-byte hex = 32 chars
    assert data["documentHash"] is not None


# ── Test 5: Admin rejects a certificate ──────────────────────────────────────


def test_admin_reject_certificate(client):
    student_token = get_token(client, "student")
    admin_token = get_token(client, "admin")

    req_resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Character Certificate",
            "purpose": "Required for visa application.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert req_resp.status_code == 201, req_resp.text
    cert_id = req_resp.json()["id"]

    reject_resp = client.post(
        f"/api/v1/certificates/{cert_id}/action",
        json={"action": "reject", "remarks": "Disciplinary action pending."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reject_resp.status_code == 200, reject_resp.text
    data = reject_resp.json()
    assert data["status"] == "rejected"
    rules = [c["rule"] for c in data["eligibilityChecks"]]
    assert "admin_decision" in rules


# ── Test 6: PDF download for approved certificate ────────────────────────────


def test_download_certificate_pdf(client):
    student_token = get_token(client, "student")
    admin_token = get_token(client, "admin")

    req_resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Bonafide Certificate",
            "purpose": "For internship letter.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert req_resp.status_code == 201, req_resp.text
    cert_id = req_resp.json()["id"]

    client.post(
        f"/api/v1/certificates/{cert_id}/action",
        json={"action": "approve"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    dl_resp = client.get(
        f"/api/v1/certificates/{cert_id}/download",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert dl_resp.status_code == 200, dl_resp.text
    assert "pdf" in dl_resp.headers["content-type"]
    assert dl_resp.content[:4] == b"%PDF"


# ── Test 7: Public verify — valid certificate ─────────────────────────────────


def test_public_verify_valid(client):
    student_token = get_token(client, "student")
    admin_token = get_token(client, "admin")

    req_resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Bonafide Certificate",
            "purpose": "For education loan.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    cert_id = req_resp.json()["id"]

    approve_resp = client.post(
        f"/api/v1/certificates/{cert_id}/action",
        json={"action": "approve"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    vc = approve_resp.json()["verificationCode"]

    verify_resp = client.get(f"/api/v1/certificates/verify/{vc}")
    assert verify_resp.status_code == 200, verify_resp.text
    data = verify_resp.json()
    assert data["valid"] is True
    assert data["certificateType"] == "Bonafide Certificate"
    assert data["studentName"] is not None
    assert data["documentHash"] is not None


# ── Test 8: Public verify — invalid code ─────────────────────────────────────


def test_public_verify_invalid(client):
    verify_resp = client.get("/api/v1/certificates/verify/DEADBEEF00000000NOTEXIST")
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert data["valid"] is False


# ── Test 9: Download not-ready certificate returns 400 ───────────────────────


def test_download_not_ready_returns_400(client):
    student_token = get_token(client, "student")

    req_resp = client.post(
        "/api/v1/certificates/request",
        json={
            "certificateType": "Character Certificate",
            "purpose": "For job application.",
            "academicYear": "2025-2026",
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    cert_id = req_resp.json()["id"]

    dl_resp = client.get(
        f"/api/v1/certificates/{cert_id}/download",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert dl_resp.status_code == 400, dl_resp.text
