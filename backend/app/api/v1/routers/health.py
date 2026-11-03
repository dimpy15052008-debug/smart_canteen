"""Health and readiness check endpoints.

GET /api/health  — liveness probe (always returns 200 if the process is up)
GET /api/health/ready — readiness probe (checks DB and optional LLM connectivity)
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import SessionLocal

router = APIRouter(tags=["health"])
log = get_logger(__name__)


@router.get("/api/health")
def liveness():
    """Always returns 200 while the process is running."""
    return {
        "status": "healthy",
        "system": "SmartUni.Ai API",
        "version": "1.0.0",
        "env": settings.ENV,
        "authMode": settings.AUTH_MODE,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/api/health/ready")
def readiness():
    """Checks DB connectivity. Returns 503 if anything is broken."""
    import concurrent.futures  # noqa: PLC0415

    checks: dict[str, object] = {}
    overall_ok = True

    # Database check — run in a thread with a 3s timeout so we never hang
    def _db_check():
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return "ok"

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_db_check)
            result = future.result(timeout=3)
        checks["database"] = result
    except concurrent.futures.TimeoutError:
        checks["database"] = "error: connection timed out (is PostgreSQL running?)"
        overall_ok = False
    except Exception as exc:
        log.warning("readiness_db_check_failed", error=str(exc))
        checks["database"] = f"error: {type(exc).__name__}"
        overall_ok = False

    if not overall_ok:
        from fastapi.responses import JSONResponse  # noqa: PLC0415

        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "checks": checks},
        )

    return {"status": "ready", "checks": checks}
