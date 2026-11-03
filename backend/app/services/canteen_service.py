"""Canteen service: food court menu, pre-orders, campus wallet, QR verification, staff queue."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.audit import log_action
from app.core.errors import BadRequestError, ForbiddenError, NotFoundError
from app.core.logging import get_logger
from app.models.canteen import CanteenMenuItem, CanteenOrder, WalletAccount, WalletTransaction
from app.models.identity import Profile
from app.schemas.canteen import (
    CanteenMenuItemOut,
    CanteenOrderItemOut,
    CanteenOrderOut,
    CreateMenuItemIn,
    CreateOrderIn,
    TopupWalletIn,
    UpdateMenuItemIn,
    UpdateOrderStatusIn,
    VerifyQrIn,
    WalletAccountOut,
    WalletTransactionOut,
)

log = get_logger(__name__)


# ── Serializers ───────────────────────────────────────────────────────────────


def _to_menu_out(item: CanteenMenuItem) -> CanteenMenuItemOut:
    return CanteenMenuItemOut(
        id=str(item.id),
        name=item.name,
        category=item.category,
        price=float(item.price),
        prep_time_minutes=item.prep_time_mins,
        is_veg=item.dietary.lower() in ("veg", "vegan"),
        calories=item.calories,
        image=item.image_url
        or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80",
        available=item.available,
        description=f"Freshly prepared {item.dietary} specialty at Central Food Court.",
        rating=float(item.rating),
    )


def _to_order_out(order: CanteenOrder, db: Session) -> CanteenOrderOut:
    student_profile = db.query(Profile).filter_by(id=order.student_id).first()
    student_name = student_profile.name if student_profile else "Student"

    # Parse items_json
    raw_items = []
    try:
        raw_items = json.loads(order.items_json)
    except Exception:
        pass

    items_out = []
    for it in raw_items:
        items_out.append(
            CanteenOrderItemOut(
                item_id=str(it.get("itemId") or it.get("item_id") or ""),
                name=it.get("name", "Menu Item"),
                price=float(it.get("price", 0.0)),
                quantity=int(it.get("quantity", 1)),
            )
        )

    # Normalize token number string: if 104 -> "A-104", if already string like "A-104" keep it
    token_str = (
        f"A-{order.token_number}"
        if isinstance(order.token_number, int)
        else str(order.token_number)
    )

    # Extract counter number from counter string ("Counter #1" -> 1)
    counter_num = 1
    if order.counter:
        try:
            counter_num = int("".join(filter(str.isdigit, order.counter)) or 1)
        except ValueError:
            counter_num = 1

    created_dt = order.created_at or datetime.now(UTC)
    order_time_str = created_dt.strftime("%I:%M %p")

    # Map backend status to frontend status if needed
    status_mapped = order.status
    if status_mapped == "placed":
        status_mapped = "new"
    elif status_mapped == "collected":
        status_mapped = "completed"

    return CanteenOrderOut(
        id=str(order.id),
        token_number=token_str,
        student_id=str(order.student_id),
        student_name=student_name,
        items=items_out,
        total_amount=float(order.total_amount),
        pickup_time=order.pickup_time,
        order_time=order_time_str,
        status=status_mapped,  # type: ignore[arg-type]
        payment_status=order.payment_status,  # type: ignore[arg-type]
        payment_method=order.payment_method,
        qr_code_value=order.qr_value,
        counter_number=counter_num,
    )


# ── Menu Management ───────────────────────────────────────────────────────────


def list_menu(
    category: str | None = None,
    only_available: bool = False,
    db: Session = None,  # type: ignore[assignment]
) -> list[CanteenMenuItemOut]:
    """Retrieve food court menu items with optional category filtering."""
    query = db.query(CanteenMenuItem)
    if category and category.lower() != "all":
        query = query.filter(func.lower(CanteenMenuItem.category) == category.lower())
    if only_available:
        query = query.filter(CanteenMenuItem.available == True)  # noqa: E712

    items = query.order_by(CanteenMenuItem.category, CanteenMenuItem.name).all()
    return [_to_menu_out(it) for it in items]


def create_menu_item(
    actor: Profile,
    payload: CreateMenuItemIn,
    db: Session,
) -> CanteenMenuItemOut:
    """Canteen staff or admin creates a new food item."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can modify the menu.")

    dietary = "veg" if payload.is_veg else "non-veg"
    item = CanteenMenuItem(
        id=uuid.uuid4(),
        name=payload.name.strip(),
        category=payload.category.strip(),
        price=Decimal(str(payload.price)),
        available=payload.available,
        prep_time_mins=payload.prep_time_minutes,
        calories=payload.calories,
        dietary=dietary,
        rating=4.5,
        image_url=payload.image,
    )
    db.add(item)
    db.flush()

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="canteen.menu_item_created",
        target_entity="canteen_menu_items",
        entity_id=str(item.id),
        details=json.dumps({"name": item.name, "price": str(item.price)}),
    )
    db.commit()
    db.refresh(item)
    return _to_menu_out(item)


