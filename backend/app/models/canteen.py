"""Canteen domain models: CanteenMenuItem, CanteenOrder, WalletAccount, WalletTransaction."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class CanteenMenuItem(Base, UUIDPrimaryKey, TimestampMixin):
    """Canteen food court menu item."""

    __tablename__ = "canteen_menu_items"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # category: Breakfast, Lunch, Snacks, Beverages, Healthy
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    prep_time_mins: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    calories: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    dietary: Mapped[str] = mapped_column(String(30), default="veg", nullable=False)
    # veg, non-veg, vegan
    rating: Mapped[float] = mapped_column(Float, default=4.5, nullable=False)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)


class CanteenOrder(Base, UUIDPrimaryKey, TimestampMixin):
    """Student meal order with state machine tracking."""

    __tablename__ = "canteen_orders"
    __table_args__ = (UniqueConstraint("order_date", "token_number", name="uq_canteen_date_token"),)

    token_number: Mapped[int] = mapped_column(Integer, nullable=False)
    order_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    items_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON serialized items array
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    pickup_time: Mapped[str] = mapped_column(String(30), nullable=False)

    status: Mapped[str] = mapped_column(String(30), default="placed", nullable=False, index=True)
    # status: placed, preparing, ready, collected, cancelled

    payment_status: Mapped[str] = mapped_column(String(20), default="paid", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), default="wallet", nullable=False)

    qr_value: Mapped[str] = mapped_column(String(200), nullable=False)
    qr_sig: Mapped[str | None] = mapped_column(String(200), nullable=True)
    counter: Mapped[str] = mapped_column(String(50), default="Counter #2", nullable=False)


class WalletAccount(Base, UUIDPrimaryKey, TimestampMixin):
    """Prepaid campus wallet linked to student profile."""

    __tablename__ = "wallet_accounts"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), unique=True, nullable=False, index=True
    )
    balance: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)

    transactions: Mapped[list[WalletTransaction]] = relationship(back_populates="wallet")


class WalletTransaction(Base, UUIDPrimaryKey):
    """Append-only wallet ledger entry."""

    __tablename__ = "wallet_transactions"

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("wallet_accounts.id"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)
    # credit, debit
    reference: Mapped[str] = mapped_column(String(100), nullable=False)
    balance_after: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    wallet: Mapped[WalletAccount] = relationship(back_populates="transactions")
