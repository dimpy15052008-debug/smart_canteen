"""Canteen domain schemas: menu, pre-orders, wallet, top-up, QR verification."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel


class CanteenMenuItemOut(CamelModel):
    """Food court menu item matching frontend CanteenMenuItem contract."""

    id: str
    name: str
    category: str
    price: float
    prep_time_minutes: int
    is_veg: bool
    calories: int
    image: str
    available: bool
    description: str
    rating: float


class CreateMenuItemIn(CamelModel):
    """Canteen staff creates a new menu item."""

    name: str
    category: str
    price: float = Field(..., gt=0)
    prep_time_minutes: int = Field(default=10, ge=1)
    is_veg: bool = True
    calories: int = Field(default=250, ge=0)
    image: str | None = None
    available: bool = True
    description: str | None = None


class UpdateMenuItemIn(CamelModel):
    """Canteen staff updates item availability, price, or details."""

    name: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, gt=0)
    prep_time_minutes: int | None = None
    is_veg: bool | None = None
    calories: int | None = None
    image: str | None = None
    available: bool | None = None
    description: str | None = None


class CanteenOrderItemIn(CamelModel):
    """Single item line in a pre-order request."""

    item_id: str
    name: str | None = None
    price: float | None = None
    quantity: int = Field(default=1, ge=1)


class CanteenOrderItemOut(CamelModel):
    """Item detail in an order response."""

    item_id: str
    name: str
    price: float
    quantity: int


class CreateOrderIn(CamelModel):
    """Student pre-order request."""

    items: list[CanteenOrderItemIn]
    pickup_time: str
    payment_method: Literal["UPI", "Card", "CampusWallet", "wallet"] = "CampusWallet"


class CanteenOrderOut(CamelModel):
    """Order response matching frontend CanteenOrder interface."""

    id: str
    token_number: str
    student_id: str
    student_name: str
    items: list[CanteenOrderItemOut]
    total_amount: float
    pickup_time: str
    order_time: str
    status: Literal["new", "preparing", "ready", "completed", "cancelled"]
    payment_status: Literal["paid", "pending"]
    payment_method: str
    qr_code_value: str
    counter_number: int = 1


class UpdateOrderStatusIn(CamelModel):
    """Staff updates order lifecycle state."""

    status: Literal["new", "preparing", "ready", "completed", "cancelled"]
    counter_number: int | None = None


class VerifyQrIn(CamelModel):
    """Staff scans student QR code for order redemption."""

    qr_value: str


class WalletTransactionOut(CamelModel):
    """Ledger transaction entry."""

    id: str
    amount: float
    transaction_type: Literal["credit", "debit"]
    reference: str
    balance_after: float
    timestamp: datetime


class WalletAccountOut(CamelModel):
    """Campus wallet balance and history."""

    id: str
    student_id: str
    balance: float
    status: str
    transactions: list[WalletTransactionOut] = []


class TopupWalletIn(CamelModel):
    """Student wallet top-up request."""

    amount: float = Field(..., gt=0, le=10000)
    payment_method: Literal["UPI", "Card", "NetBanking"] = "UPI"


class RazorpayConfigOut(CamelModel):
    """Public Razorpay client configuration."""

    key_id: str
    currency: str = "INR"
    is_test_mode: bool = True
    name: str = "SmartUni Campus Canteen"


class CreateRazorpayOrderIn(CamelModel):
    """Payload to initiate a Razorpay order."""

    items: list[CanteenOrderItemIn]
    pickup_time: str = "12:30 PM"
    store_credit: float = 0.0
    student_id: str = "STU-8842"
    student_name: str = "Faizan Ali"


class CreateRazorpayOrderOut(CamelModel):
    """Razorpay order creation response."""

    success: bool = True
    order: dict
    key_id: str
    amount: float
    currency: str = "INR"
    order_items: list[dict]
    transaction_id: str


class VerifyRazorpayPaymentIn(CamelModel):
    """Payload for HMAC SHA256 payment signature verification."""

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_details: dict = {}


class PaymentTransactionOut(CamelModel):
    """Audit ledger record for payments."""

    id: str
    razorpay_payment_id: str | None = None
    razorpay_order_id: str | None = None
    order_id: str
    token_number: str | None = None
    student_id: str
    student_name: str
    student_roll: str | None = None
    amount: float
    currency: str = "INR"
    payment_method: str
    status: Literal["SUCCESS", "FAILED", "PENDING"]
    failure_reason: str | None = None
    date_time: str
    timestamp: float
