"""Phase 4 fee management, payment gateway, receipt, and replay-safe webhook tests.

Acceptance:
  - Replay-safe webhook test green
  - Correct computed invoice status (paid, partial, due, overdue)
  - Amount validation: 0 < amount <= outstanding dues
  - PDF receipt generation
"""

from __future__ import annotations

import json

import pytest

from app.seed.seed_demo import seed


@pytest.fixture(autouse=True)
def seed_data(db):
    seed(db)


def get_student_token(client) -> str:
    resp = client.post("/api/v1/auth/dev-login", json={"role": "student"})
    return resp.json().get("accessToken") or resp.json().get("access_token")


def test_get_my_fee_invoices_computed_status(client):
    """GET /api/v1/fees/invoices/me returns invoices with computed statuses and outstanding dues."""
    token = get_student_token(client)
    resp = client.get("/api/v1/fees/invoices/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    invoices = resp.json()

    assert len(invoices) >= 2
    inv_map = {inv["invoiceNumber"]: inv for inv in invoices}

    # Semester 6 has total 85000, paid 70000 -> status is partial, outstanding is 15000
    sem6 = inv_map["INV-SEM6-8842"]
    assert sem6["status"] == "partial"
    assert sem6["totalAmount"] == 85000.0
    assert sem6["paidAmount"] == 70000.0
    assert sem6["outstandingAmount"] == 15000.0

    # Semester 5 has total 85000, paid 85000 -> status is paid, outstanding is 0
    sem5 = inv_map["INV-SEM5-8842"]
    assert sem5["status"] == "paid"
    assert sem5["outstandingAmount"] == 0.0


def test_initiate_fee_payment_success(client):
    """POST /api/v1/fees/invoices/{id}/pay creates checkout order with amount in paise."""
    token = get_student_token(client)
    resp = client.post(
        "/api/v1/fees/invoices/INV-SEM6-8842/pay",
        headers={"Authorization": f"Bearer {token}"},
        json={"amount": 10000.0},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert "orderId" in data
    assert data["amount"] == 1000000  # 10,000 INR = 1,000,000 paise
    assert data["currency"] == "INR"
    assert "keyId" in data


def test_initiate_fee_payment_exceeds_dues_rejected(client):
    """POST /api/v1/fees/invoices/{id}/pay rejects payments exceeding outstanding balance."""
    token = get_student_token(client)
    # Outstanding on Sem 6 is 15000, try paying 20000
    resp = client.post(
        "/api/v1/fees/invoices/INV-SEM6-8842/pay",
        headers={"Authorization": f"Bearer {token}"},
        json={"amount": 20000.0},
    )
    assert resp.status_code == 400


def test_verify_payment_and_generate_receipt(client):
    """POST /api/v1/fees/payments/verify records payment and returns valid PDF receipt."""
    token = get_student_token(client)
    verify_resp = client.post(
        "/api/v1/fees/payments/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "orderId": "order_mock_test_123",
            "paymentId": "pay_mock_test_123",
            "signature": "mock_signature",
            "invoiceId": "INV-SEM6-8842",
        },
    )
    assert verify_resp.status_code == 200
    payment_data = verify_resp.json()
    assert payment_data["status"] == "success"
    assert "receiptUrl" in payment_data

    # Download receipt PDF
    receipt_url = payment_data["receiptUrl"]
    pdf_resp = client.get(receipt_url)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-")


def test_replay_safe_webhook(client):
    """POST /api/v1/webhooks/razorpay is deduplicated on event_id and safe to replay."""
    webhook_payload = {
        "event_id": "evt_test_dedupe_9988",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_wh_123",
                    "order_id": "order_mock_test_123",
                    "amount": 1500000,
                    "status": "captured",
                }
            }
        },
    }
    raw_body = json.dumps(webhook_payload).encode()

    # First delivery: processed
    resp1 = client.post(
        "/api/v1/webhooks/razorpay",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Razorpay-Signature": "mock_webhook_sig",
        },
    )
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "processed"

    # Second delivery (replay): deduplicated and safe
    resp2 = client.post(
        "/api/v1/webhooks/razorpay",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Razorpay-Signature": "mock_webhook_sig",
        },
    )
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "already_processed"
