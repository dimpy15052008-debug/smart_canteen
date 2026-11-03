"""Canteen v1 router — menu, digital pre-orders, campus wallet, QR redemption, staff kitchen queue.

Endpoints
---------
GET    /api/v1/canteen/menu                 — list food court menu
POST   /api/v1/canteen/menu                 — staff create menu item
PATCH  /api/v1/canteen/menu/{id}            — staff update menu item
DELETE /api/v1/canteen/menu/{id}            — staff delete menu item
GET    /api/v1/canteen/wallet/me            — student wallet balance & transactions
POST   /api/v1/canteen/wallet/topup         — student wallet recharge
POST   /api/v1/canteen/orders               — student place food pre-order
GET    /api/v1/canteen/orders/me            — student list own orders
GET    /api/v1/canteen/orders/queue         — staff live kitchen order queue
PATCH  /api/v1/canteen/orders/{id}/status   — staff update order status
POST   /api/v1/canteen/orders/verify-qr     — staff scan QR code to redeem meal
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUser, DbDep
from app.schemas.canteen import (
    CanteenMenuItemOut,
    CanteenOrderOut,
    CreateMenuItemIn,
    CreateOrderIn,
    TopupWalletIn,
    UpdateMenuItemIn,
    UpdateOrderStatusIn,
    VerifyQrIn,
    WalletAccountOut,
)
from app.services import canteen_service

router = APIRouter(prefix="/api/v1/canteen", tags=["canteen"])


# ── Menu Endpoints ─────────────────────────────────────────────────────────────


@router.get("/menu", response_model=list[CanteenMenuItemOut])
def get_menu(
    user: CurrentUser,
    db: DbDep,
    category: str | None = Query(default=None),
    available_only: bool = Query(default=False),
):
    """Retrieve food court menu items with optional category filtering."""
    return canteen_service.list_menu(category=category, only_available=available_only, db=db)


@router.post(
    "/menu",
    response_model=CanteenMenuItemOut,
    status_code=status.HTTP_201_CREATED,
)
def create_menu_item(
    body: CreateMenuItemIn,
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff or admin adds an item to the food court menu."""
    return canteen_service.create_menu_item(actor=user, payload=body, db=db)


@router.patch("/menu/{item_id}", response_model=CanteenMenuItemOut)
def update_menu_item(
    item_id: uuid.UUID,
    body: UpdateMenuItemIn,
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff updates item availability, price, or description."""
    return canteen_service.update_menu_item(actor=user, item_id=item_id, payload=body, db=db)


@router.delete("/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: uuid.UUID,
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff removes an item from the menu registry."""
    canteen_service.delete_menu_item(actor=user, item_id=item_id, db=db)


# ── Campus Wallet Endpoints ───────────────────────────────────────────────────


@router.get("/wallet/me", response_model=WalletAccountOut)
def get_my_wallet(
    user: CurrentUser,
    db: DbDep,
):
    """Retrieve the student's prepaid campus wallet balance and ledger history."""
    return canteen_service.get_wallet_details(student_profile=user, db=db)


@router.post("/wallet/topup", response_model=WalletAccountOut)
def topup_wallet(
    body: TopupWalletIn,
    user: CurrentUser,
    db: DbDep,
):
    """Top up student campus wallet via UPI or Card."""
    return canteen_service.topup_wallet(student_profile=user, payload=body, db=db)


# ── Orders & QR Redemption ────────────────────────────────────────────────────


@router.post(
    "/orders",
    response_model=CanteenOrderOut,
    status_code=status.HTTP_201_CREATED,
)
def place_order(
    body: CreateOrderIn,
    user: CurrentUser,
    db: DbDep,
):
    """Student places a food pre-order, deducting from campus wallet or card."""
    return canteen_service.create_order(student_profile=user, payload=body, db=db)


@router.get("/orders/me", response_model=list[CanteenOrderOut])
def get_my_orders(
    user: CurrentUser,
    db: DbDep,
):
    """List all food orders placed by the current student."""
    return canteen_service.list_student_orders(student_profile=user, db=db)


@router.get("/orders/queue", response_model=list[CanteenOrderOut])
def get_staff_order_queue(
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff or admin views today's kitchen preparation and pickup queue."""
    return canteen_service.list_staff_order_queue(actor=user, db=db)


@router.patch("/orders/{order_id}/status", response_model=CanteenOrderOut)
def update_order_status(
    order_id: uuid.UUID,
    body: UpdateOrderStatusIn,
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff updates order lifecycle state (new -> preparing -> ready -> completed)."""
    return canteen_service.update_order_status(actor=user, order_id=order_id, payload=body, db=db)


@router.post("/orders/verify-qr", response_model=CanteenOrderOut)
def verify_qr(
    body: VerifyQrIn,
    user: CurrentUser,
    db: DbDep,
):
    """Canteen staff scans student's digital QR code to verify and release meal."""
    return canteen_service.verify_qr_and_collect(actor=user, payload=body, db=db)
