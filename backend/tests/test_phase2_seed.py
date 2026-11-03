"""Phase 2 seed and data model verification tests.

Acceptance:
  - make migrate seed yields the exact demo data from campusData.ts
  - CS604 attendance = 71.9%
  - Roll number = 0827CS221045, CGPA = 8.74
  - All 15 data domains seeded with exact fidelity
  - Seed script is completely idempotent
"""

from __future__ import annotations

import pytest

from app.models.academics import Course, Enrollment
from app.models.canteen import CanteenMenuItem, CanteenOrder, WalletAccount
from app.models.certificates import CertificateRequest
from app.models.fees import FeeInvoice
from app.models.helpdesk import HelpdeskTicket
from app.models.identity import Profile, Student
from app.models.platform import AuditLog, Notification
from app.seed.seed_demo import seed


@pytest.fixture(autouse=True)
def run_seed(db):
    """Seed the database before tests."""
    seed(db)


def test_seed_student_profile(db):
    """Faizan Ali profile and student record match campusData.ts."""
    student = db.query(Student).filter_by(roll_number="0827CS221045").first()
    assert student is not None
    assert str(student.cgpa) == "8.74"
    assert student.semester == 6
    assert student.program == "Bachelor of Technology (Computer Science)"
    assert student.batch == "2022 - 2026"

    profile = db.query(Profile).filter_by(email="faizan.ali@smartuni.edu.in").first()
    assert profile is not None
    assert profile.name == "Faizan Ali"
    assert profile.role == "student"


def test_seed_courses_and_cs604_attendance(db):
    """CS604 Software Engineering has exactly 71.9% attendance (23/32 classes)."""
    courses = db.query(Course).all()
    assert len(courses) >= 5
    codes = {c.code for c in courses}
    assert {"CS601", "CS602", "CS603", "CS604", "CS605"}.issubset(codes)

    cs604 = db.query(Course).filter_by(code="CS604").first()
    assert cs604 is not None
    assert cs604.credits == 3

    # Check Faizan's enrollment in CS604
    student_profile = db.query(Profile).filter_by(email="faizan.ali@smartuni.edu.in").first()
    from app.models.academics import CourseOffering

    enrollment = (
        db.query(Enrollment)
        .join(Enrollment.offering)
        .join(CourseOffering.course)
        .filter(Enrollment.student_id == student_profile.id, Course.code == "CS604")
        .first()
    )
    assert enrollment is not None
    assert enrollment.total_classes == 32
    assert enrollment.attended_classes == 23
    assert enrollment.attendance_percent == 71.9


def test_seed_fees(db):
    """Fee invoices seeded correctly with pending and paid status."""
    inv6 = db.query(FeeInvoice).filter_by(invoice_number="INV-SEM6-8842").first()
    assert inv6 is not None
    assert int(inv6.total_amount) == 85000
    assert inv6.status == "partial"
    assert len(inv6.payments) == 1
    assert int(inv6.payments[0].amount) == 70000


def test_seed_canteen_and_wallet(db):
    """Canteen menu items, demo order, and wallet account are populated."""
    items = db.query(CanteenMenuItem).all()
    assert len(items) >= 8

    student_profile = db.query(Profile).filter_by(email="faizan.ali@smartuni.edu.in").first()
    wallet = db.query(WalletAccount).filter_by(student_id=student_profile.id).first()
    assert wallet is not None
    assert float(wallet.balance) == 850.0

    order = db.query(CanteenOrder).filter_by(token_number=104).first()
    assert order is not None
    assert order.status == "preparing"
    assert float(order.total_amount) == 130.0


def test_seed_certificates_and_helpdesk(db):
    """Certificate request and Helpdesk ticket seeded."""
    cert = db.query(CertificateRequest).filter_by(verification_code="CRT-2026-9041").first()
    assert cert is not None
    assert cert.certificate_type == "Bonafide Certificate"
    assert cert.status == "ready_for_download"

    ticket = db.query(HelpdeskTicket).filter_by(ticket_number="TKT-2026-881").first()
    assert ticket is not None
    assert ticket.category == "IT & Wi-Fi"
    assert ticket.priority == "High"
    assert ticket.status == "in_progress"


def test_seed_notifications_and_audit(db):
    """Notifications and Audit logs seeded."""
    student_profile = db.query(Profile).filter_by(email="faizan.ali@smartuni.edu.in").first()
    notifs = db.query(Notification).filter_by(user_id=student_profile.id).all()
    assert len(notifs) >= 4

    logs = db.query(AuditLog).all()
    assert len(logs) >= 4


def test_seed_is_idempotent(db):
    """Running seed() a second time doesn't error or create duplicate records."""
    seed(db)
    students = db.query(Student).filter_by(roll_number="0827CS221045").all()
    assert len(students) == 1
