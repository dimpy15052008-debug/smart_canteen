"""Pytest shared fixtures for the SmartUni.Ai backend test suite.

If PostgreSQL is running (in CI or Docker on port 5432), tests use real PostgreSQL.
If PostgreSQL is unavailable locally, tests seamlessly fall back to an in-memory
SQLite database so unit tests and dev mode tests pass instantly without hanging.
"""

from __future__ import annotations

import os
import socket

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Force test environment settings before importing app
os.environ.setdefault("ENV", "test")
os.environ.setdefault("AUTH_MODE", "dev")
os.environ.setdefault("LLM_PROVIDER", "mock")
os.environ.setdefault("PAYMENT_MODE", "mock")
os.environ.setdefault("STORAGE_BACKEND", "local")
os.environ.setdefault("ENABLE_SCHEDULER", "false")
os.environ.setdefault("FACE_VERIFIER", "simulated")
os.environ.setdefault("JWT_SECRET", "test_secret_32_bytes_xxxxxxxxxx_ok")


def _is_postgres_available() -> bool:
    """Quick check if Postgres port 5432 is accepting connections."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        s.connect(("127.0.0.1", 5432))
        s.close()
        return True
    except Exception:
        return False


import app.models  # noqa: E402, F401
from app.db.base import Base  # noqa: E402

if _is_postgres_available():
    from app.db.session import engine as test_engine
else:
    from sqlalchemy.pool import StaticPool

    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables in the test database once per session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    # Cleanup if needed


@pytest.fixture()
def db():
    """Yield a per-test database session, rolling back after each test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db):
    """TestClient with get_db overridden to use the test session."""
    from app.core.deps import get_db
    from app.main import app

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()
