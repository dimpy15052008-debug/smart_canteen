"""Platform models: AuditLog, Notification, ActivityEvent."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class AuditLog(Base, UUIDPrimaryKey):
    """Append-only audit log. No updated_at — rows are never modified."""

    __tablename__ = "audit_logs"

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    actor_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    actor_role: Mapped[str] = mapped_column(String(20), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_entity: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(200), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    ip_address: Mapped[str] = mapped_column(String(80), nullable=False, default="unknown")


class Notification(Base, UUIDPrimaryKey, TimestampMixin):
    """Per-user notification item."""

    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    # type must be one of: attendance, exam, canteen, certificate, helpdesk, system
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    action_link: Mapped[str | None] = mapped_column(String(100), nullable=True)


class ActivityEvent(Base, UUIDPrimaryKey, TimestampMixin):
    """Lightweight event for analytics (page views, actions)."""

    __tablename__ = "activity_events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[str | None] = mapped_column(Text, nullable=True)
