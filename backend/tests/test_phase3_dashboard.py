"""Phase 3 student dashboard read API tests.

Acceptance:
  - Numbers match mock (CS604 = 71.9%)
  - Courses, exams, timetable, and attendance summaries served via REST APIs
  - All responses serialized with camelCase keys matching React TypeScript interfaces
"""

from __future__ import annotations

import pytest

from app.seed.seed_demo import seed


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_student_token(client) -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    return resp.json().get("accessToken") or resp.json().get("access_token")


def test_get_my_courses_cs604_attendance(client):
    """GET /api/v1/academics/courses/me returns all enrolled courses with CS604 at 71.9%."""
    token = get_student_token(client)
    resp = client.get("/api/v1/academics/courses/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    courses = resp.json()

    assert len(courses) == 5
    course_map = {c["code"]: c for c in courses}

    assert "CS604" in course_map
    cs604 = course_map["CS604"]
    assert cs604["totalClasses"] == 32
    assert cs604["attendedClasses"] == 23
    assert cs604["attendancePercent"] == 71.9
    assert cs604["name"] == "Software Engineering & Agile Architectures"

    # CS601
    cs601 = course_map["CS601"]
    assert cs601["attendancePercent"] == 88.9
    assert cs601["totalClasses"] == 36
    assert cs601["attendedClasses"] == 32


def test_get_my_exams(client):
    """GET /api/v1/academics/exams/me returns exams with seating allocations."""
    token = get_student_token(client)
    resp = client.get("/api/v1/academics/exams/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    exams = resp.json()

    assert len(exams) >= 5
    first_exam = exams[0]
    assert "courseCode" in first_exam
    assert "hallNumber" in first_exam
    assert "seatNumber" in first_exam
    assert first_exam["status"] == "Upcoming"


def test_get_attendance_summary(client):
    """GET /api/v1/academics/attendance/summary/me calculates aggregate stats and atRiskCount."""
    token = get_student_token(client)
    resp = client.get(
        "/api/v1/academics/attendance/summary/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    summary = resp.json()

    assert "overallPercentage" in summary
    assert summary["overallPercentage"] > 80.0
    assert summary["atRiskCount"] == 1  # CS604 is at 71.9% < 75%
    assert len(summary["courses"]) == 5


def test_get_attendance_history(client):
    """GET /api/v1/academics/attendance/history/me returns biometric verification log."""
    token = get_student_token(client)
    resp = client.get(
        "/api/v1/academics/attendance/history/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    records = resp.json()

    assert len(records) >= 1
    rec = records[0]
    assert rec["status"] == "present"
    assert rec["verificationMethod"] == "geo_face_liveness"
    assert rec["locationVerified"] is True
    assert rec["faceConfidence"] >= 90.0


def test_get_student_dashboard(client):
    """GET /api/v1/students/me returns full student dashboard with profile and metrics."""
    token = get_student_token(client)
    resp = client.get("/api/v1/students/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    assert "profile" in data
    assert data["profile"]["name"] == "Faizan Ali"
    assert data["profile"]["rollNumber"] == "0827CS221045"
    assert data["profile"]["cgpa"] == 8.74

    assert "attendance" in data
    assert data["attendance"]["atRiskCount"] == 1
    assert "upcomingExams" in data
