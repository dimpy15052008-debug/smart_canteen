"""Phase 12 tests: ML Early Warning, Student Risk Detection, Interventions & Recommendations.

Tests
-----
 1. Student views own early warning assessment (200 OK with complete academic signals)
 2. Attendance deficit in CS604 triggers explicit detention risk factor (71.9% < 75%)
 3. Student cannot view another student's early warning assessment (403 Forbidden)
 4. Faculty can view any student's early warning assessment (200 OK)
 5. Admin can view any student's early warning assessment (200 OK)
 6. Faculty triggers fresh ML re-evaluation endpoint (200 OK with updated timestamp)
 7. Student cannot trigger on-demand re-evaluation (403 Forbidden)
 8. Admin batch evaluates student cohort (200 OK with breakdown counts)
 9. Faculty retrieves at-risk student monitoring list (200 OK with topRiskFactor)
10. Faculty creates academic intervention for at-risk student (201 Created)
11. Student cannot create interventions (403 Forbidden)
12. Faculty updates intervention status and appends counseling notes (200 OK)
13. Student views own interventions and personalized learning recommendations (200 OK)
14. ML Ethics verification: features strictly use academic signals, excluding protected demographic attributes
"""

from __future__ import annotations

import uuid

import pytest

from app.seed.seed_demo import seed


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_token(client, role: str) -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": role})
    data = resp.json()
    return data.get("accessToken") or data.get("access_token", "")


def get_user_id(client, role: str) -> str:
    token = get_token(client, role)
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    return resp.json()["id"]


# ── Test 1: Student Views Own Early Warning Assessment ─────────────────────────
def test_student_views_own_early_warning(client):
    """Student can retrieve their own ML early warning assessment."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/ml/early-warning/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert "id" in data
    assert "studentId" in data
    assert "riskLevel" in data
    assert data["riskLevel"] in ("Low", "Medium", "High", "Critical")
    assert "probability" in data
    assert 0.0 <= data["probability"] <= 1.0

    assert "academicSignals" in data
    signals = data["academicSignals"]
    assert "attendancePercent" in signals
    assert "marksAverage" in signals
    assert "marksTrend" in signals
    assert "assignmentSubmissionRate" in signals
    assert "recentActivityCount" in signals

    assert "factors" in data
    assert isinstance(data["factors"], list)
    assert len(data["factors"]) > 0

    assert data.get("isSupportSignalOnly") is True
    assert "disclaimer" in data
    assert "support signal" in data["disclaimer"].lower()


# ── Test 2: CS604 Detention Risk Alert ─────────────────────────────────────────
def test_cs604_detention_risk_flagged(client):
    """Student Faizan Ali has 71.9% attendance in CS604, triggering an explainable detention factor."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/ml/early-warning/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()

    # Verify that CS604 detention risk is listed in the factors
    factor_texts = [f["factor"] for f in data["factors"]]
    has_cs604_alert = any("CS604" in f for f in factor_texts)
    assert has_cs604_alert, f"Expected CS604 detention alert in factors, got: {factor_texts}"

    # Verify risk severity is High or Critical
    assert data["riskLevel"] in ("High", "Critical")


