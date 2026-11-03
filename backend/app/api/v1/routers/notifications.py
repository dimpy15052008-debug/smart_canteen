"""Notifications v1 router.

Endpoints
---------
GET  /api/v1/notifications           — list notifications for current user
PATCH /api/v1/notifications/{id}/read — mark single notification read
POST  /api/v1/notifications/read-all  — mark all notifications read
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbDep
from app.schemas.platform import NotificationOut
from app.services import notification_service

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    user: CurrentUser,
    db: DbDep,
    unread_only: bool = Query(False, alias="unreadOnly"),
):
    """Return all notifications for the authenticated user (newest first)."""
    return notification_service.list_notifications(user, db, unread_only=unread_only)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: str,
    user: CurrentUser,
    db: DbDep,
):
    """Mark a specific notification as read."""
    result = notification_service.mark_as_read(notification_id, user, db)
    db.commit()
    return result


@router.post("/read-all", response_model=dict)
def mark_all_notifications_read(
    user: CurrentUser,
    db: DbDep,
):
    """Mark all unread notifications for the current user as read."""
    count = notification_service.mark_all_read(user, db)
    db.commit()
    return {"updated": count}
