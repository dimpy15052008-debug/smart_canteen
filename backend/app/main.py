"""SmartUni.Ai FastAPI Application Factory.

Startup order:
1. configure_logging()       — structured logs active before anything else
2. Production safety checks   — fail fast if misconfigured (settings validator)
3. create_all() in dev        — auto-creates tables without migrations (dev only)
4. Scheduler (optional)       — only when ENABLE_SCHEDULER=true
5. Register routers
6. Register error handlers
7. Register middleware (CORS, rate limiting, request-ID)
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.errors import (
    AppError,
    app_error_handler,
    http_exception_handler,
    unhandled_exception_handler,
)
from app.core.logging import configure_logging, get_logger
from app.core.rate_limit import limiter

# Configure logging first — before any other import that might log
configure_logging()
log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan — startup and shutdown logic."""
    log.info("smartuni_startup", env=settings.ENV, auth_mode=settings.AUTH_MODE)

    # Security check: Never allow dev auth mode in production
    if settings.ENV == "production" and settings.AUTH_MODE == "dev":
        raise RuntimeError(
            "CRITICAL SECURITY ERROR: AUTH_MODE cannot be 'dev' when ENV='production'. Refusing to start."
        )

    if settings.DATABASE_URL.startswith("sqlite"):
        import app.models  # noqa: F401
        from app.db.base import Base
        from app.db.session import engine

        Base.metadata.create_all(bind=engine)
        log.info("db_ready", note="SQLite tables auto-created.")
    else:
        log.info(
            "db_ready",
            note="Run 'make migrate' to apply schema migrations before using data endpoints.",
        )

    # Start scheduler if enabled
    if settings.ENABLE_SCHEDULER:
        try:
            from app.jobs.scheduler import start_scheduler  # noqa: PLC0415

            start_scheduler()
            log.info("scheduler_started")
        except Exception as exc:
            log.error("scheduler_start_failed", error=str(exc))

    log.info("smartuni_ready", port=settings.PORT)
    yield

    # Shutdown
    if settings.ENABLE_SCHEDULER:
        try:
            from app.jobs.scheduler import stop_scheduler  # noqa: PLC0415

            stop_scheduler()
        except Exception:
            pass

    log.info("smartuni_shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="SmartUni.Ai API",
        description=(
            "Production backend for the SmartUni.Ai Smart University Digital Campus platform. "
            "Provides REST APIs for attendance, fees, canteen, certificates, helpdesk, "
            "CampusAI tool-calling, ML early warning, and administrative analytics."
        ),
        version="1.0.0",
        lifespan=lifespan,
        # Disable automatic /docs redirect when in production (optional)
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── Rate limiting ──────────────────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── CORS ──────────────────────────────────────────────────────────────────
    origins = settings.cors_origins_list
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count", "X-Request-Id"],
    )

    # ── Request-ID middleware ──────────────────────────────────────────────────
    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
        import structlog  # noqa: PLC0415

        with structlog.contextvars.bound_contextvars(request_id=request_id):
            response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response

    # ── Security headers middleware ────────────────────────────────────────────
    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("X-XSS-Protection", "1; mode=block")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "geolocation=(), camera=(), microphone=()",
        )
        # Only set HSTS in production (not for local dev/test with HTTP)
        if settings.ENV == "production":
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload",
            )
        return response

    # ── Error handlers ────────────────────────────────────────────────────────
    app.add_exception_handler(AppError, app_error_handler)
    from fastapi import HTTPException  # noqa: PLC0415

    app.add_exception_handler(HTTPException, http_exception_handler)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "validation_error",
                    "message": "Request validation failed.",
                    "details": exc.errors(),
                }
            },
        )

    app.add_exception_handler(Exception, unhandled_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────────
    from app.api.v1.routers.academics import router as academics_router  # noqa: PLC0415
    from app.api.v1.routers.admin import router as admin_router  # noqa: PLC0415
    from app.api.v1.routers.ai_legacy import router as ai_legacy_router  # noqa: PLC0415
    from app.api.v1.routers.attendance import router as attendance_router  # noqa: PLC0415
    from app.api.v1.routers.auth import router as auth_router  # noqa: PLC0415
    from app.api.v1.routers.campus_ai import router as campus_ai_router  # noqa: PLC0415
    from app.api.v1.routers.canteen import router as canteen_router  # noqa: PLC0415
    from app.api.v1.routers.certificates import router as certificates_router  # noqa: PLC0415
    from app.api.v1.routers.fees import router as fees_router  # noqa: PLC0415
    from app.api.v1.routers.health import router as health_router  # noqa: PLC0415
    from app.api.v1.routers.helpdesk import router as helpdesk_router  # noqa: PLC0415
    from app.api.v1.routers.ml import router as ml_router  # noqa: PLC0415
    from app.api.v1.routers.notifications import router as notifications_router  # noqa: PLC0415
    from app.api.v1.routers.students import router as students_router  # noqa: PLC0415
    from app.api.v1.routers.transport import router as transport_router  # noqa: PLC0415

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(ai_legacy_router)
    app.include_router(academics_router)
    app.include_router(students_router)
    app.include_router(fees_router)
    app.include_router(helpdesk_router)
    app.include_router(certificates_router)
    app.include_router(campus_ai_router)
    app.include_router(attendance_router)
    app.include_router(canteen_router)
    app.include_router(notifications_router)
    app.include_router(transport_router)
    app.include_router(admin_router)
    app.include_router(ml_router)

    # Phase 1+ routers will be added here as they are built:
    # app.include_router(students_router, prefix="/api/v1")
    # app.include_router(academics_router, prefix="/api/v1")
    # ... etc.

    return app


app = create_app()
