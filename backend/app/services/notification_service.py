"""Notification service: per-user notification management."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.core.errors import ForbiddenError, NotFoundError
from app.core.logging import get_logger
from app.models.identity import Profile
from app.models.platform import Notification
from app.schemas.platform import NotificationOut

log = get_logger(__name__)


def _to_out(n: Notification) -> NotificationOut:
    """Convert ORM Notification to schema output."""
    return NotificationOut(
        id=str(n.id),
        title=n.title,
        message=n.message,
        type=n.type,  # type: ignore[arg-type]
        timestamp=n.created_at.strftime("%H:%M %p") if n.created_at else "",
        read=n.read,
        action_link=n.action_link,
    )


def list_notifications(
    user: Profile,
    db: Session,
    *,
    unread_only: bool = False,
) -> list[NotificationOut]:
    """Return notifications for the authenticated user, newest first."""
    q = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        q = q.filter(Notification.read == False)  # noqa: E712
    rows = q.order_by(Notification.created_at.desc()).all()
    return [_to_out(n) for n in rows]


def mark_as_read(
    notification_id: str,
    user: Profile,
    db: Session,
) -> NotificationOut:
    """Mark a single notification read. Raises 404 if not found, 403 if not owner."""
    try:
        nid = uuid.UUID(notification_id)
    except ValueError:
        raise NotFoundError("Notification not found.") from None

    n = db.query(Notification).filter(Notification.id == nid).first()
    if not n:
        raise NotFoundError("Notification not found.")
    if n.user_id != user.id:
        raise ForbiddenError("Access denied.")

    n.read = True
    db.flush()
    log.info("notification_marked_read", notification_id=str(nid), user_id=str(user.id))
    return _to_out(n)


def mark_all_read(user: Profile, db: Session) -> int:
    """Mark all unread notifications for the user as read. Returns count updated."""
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .all()
    )
    for n in rows:
        n.read = True
    db.flush()
    log.info("all_notifications_marked_read", user_id=str(user.id), count=len(rows))
    return len(rows)


def create_notification(
    db: Session,
    *,
    user_id: uuid.UUID,
    title: str,
    message: str,
    type: str = "system",
    action_link: str | None = None,
) -> NotificationOut:
    """Create and persist a new notification for a user."""
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        read=False,
        action_link=action_link,
    )
    db.add(n)
    db.flush()
    log.info("notification_created", notification_id=str(n.id), user_id=str(user_id))
    return _to_out(n)