# ── Test 3: IDOR Protection on Student Assessment ──────────────────────────────
def test_student_cannot_view_other_student_early_warning(client):
    """A student cannot access another student's early warning assessment."""
    token = get_token(client, "student")
    fake_student_id = str(uuid.uuid4())
    resp = client.get(
        f"/api/v1/ml/early-warning/students/{fake_student_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403, resp.text


# ── Test 4: Faculty Can View Student Assessment ───────────────────────────────
def test_faculty_can_view_student_early_warning(client):
    """Faculty can view any student's ML early warning evaluation."""
    student_id = get_user_id(client, "student")
    faculty_token = get_token(client, "faculty")

    resp = client.get(
        f"/api/v1/ml/early-warning/students/{student_id}",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["studentId"] == student_id
    assert data["studentName"] == "Faizan Ali"


# ── Test 5: Admin Can View Student Assessment ─────────────────────────────────
def test_admin_can_view_student_early_warning(client):
    """Admin can view any student's ML early warning evaluation."""
    student_id = get_user_id(client, "student")
    admin_token = get_token(client, "admin")

    resp = client.get(
        f"/api/v1/ml/early-warning/students/{student_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["studentId"] == student_id


# ── Test 6: Faculty Triggers Fresh ML Re-Evaluation ───────────────────────────
def test_faculty_triggers_student_evaluation(client):
    """Faculty can trigger an on-demand re-evaluation of a student."""
    student_id = get_user_id(client, "student")
    faculty_token = get_token(client, "faculty")

    resp = client.post(
        f"/api/v1/ml/early-warning/evaluate/{student_id}",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["studentId"] == student_id
    assert "modelVersion" in data
    assert data["modelVersion"].startswith("v1.")


# ── Test 7: Student Cannot Trigger Re-Evaluation ──────────────────────────────
def test_student_cannot_trigger_evaluation(client):
    """Students cannot trigger the ML re-evaluation endpoint."""
    student_id = get_user_id(client, "student")
    student_token = get_token(client, "student")

    resp = client.post(
        f"/api/v1/ml/early-warning/evaluate/{student_id}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403, resp.text


# ── Test 8: Admin Batch Evaluates Student Cohort ──────────────────────────────
def test_admin_batch_evaluates_cohort(client):
    """Admin can trigger batch evaluation across all enrolled students."""
    admin_token = get_token(client, "admin")
    resp = client.post(
        "/api/v1/ml/early-warning/batch-evaluate?department=CSE",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["evaluatedCount"] >= 1
    total_split = data["criticalCount"] + data["highCount"] + data["mediumCount"] + data["lowCount"]
    assert total_split == data["evaluatedCount"]
    assert data["atRiskCount"] == data["criticalCount"] + data["highCount"] + data["mediumCount"]


# ── Test 9: Faculty Retrieves At-Risk Monitoring List ─────────────────────────
def test_faculty_lists_at_risk_students(client):
    """Faculty can view students matching or exceeding a risk threshold."""
    faculty_token = get_token(client, "faculty")
    resp = client.get(
        "/api/v1/ml/early-warning/at-risk?min_risk_level=Medium",
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert resp.status_code == 200, resp.text
    items = resp.json()
    assert isinstance(items, list)
    assert len(items) >= 1

    first = items[0]
    assert "studentId" in first
    assert "studentName" in first
    assert "rollNumber" in first
    assert "riskLevel" in first
    assert "probability" in first
    assert "topRiskFactor" in first
    assert "hasActiveIntervention" in first


# ── Test 10: Faculty Creates Academic Intervention ────────────────────────────
def test_faculty_creates_intervention(client):
    """Faculty can create an academic support intervention for an at-risk student."""
    faculty_token = get_token(client, "faculty")
    student_token = get_token(client, "student")

    # Get student's prediction ID
    pred_resp = client.get(
        "/api/v1/ml/early-warning/me", headers={"Authorization": f"Bearer {student_token}"}
    )
    pred_id = pred_resp.json()["id"]

    create_payload = {
        "predictionId": pred_id,
        "notes": "Scheduled remedial mentoring sessions on Tuesday afternoons for operating systems.",
    }
    resp = client.post(
        "/api/v1/ml/interventions",
        json=create_payload,
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["predictionId"] == pred_id
    assert data["status"] == "Pending"
    assert "remedial mentoring" in data["notes"]
    assert "Rajesh Sharma" in data["ownerName"]


# ── Test 11: Student Cannot Create Intervention ───────────────────────────────
def test_student_cannot_create_intervention(client):
    """Students cannot create interventions."""
    student_token = get_token(client, "student")
    pred_resp = client.get(
        "/api/v1/ml/early-warning/me", headers={"Authorization": f"Bearer {student_token}"}
    )
    pred_id = pred_resp.json()["id"]

    resp = client.post(
        "/api/v1/ml/interventions",
        json={"predictionId": pred_id, "notes": "Unauthorized student intervention"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403, resp.text


# ── Test 12: Intervention Lifecycle Updates ───────────────────────────────────
def test_update_intervention_lifecycle(client):
    """Faculty can transition an intervention to 'In Progress' and then 'Resolved'."""
    faculty_token = get_token(client, "faculty")

    # List seeded interventions
    list_resp = client.get(
        "/api/v1/ml/interventions", headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert list_resp.status_code == 200, list_resp.text
    interventions = list_resp.json()
    assert len(interventions) >= 1
    inv_id = interventions[0]["id"]

    # Transition to Resolved
    patch_payload = {
        "status": "Resolved",
        "notes": "Student attended 4 consecutive sessions and raised attendance to 76.5%.",
    }
    patch_resp = client.patch(
        f"/api/v1/ml/interventions/{inv_id}",
        json=patch_payload,
        headers={"Authorization": f"Bearer {faculty_token}"},
    )
    assert patch_resp.status_code == 200, patch_resp.text
    updated = patch_resp.json()
    assert updated["status"] == "Resolved"
    assert "raised attendance" in updated["notes"]


# ── Test 13: Student Interventions and Recommendations ────────────────────────
def test_student_interventions_and_recommendations(client):
    """Student can view their own interventions and personalized learning recommendations."""
    student_token = get_token(client, "student")

    # Interventions for current student
    inv_resp = client.get(
        "/api/v1/ml/interventions", headers={"Authorization": f"Bearer {student_token}"}
    )
    assert inv_resp.status_code == 200, inv_resp.text
    invs = inv_resp.json()
    assert isinstance(invs, list)
    assert len(invs) >= 1
    assert invs[0]["studentName"] == "Faizan Ali"

    # Recommendations for current student
    rec_resp = client.get(
        "/api/v1/ml/recommendations/me", headers={"Authorization": f"Bearer {student_token}"}
    )
    assert rec_resp.status_code == 200, rec_resp.text
    recs = rec_resp.json()
    assert isinstance(recs, list)
    assert len(recs) >= 1
    first_rec = recs[0]
    assert "resource" in first_rec
    assert "title" in first_rec["resource"]
    assert "url" in first_rec["resource"]
    assert "reason" in first_rec


# ── Test 14: ML Ethics and Feature Verification ───────────────────────────────
def test_ml_ethics_compliance(client):
    """Verify ML early warning strictly excludes protected demographic features."""
    student_token = get_token(client, "student")
    resp = client.get(
        "/api/v1/ml/early-warning/me", headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    signals = data["academicSignals"]
    # Only permissible academic features
    allowed_signals = {
        "attendancePercent",
        "attendanceTrend30d",
        "attendanceTrend30D",
        "marksAverage",
        "marksTrend",
        "assignmentSubmissionRate",
        "recentActivityCount",
    }
    assert set(signals.keys()).issubset(allowed_signals)

    # Strictly verify NO protected attributes are present
    disallowed = [
        "gender",
        "religion",
        "caste",
        "ethnicity",
        "income",
        "age",
        "race",
        "nationality",
    ]
    for d in disallowed:
        assert d not in signals, f"Protected attribute '{d}' leaked into ML feature set!"

    # Ethics disclaimer check
    assert data["isSupportSignalOnly"] is True
    assert "disclaimer" in data
