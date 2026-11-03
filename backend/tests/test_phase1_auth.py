"""Phase 1 authentication and authorization tests.

Covers:
  - Dev login for each role (student, faculty, admin, canteen)
  - GET /api/v1/auth/me for authenticated user
  - 401 Unauthorized for missing or invalid tokens
  - 403 Forbidden when dev-login is called in production
  - Startup safety check refusing AUTH_MODE=dev in ENV=production
  - RBAC dependency checks (require_roles, student_owns)
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.deps import require_roles, student_owns
from app.core.errors import ForbiddenError


@pytest.mark.parametrize(
    "role,expected_name",
    [
        ("student", "Faizan Ali"),
        ("faculty", "Prof. Rajesh Sharma"),
        ("admin", "Dr. Sunita Verma"),
        ("canteen", "Ramesh Kumar"),
    ],
)
def test_dev_login_all_roles(client, role, expected_name):
    """POST /api/v1/auth/dev-login succeeds for all standard roles."""
    resp = client.post("/api/v1/auth/dev-login", json={"role": role})
    assert resp.status_code == 200
    data = resp.json()

    assert "accessToken" in data or "access_token" in data
    user = data["user"]
    assert user["role"] == role
    assert user["name"] == expected_name


def test_dev_login_student_details(client):
    """Dev login for student contains full academic mock profile matching campusData.ts."""
    resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    assert resp.status_code == 200
    user = resp.json()["user"]

    assert user["rollNumber"] == "0827CS221045"
    assert user["cgpa"] == 8.74
    assert user["semester"] == 6
    assert user["department"] == "Computer Science & Engineering"


def test_get_me_authenticated(client):
    """GET /api/v1/auth/me returns current user profile when bearer token is provided."""
    login_resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")

    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["name"] == "Faizan Ali"
    assert me_data["role"] == "student"


def test_get_me_unauthenticated(client):
    """GET /api/v1/auth/me returns 401 when no token is supplied."""
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_get_me_invalid_token(client):
    """GET /api/v1/auth/me returns 401 when an invalid token is supplied."""
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert resp.status_code == 401


def test_dev_login_disabled_in_production(client, monkeypatch):
    """POST /api/v1/auth/dev-login returns 403 Forbidden in production environment."""
    monkeypatch.setattr(settings, "ENV", "production")
    resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    assert resp.status_code == 403


def test_rbac_require_roles_enforcement(client):
    """RBAC dependency enforces allowed roles, blocking unauthorized roles with 403."""
    app = FastAPI()

    @app.get("/admin-only")
    def admin_only_endpoint(user: object = require_roles("admin")):
        return {"status": "ok"}

    # Login as student
    login_resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    student_token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")

    # Override get_current_user in the test sub-app
    from app.core.errors import AppError, app_error_handler

    app.add_exception_handler(AppError, app_error_handler)

    test_c = TestClient(app, raise_server_exceptions=False)
    # Without token: 401
    resp = test_c.get("/admin-only")
    assert resp.status_code in (401, 403)
    # With student token: 403
    resp2 = test_c.get("/admin-only", headers={"Authorization": f"Bearer {student_token}"})
    assert resp2.status_code == 403


def test_student_owns_check():
    """student_owns allows own ID and blocks other IDs for students, but allows admins."""
    from app.services.auth_service import DEMO_PROFILES, MockProfileObj

    student_profile = MockProfileObj(DEMO_PROFILES["student"])
    admin_profile = MockProfileObj(DEMO_PROFILES["admin"])

    own_id = str(student_profile.id)
    other_id = "00000000-0000-0000-0000-000000000099"

    # Student accessing own data passes
    student_owns(own_id, student_profile)

    # Admin accessing any student passes
    student_owns(other_id, admin_profile)

    # Student accessing other student raises ForbiddenError
    with pytest.raises(ForbiddenError):
        student_owns(other_id, student_profile)


def test_startup_refusal_when_production_and_dev_auth(monkeypatch):
    """Lifespan raises RuntimeError if ENV=production and AUTH_MODE=dev."""
    monkeypatch.setattr(settings, "ENV", "production")
    monkeypatch.setattr(settings, "AUTH_MODE", "dev")

    import asyncio

    from app.main import lifespan

    dummy_app = FastAPI()
    with pytest.raises(RuntimeError, match="CRITICAL SECURITY ERROR"):

        async def run_lifespan():
            async with lifespan(dummy_app):
                pass

        asyncio.run(run_lifespan())
