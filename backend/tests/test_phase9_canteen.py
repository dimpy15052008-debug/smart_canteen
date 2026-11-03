"""Phase 9 tests: Canteen menu, digital pre-orders, campus wallet, top-up, QR redemption, kitchen queue.

Tests
-----
1. User retrieves canteen menu (at least 8 seeded items)
2. Category filter on menu works
3. Canteen staff creates a new menu item (201 Created)
4. Student forbidden from creating menu item (403 Forbidden)
5. Staff updates availability and deletes menu item
6. Student retrieves wallet balance and transaction ledger (₹850 seeded)
7. Student tops up campus wallet (+₹500 -> ₹1350)
8. Student places food pre-order via CampusWallet (order created, wallet debited)
9. Pre-order with insufficient wallet balance returns 400 Bad Request
10. Student retrieves own order history
11. Staff retrieves live kitchen queue
12. Staff updates order lifecycle status (new -> preparing -> ready)
13. Staff scans student QR code to verify and release meal (status -> completed)
14. Scanning already-collected order QR code returns 400 Bad Request
"""

from __future__ import annotations

import pytest

from app.seed.seed_demo import seed

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_token(client, role: str) -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": role})
    data = resp.json()
    return data.get("accessToken") or data.get("access_token", "")


# ── Test 1: Retrieve Menu ─────────────────────────────────────────────────────


