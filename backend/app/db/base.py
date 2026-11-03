"""SQLAlchemy declarative base for all models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """All ORM models inherit from this base."""


class TimestampMixin:
    """Provides created_at / updated_at columns for every domain table."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class UUIDPrimaryKey:
    """UUID primary key mixin (PostgreSQL UUID type)."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