def update_menu_item(
    actor: Profile,
    item_id: uuid.UUID,
    payload: UpdateMenuItemIn,
    db: Session,
) -> CanteenMenuItemOut:
    """Canteen staff updates item price, availability, or info."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can modify the menu.")

    item = db.query(CanteenMenuItem).filter_by(id=item_id).first()
    if not item:
        raise NotFoundError("Menu item not found.")

    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.category is not None:
        item.category = payload.category.strip()
    if payload.price is not None:
        item.price = Decimal(str(payload.price))
    if payload.available is not None:
        item.available = payload.available
    if payload.prep_time_minutes is not None:
        item.prep_time_mins = payload.prep_time_minutes
    if payload.calories is not None:
        item.calories = payload.calories
    if payload.is_veg is not None:
        item.dietary = "veg" if payload.is_veg else "non-veg"
    if payload.image is not None:
        item.image_url = payload.image

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="canteen.menu_item_updated",
        target_entity="canteen_menu_items",
        entity_id=str(item.id),
        details=json.dumps({"name": item.name, "available": item.available}),
    )
    db.commit()
    db.refresh(item)
    return _to_menu_out(item)


def delete_menu_item(actor: Profile, item_id: uuid.UUID, db: Session) -> None:
    """Remove a menu item from the food court registry."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can delete menu items.")

    item = db.query(CanteenMenuItem).filter_by(id=item_id).first()
    if not item:
        raise NotFoundError("Menu item not found.")

    db.delete(item)
    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="canteen.menu_item_deleted",
        target_entity="canteen_menu_items",
        entity_id=str(item_id),
        details=json.dumps({"name": item.name}),
    )
    db.commit()


# ── Campus Wallet Management ─────────────────────────────────────────────────