def test_get_canteen_menu(client):
    """Students and staff can view the full food court menu."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    items = resp.json()
    assert isinstance(items, list)
    assert len(items) >= 8
    names = [i["name"] for i in items]
    assert "Paneer Butter Masala Thali" in names


# ── Test 2: Filter Menu by Category ───────────────────────────────────────────


def test_filter_canteen_menu_category(client):
    """Category query parameter filters menu items."""
    token = get_token(client, "student")
    resp = client.get(
        "/api/v1/canteen/menu?category=Beverages",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 2
    for it in items:
        assert it["category"].lower() == "beverages"


# ── Test 3: Staff Creates Menu Item ───────────────────────────────────────────


def test_staff_create_menu_item(client):
    """Canteen staff can add a new food item to the menu."""
    token = get_token(client, "canteen")
    resp = client.post(
        "/api/v1/canteen/menu",
        json={
            "name": "Falafel Pita Pocket",
            "category": "Healthy Bowls",
            "price": 85.0,
            "prepTimeMinutes": 10,
            "isVeg": True,
            "calories": 310,
            "available": True,
            "description": "Mediterranean chickpea fritters with hummus and pickled veggies.",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["name"] == "Falafel Pita Pocket"
    assert data["price"] == 85.0
    assert data["isVeg"] is True


# ── Test 4: Student Forbidden from Modifying Menu ─────────────────────────────


def test_student_cannot_modify_menu(client):
    """Students cannot create or alter food menu items."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/canteen/menu",
        json={
            "name": "Unauthorized Item",
            "category": "Snacks & Bites",
            "price": 50.0,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


# ── Test 5: Staff Updates and Deletes Menu Item ────────────────────────────────


def test_staff_update_and_delete_menu_item(client):
    """Canteen staff can toggle availability and delete items."""
    token = get_token(client, "canteen")
    # 1. Create temporary item
    create_resp = client.post(
        "/api/v1/canteen/menu",
        json={"name": "Temp Special Dish", "category": "Snacks & Bites", "price": 99.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_resp.status_code == 201
    item_id = create_resp.json()["id"]

    # 2. Update item (mark sold out, change price)
    patch_resp = client.patch(
        f"/api/v1/canteen/menu/{item_id}",
        json={"available": False, "price": 105.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["available"] is False
    assert patch_resp.json()["price"] == 105.0

    # 3. Delete item
    del_resp = client.delete(
        f"/api/v1/canteen/menu/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 204


# ── Test 6: Student Wallet Details ────────────────────────────────────────────


def test_get_student_wallet(client):
    """Student can check their prepaid wallet balance and recent transactions."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/canteen/wallet/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["balance"] == 850.0  # Seeded initial balance
    assert data["status"] == "active"
    assert isinstance(data["transactions"], list)
    assert len(data["transactions"]) >= 1


# ── Test 7: Student Wallet Top-up ─────────────────────────────────────────────


def test_student_wallet_topup(client):
    """Student can recharge their campus wallet."""
    token = get_token(client, "student")
    resp = client.post(
        "/api/v1/canteen/wallet/topup",
        json={"amount": 500.0, "paymentMethod": "UPI"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["balance"] == 1350.0  # 850 + 500
    assert len(data["transactions"]) >= 2
    recent_tx = data["transactions"][0]
    assert recent_tx["amount"] == 500.0
    assert recent_tx["transactionType"] == "credit"


# ── Test 8: Place Pre-order via CampusWallet ──────────────────────────────────


def test_place_canteen_order_wallet(client):
    """Student places a food pre-order; wallet is debited and digital token generated."""
    token = get_token(client, "student")

    # Check initial wallet balance before order
    wallet_before = client.get(
        "/api/v1/canteen/wallet/me", headers={"Authorization": f"Bearer {token}"}
    )
    initial_balance = wallet_before.json()["balance"]

    # Get menu to pick an item
    menu_resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {token}"})
    items = menu_resp.json()
    first_item = items[0]

    order_resp = client.post(
        "/api/v1/canteen/orders",
        json={
            "items": [
                {
                    "itemId": first_item["id"],
                    "name": first_item["name"],
                    "price": first_item["price"],
                    "quantity": 2,
                }
            ],
            "pickupTime": "11:15 AM (Morning Recess)",
            "paymentMethod": "CampusWallet",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert order_resp.status_code == 201, order_resp.text
    order = order_resp.json()
    expected_total = first_item["price"] * 2
    assert order["totalAmount"] == expected_total
    assert order["status"] == "new"
    assert order["paymentStatus"] == "paid"
    assert order["tokenNumber"].startswith("A-")
    assert order["qrCodeValue"].startswith("SMARTUNI-ORDER-")

    # Verify wallet was debited: initial_balance - expected_total
    wallet_resp = client.get(
        "/api/v1/canteen/wallet/me", headers={"Authorization": f"Bearer {token}"}
    )
    expected_balance = initial_balance - expected_total
    assert wallet_resp.json()["balance"] == expected_balance


# ── Test 9: Insufficient Wallet Balance Rejected ──────────────────────────────


def test_place_order_insufficient_wallet(client):
    """Placing an order exceeding available wallet funds returns 400 Bad Request."""
    token = get_token(client, "student")
    menu_resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {token}"})
    first_item = menu_resp.json()[0]

    # Order 50 items (far exceeds ₹850)
    order_resp = client.post(
        "/api/v1/canteen/orders",
        json={
            "items": [
                {
                    "itemId": first_item["id"],
                    "name": first_item["name"],
                    "price": first_item["price"],
                    "quantity": 50,
                }
            ],
            "pickupTime": "12:30 PM",
            "paymentMethod": "CampusWallet",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert order_resp.status_code == 400
    assert "insufficient" in order_resp.text.lower()


# ── Test 10: Student List Orders ──────────────────────────────────────────────


def test_list_student_orders(client):
    """Student can retrieve their historical and active food orders."""
    token = get_token(client, "student")
    resp = client.get("/api/v1/canteen/orders/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    orders = resp.json()
    assert isinstance(orders, list)
    assert len(orders) >= 1  # Seed order A-104 exists
    tokens = [o["tokenNumber"] for o in orders]
    assert "A-104" in tokens


# ── Test 11: Staff Kitchen Queue ──────────────────────────────────────────────


def test_staff_kitchen_queue(client):
    """Canteen staff can view today's food preparation queue."""
    token = get_token(client, "canteen")
    resp = client.get("/api/v1/canteen/orders/queue", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    queue = resp.json()
    assert isinstance(queue, list)
    assert len(queue) >= 1


# ── Test 12: Staff Updates Order Status ───────────────────────────────────────


def test_staff_update_order_status(client):
    """Staff updates order lifecycle state from preparing to ready."""
    s_token = get_token(client, "student")
    # Place a new order
    menu_resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {s_token}"})
    item = menu_resp.json()[0]
    ord_resp = client.post(
        "/api/v1/canteen/orders",
        json={
            "items": [
                {"itemId": item["id"], "name": item["name"], "price": item["price"], "quantity": 1}
            ],
            "pickupTime": "01:00 PM",
            "paymentMethod": "UPI",
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    order_id = ord_resp.json()["id"]

    # Staff marks preparing
    c_token = get_token(client, "canteen")
    prep_resp = client.patch(
        f"/api/v1/canteen/orders/{order_id}/status",
        json={"status": "preparing", "counterNumber": 2},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert prep_resp.status_code == 200
    assert prep_resp.json()["status"] == "preparing"

    # Staff marks ready
    ready_resp = client.patch(
        f"/api/v1/canteen/orders/{order_id}/status",
        json={"status": "ready", "counterNumber": 2},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "ready"


# ── Test 13: Staff Scans QR Code to Redeem Order ──────────────────────────────


def test_staff_verify_qr_and_collect(client):
    """Canteen staff scans QR code to verify and release meal."""
    s_token = get_token(client, "student")
    menu_resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {s_token}"})
    item = menu_resp.json()[0]
    ord_resp = client.post(
        "/api/v1/canteen/orders",
        json={
            "items": [
                {"itemId": item["id"], "name": item["name"], "price": item["price"], "quantity": 1}
            ],
            "pickupTime": "01:15 PM",
            "paymentMethod": "UPI",
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    qr_code = ord_resp.json()["qrCodeValue"]

    # Staff scans QR
    c_token = get_token(client, "canteen")
    verify_resp = client.post(
        "/api/v1/canteen/orders/verify-qr",
        json={"qrValue": qr_code},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert verify_resp.status_code == 200, verify_resp.text
    data = verify_resp.json()
    assert data["status"] == "completed"


# ── Test 14: Duplicate QR Redemption Prevented ────────────────────────────────


def test_duplicate_qr_scan_rejected(client):
    """Scanning the same order QR code again returns 400 Bad Request."""
    s_token = get_token(client, "student")
    menu_resp = client.get("/api/v1/canteen/menu", headers={"Authorization": f"Bearer {s_token}"})
    item = menu_resp.json()[0]
    ord_resp = client.post(
        "/api/v1/canteen/orders",
        json={
            "items": [
                {"itemId": item["id"], "name": item["name"], "price": item["price"], "quantity": 1}
            ],
            "pickupTime": "01:30 PM",
            "paymentMethod": "UPI",
        },
        headers={"Authorization": f"Bearer {s_token}"},
    )
    qr_code = ord_resp.json()["qrCodeValue"]

    c_token = get_token(client, "canteen")
    # First scan succeeds
    v1 = client.post(
        "/api/v1/canteen/orders/verify-qr",
        json={"qrValue": qr_code},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert v1.status_code == 200

    # Second scan returns 400
    v2 = client.post(
        "/api/v1/canteen/orders/verify-qr",
        json={"qrValue": qr_code},
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert v2.status_code == 400
    assert "already" in v2.text.lower()
