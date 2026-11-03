"""Admin Analytics v1 router.

Endpoints
---------
GET /api/v1/admin/analytics   — full analytics snapshot (admin only)
GET /api/v1/admin/audit-logs  — paginated immutable audit trail (admin only)
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbDep
from app.core.errors import ForbiddenError
from app.schemas.admin import AdminAnalyticsOut, AuditLogOut
from app.services import admin_service

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def _require_admin(user: CurrentUser):
    """Inline role check: only admin role permitted."""
    if user.role != "admin":
        raise ForbiddenError("Admin role required.")


@router.get("/analytics", response_model=AdminAnalyticsOut)
def get_analytics(
    user: CurrentUser,
    db: DbDep,
):
    """Return full admin analytics snapshot: KPIs, departmental attendance,
    grievance breakdown, and recent audit trail. Admin role required."""
    _require_admin(user)
    return admin_service.get_analytics(db)


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    user: CurrentUser,
    db: DbDep,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return paginated immutable audit trail. Admin role required."""
    _require_admin(user)
    return admin_service.list_audit_logs(db, limit=limit, offset=offset)