def get_or_create_wallet(student_profile: Profile, db: Session) -> WalletAccount:
    """Retrieve or initialize the student's prepaid campus wallet."""
    wallet = db.query(WalletAccount).filter_by(student_id=student_profile.id).first()
    if not wallet:
        wallet = WalletAccount(
            id=uuid.uuid4(),
            student_id=student_profile.id,
            balance=Decimal("0.00"),
            status="active",
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def get_wallet_details(student_profile: Profile, db: Session) -> WalletAccountOut:
    """Get current wallet balance and full transaction history."""
    wallet = get_or_create_wallet(student_profile, db)
    txs = (
        db.query(WalletTransaction)
        .filter_by(wallet_id=wallet.id)
        .order_by(WalletTransaction.timestamp.desc())
        .all()
    )
    tx_outs = [
        WalletTransactionOut(
            id=str(t.id),
            amount=float(t.amount),
            transaction_type=t.transaction_type,  # type: ignore[arg-type]
            reference=t.reference,
            balance_after=float(t.balance_after),
            timestamp=t.timestamp,
        )
        for t in txs
    ]
    return WalletAccountOut(
        id=str(wallet.id),
        student_id=str(wallet.student_id),
        balance=float(wallet.balance),
        status=wallet.status,
        transactions=tx_outs,
    )


def topup_wallet(
    student_profile: Profile,
    payload: TopupWalletIn,
    db: Session,
) -> WalletAccountOut:
    """Recharge student campus wallet via UPI or Card."""
    wallet = get_or_create_wallet(student_profile, db)
    amount_dec = Decimal(str(payload.amount))
    now = datetime.now(UTC)

    new_balance = wallet.balance + amount_dec
    wallet.balance = new_balance

    tx = WalletTransaction(
        id=uuid.uuid4(),
        wallet_id=wallet.id,
        amount=amount_dec,
        transaction_type="credit",
        reference=f"Instant {payload.payment_method} Wallet Recharge",
        balance_after=new_balance,
        timestamp=now,
    )
    db.add(tx)

    log_action(
        db,
        actor_id=str(student_profile.id),
        actor_role=student_profile.role,
        action="canteen.wallet_topup",
        target_entity="wallet_accounts",
        entity_id=str(wallet.id),
        details=json.dumps({"amount": str(payload.amount), "new_balance": str(new_balance)}),
    )
    db.commit()
    return get_wallet_details(student_profile, db)


# ── Pre-order & Lifecycle Management ──────────────────────────────────────────


def create_order(
    student_profile: Profile,
    payload: CreateOrderIn,
    db: Session,
) -> CanteenOrderOut:
    """Student places a food court pre-order with digital token generation."""
    if student_profile.role != "student":
        raise ForbiddenError("Only students can place canteen food pre-orders.")

    if not payload.items:
        raise BadRequestError("Order cart cannot be empty.")

    # 1. Resolve menu items and calculate total
    total = Decimal("0.00")
    order_items_payload = []

    for it in payload.items:
        # Match item by UUID or name
        menu_item: CanteenMenuItem | None = None
        try:
            item_uuid = uuid.UUID(it.item_id)
            menu_item = db.query(CanteenMenuItem).filter_by(id=item_uuid).first()
        except ValueError:
            pass

        if not menu_item:
            menu_item = (
                db.query(CanteenMenuItem).filter_by(name=it.name).first() if it.name else None
            )

        if not menu_item:
            # Fallback by id as string in case of demo data id like 'm1'
            menu_item = db.query(CanteenMenuItem).first()

        if not menu_item:
            raise BadRequestError(f"Menu item '{it.item_id}' not found.")

        if not menu_item.available:
            raise BadRequestError(f"'{menu_item.name}' is currently marked sold out.")

        unit_price = Decimal(str(it.price)) if it.price is not None else menu_item.price
        line_total = unit_price * it.quantity
        total += line_total

        order_items_payload.append(
            {
                "itemId": str(menu_item.id),
                "name": menu_item.name,
                "price": float(unit_price),
                "quantity": it.quantity,
            }
        )

    # 2. Payment handling
    pay_method = payload.payment_method
    if pay_method.lower() in ("campuswallet", "wallet"):
        wallet = get_or_create_wallet(student_profile, db)
        if wallet.balance < total:
            raise BadRequestError(
                f"Insufficient wallet balance (₹{float(wallet.balance):.2f}). "
                f"Order total is ₹{float(total):.2f}. Please top up your wallet."
            )
        new_bal = wallet.balance - total
        wallet.balance = new_bal
        tx = WalletTransaction(
            id=uuid.uuid4(),
            wallet_id=wallet.id,
            amount=total,
            transaction_type="debit",
            reference="Canteen Food Pre-Order",
            balance_after=new_bal,
            timestamp=datetime.now(UTC),
        )
        db.add(tx)

    # 3. Generate sequential token number for today
    today = date.today()
    max_token = (
        db.query(func.max(CanteenOrder.token_number))
        .filter(CanteenOrder.order_date == today)
        .scalar()
    )
    token_num = (max_token or 100) + 1

    qr_code_val = f"SMARTUNI-ORDER-A{token_num}-{student_profile.id}"

    order = CanteenOrder(
        id=uuid.uuid4(),
        token_number=token_num,
        order_date=today,
        student_id=student_profile.id,
        items_json=json.dumps(order_items_payload),
        total_amount=total,
        pickup_time=payload.pickup_time,
        status="placed",  # maps to 'new'
        payment_status="paid",
        payment_method=pay_method,
        qr_value=qr_code_val,
        counter="Counter #2",
    )
    db.add(order)
    db.flush()

    log_action(
        db,
        actor_id=str(student_profile.id),
        actor_role=student_profile.role,
        action="canteen.order_placed",
        target_entity="canteen_orders",
        entity_id=str(order.id),
        details=json.dumps(
            {
                "token": token_num,
                "total": str(total),
                "payment_method": pay_method,
            }
        ),
    )
    db.commit()
    db.refresh(order)
    return _to_order_out(order, db)


def list_student_orders(student_profile: Profile, db: Session) -> list[CanteenOrderOut]:
    """Retrieve all canteen orders placed by the current student."""
    orders = (
        db.query(CanteenOrder)
        .filter_by(student_id=student_profile.id)
        .order_by(CanteenOrder.created_at.desc())
        .all()
    )
    return [_to_order_out(o, db) for o in orders]


def list_staff_order_queue(actor: Profile, db: Session) -> list[CanteenOrderOut]:
    """Canteen staff views live order preparation and collection queue."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can access the kitchen queue.")

    today = date.today()
    orders = (
        db.query(CanteenOrder)
        .filter(CanteenOrder.order_date == today)
        .order_by(CanteenOrder.created_at.desc())
        .all()
    )
    return [_to_order_out(o, db) for o in orders]


def update_order_status(
    actor: Profile,
    order_id: uuid.UUID,
    payload: UpdateOrderStatusIn,
    db: Session,
) -> CanteenOrderOut:
    """Canteen staff advances order status (preparing -> ready -> completed)."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can update order status.")

    order = db.query(CanteenOrder).filter_by(id=order_id).first()
    if not order:
        raise NotFoundError("Canteen order not found.")

    old_status = order.status
    target_status = payload.status
    # Map frontend 'new' -> 'placed', 'completed' -> 'collected'
    if target_status == "new":
        target_status = "placed"
    elif target_status == "completed":
        target_status = "collected"

    # If cancelling and paid via wallet: refund
    if target_status == "cancelled" and old_status != "cancelled":
        if order.payment_method.lower() in ("campuswallet", "wallet"):
            wallet = db.query(WalletAccount).filter_by(student_id=order.student_id).first()
            if wallet:
                wallet.balance += order.total_amount
                tx = WalletTransaction(
                    id=uuid.uuid4(),
                    wallet_id=wallet.id,
                    amount=order.total_amount,
                    transaction_type="credit",
                    reference=f"Order #{order.token_number} Cancellation Refund",
                    balance_after=wallet.balance,
                    timestamp=datetime.now(UTC),
                )
                db.add(tx)

    order.status = target_status
    if payload.counter_number:
        order.counter = f"Counter #{payload.counter_number}"

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="canteen.order_status_updated",
        target_entity="canteen_orders",
        entity_id=str(order.id),
        details=json.dumps({"old_status": old_status, "new_status": target_status}),
    )
    db.commit()
    db.refresh(order)
    return _to_order_out(order, db)


def verify_qr_and_collect(
    actor: Profile,
    payload: VerifyQrIn,
    db: Session,
) -> CanteenOrderOut:
    """Canteen staff scans student QR code to verify and release meal."""
    if actor.role not in ("canteen", "admin"):
        raise ForbiddenError("Only canteen staff or administrators can redeem orders.")

    qr_clean = payload.qr_value.strip()
    order = db.query(CanteenOrder).filter_by(qr_value=qr_clean).first()
    if not order:
        raise NotFoundError("No order found matching the scanned QR code.")

    if order.status in ("collected", "completed"):
        raise BadRequestError("This order has already been verified and collected.")

    if order.status == "cancelled":
        raise BadRequestError("Cannot collect a cancelled order.")

    order.status = "collected"

    log_action(
        db,
        actor_id=str(actor.id),
        actor_role=actor.role,
        action="canteen.order_collected_via_qr",
        target_entity="canteen_orders",
        entity_id=str(order.id),
        details=json.dumps({"token": order.token_number, "qr_value": qr_clean}),
    )
    db.commit()
    db.refresh(order)
    return _to_order_out(order, db)
