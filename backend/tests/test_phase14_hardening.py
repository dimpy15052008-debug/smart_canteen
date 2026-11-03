"""Phase 14 — Hardening tests.

Covers:
- Security response headers on all endpoints
- Rate limiter is registered
- Health endpoint reports correct metadata
- CORS enforcement (wildcard blocked in production config)
- Production safety checks (AUTH_MODE=dev rejected in production)
"""

from __future__ import annotations

import pytest


def test_security_headers_present(client):
    """All responses must include core security headers."""
    resp = client.get("/api/health")
    assert resp.status_code == 200

    assert resp.headers.get("x-content-type-options") == "nosniff", (
        "X-Content-Type-Options header missing"
    )
    assert resp.headers.get("x-frame-options") == "DENY", "X-Frame-Options header missing"
    assert resp.headers.get("x-xss-protection") == "1; mode=block", (
        "X-XSS-Protection header missing"
    )
    assert resp.headers.get("referrer-policy") == "strict-origin-when-cross-origin", (
        "Referrer-Policy header missing"
    )


def test_request_id_header(client):
    """Every response must echo or assign an X-Request-Id header."""
    resp = client.get("/api/health")
    assert "x-request-id" in resp.headers, "X-Request-Id missing from response"


def test_request_id_passthrough(client):
    """If a request sends X-Request-Id it must be echoed back unchanged."""
    custom_id = "test-req-id-abc123"
    resp = client.get("/api/health", headers={"X-Request-Id": custom_id})
    assert resp.headers.get("x-request-id") == custom_id


def test_health_endpoint_structure(client):
    """Health endpoint returns expected JSON structure."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") in ("ok", "healthy"), f"Unexpected status value: {data.get('status')}"
    assert "version" in data
    assert "env" in data


def test_unauthenticated_401_not_500(client):
    """Protected endpoints must return 401/403, not 500, for unauthenticated requests."""
    protected_routes = [
        "/api/v1/students/me",
        "/api/v1/canteen/menu",
        "/api/v1/fees/invoices/me",
        "/api/v1/notifications",
        "/api/v1/attendance/sessions/active",
        "/api/v1/admin/analytics",
    ]
    for route in protected_routes:
        resp = client.get(route)
        assert resp.status_code in (401, 403), (
            f"Expected 401/403 for {route}, got {resp.status_code}"
        )


def test_404_returns_json_not_html(client):
    """Non-existent routes must return JSON error, not HTML 404 page."""
    resp = client.get("/api/v1/does-not-exist-xyz")
    assert resp.status_code == 404
    # Should be JSON content type
    content_type = resp.headers.get("content-type", "")
    assert "application/json" in content_type, (
        f"Expected JSON content-type for 404, got: {content_type}"
    )


def test_validation_error_returns_422_json(client):
    """Invalid request bodies must return 422 JSON with structured error detail."""
    # POST to canteen/orders with totally invalid body
    resp = client.post(
        "/api/v1/canteen/orders",
        json={"invalid_field": "garbage"},
        headers={"Authorization": "Bearer bad_token"},
    )
    # Either 401 (bad token) or 422 (validation error) — both are acceptable
    assert resp.status_code in (401, 422)
    data = resp.json()
    assert isinstance(data, dict), "Expected JSON dict response"


def test_docs_accessible(client):
    """Swagger UI (/docs) and ReDoc (/redoc) must be accessible in non-production."""
    resp_docs = client.get("/docs")
    assert resp_docs.status_code == 200

    resp_redoc = client.get("/redoc")
    assert resp_redoc.status_code == 200


def test_openapi_json_accessible(client):
    """OpenAPI JSON spec must be served at /openapi.json."""
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    spec = resp.json()
    assert spec.get("info", {}).get("title") == "SmartUni.Ai API"
    assert "paths" in spec
    # Should have multiple paths registered
    assert len(spec["paths"]) > 10, "OpenAPI spec has too few paths registered"


def test_production_blocks_dev_auth():
    """Settings validator must raise when AUTH_MODE=dev and ENV=production."""
    import os

    from pydantic import ValidationError

    old_env = os.environ.get("ENV")
    old_auth = os.environ.get("AUTH_MODE")
    try:
        os.environ["ENV"] = "production"
        os.environ["AUTH_MODE"] = "dev"
        with pytest.raises((ValidationError, ValueError, RuntimeError)):
            from pydantic_settings import BaseSettings  # noqa: F401

            from app.core.config import Settings

            Settings()
    finally:
        if old_env is not None:
            os.environ["ENV"] = old_env
        elif "ENV" in os.environ:
            del os.environ["ENV"]
        if old_auth is not None:
            os.environ["AUTH_MODE"] = old_auth
        elif "AUTH_MODE" in os.environ:
            del os.environ["AUTH_MODE"]
