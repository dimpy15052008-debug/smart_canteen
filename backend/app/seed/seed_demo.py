"""Database seed script — populates initial demo campus data.

Ports src/mock/campusData.ts into the database with exact fidelity.
Idempotent — safe to run multiple times.

Usage:
  python -m app.seed.seed_demo
  make seed
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.academics import Course, CourseOffering, Enrollment, Program, Room, TimetableSlot
from app.models.ai import AIPrediction, Intervention, LearningResource, Recommendation
from app.models.assessment import Exam, ExamSeat
from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.canteen import CanteenMenuItem, CanteenOrder, WalletAccount, WalletTransaction
from app.models.certificates import CertificateRequest
from app.models.fees import FeeInvoice, Payment
from app.models.helpdesk import HelpdeskMessage, HelpdeskTicket
from app.models.hostel_transport import (
    Bus,
    BusPosition,
    BusRoute,
    BusStop,
    Hostel,
    HostelRoom,
)
from app.models.identity import Department, Faculty, Profile, Student
from app.models.platform import AuditLog, Notification
from app.services.auth_service import DEMO_PROFILES


def seed(db: SessionLocal = None) -> None:
    import app.models  # noqa: F401
    from app.db.base import Base
    from app.db.session import engine

    Base.metadata.create_all(bind=engine)

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        print("[SEED] Starting SmartUni.Ai database seed...")

        # ── 1. Department ──────────────────────────────────────────────────────
        dept = db.query(Department).filter_by(code="CSE").first()
        if not dept:
            dept = Department(
                name="Computer Science & Engineering",
                code="CSE",
            )
            db.add(dept)
            db.flush()
            print("[SEED] Added Department: CSE")

        # ── 2. Demo Profiles ──────────────────────────────────────────────────
        demo_password_hash = hash_password("demo123")

        profiles_by_role: dict[str, Profile] = {}
        for role, p_data in DEMO_PROFILES.items():
            profile = db.query(Profile).filter_by(email=p_data["email"]).first()
            if not profile:
                profile = Profile(
                    id=uuid.UUID(p_data["id"]),
                    email=p_data["email"],
                    name=p_data["name"],
                    role=p_data["role"],
                    avatar=p_data.get("avatar"),
                    phone=p_data.get("phone"),
                    active=True,
                    hashed_password=demo_password_hash,
                    department_id=dept.id if role in ("student", "faculty") else None,
                    designation=p_data.get("designation"),
                )
                db.add(profile)
                db.flush()
                print(f"[SEED] Added Profile: {p_data['name']} ({role})")
            profiles_by_role[role] = profile

        student_profile = profiles_by_role["student"]
        faculty_profile = profiles_by_role["faculty"]
        admin_profile = profiles_by_role["admin"]

        # ── 3. Hostels & Bus Routes ───────────────────────────────────────────
        hostel = db.query(Hostel).filter_by(name="Tagore Hostel (Block B)").first()
        if not hostel:
            hostel = Hostel(
                name="Tagore Hostel (Block B)",
                warden_name="Dr. K. P. Singh",
                warden_phone="+91 94250 88210",
                curfew_time="09:30 PM",
            )
            db.add(hostel)
            db.flush()

        h_room = db.query(HostelRoom).filter_by(hostel_id=hostel.id, room_number="304").first()
        if not h_room:
            h_room = HostelRoom(
                hostel_id=hostel.id,
                room_number="304",
                bed_label="Bed 1",
                capacity=2,
            )
            db.add(h_room)
            db.flush()

        bus_route = db.query(BusRoute).filter_by(route_number="Route 4").first()
        if not bus_route:
            bus_route = BusRoute(
                route_number="Route 4",
                route_name="North Campus Express (Airport Road -> Campus Gate 1)",
            )
            db.add(bus_route)
            db.flush()

            stop1 = BusStop(
                route_id=bus_route.id,
                name="Gandhi Nagar Square",
                scheduled_time="08:15 AM",
                stop_order=1,
            )
            stop2 = BusStop(
                route_id=bus_route.id,
                name="University Main Gate",
                scheduled_time="08:45 AM",
                stop_order=2,
            )
            db.add_all([stop1, stop2])
            db.flush()

            bus = Bus(
                route_id=bus_route.id,
                driver_name="Sukhdev Singh",
                driver_phone="+91 94250 11223",
                vehicle_number="MP-04-E-4421",
                capacity=48,
            )
            db.add(bus)
            db.flush()

            pos = BusPosition(
                bus_id=bus.id,
                lat=Decimal("23.259933"),
                lng=Decimal("77.412615"),
                speed_kmh=Decimal("38.5"),
                occupied_seats=34,
                current_stop_id=stop1.id,
                next_stop_id=stop2.id,
                eta_minutes=6,
            )
            db.add(pos)
            db.flush()

        bus_route2 = db.query(BusRoute).filter_by(route_number="Route 2").first()
        if not bus_route2:
            bus_route2 = BusRoute(
                route_number="Route 2",
                route_name="South City Metro Link (MP Nagar -> Campus Gate 3)",
            )
            db.add(bus_route2)
            db.flush()

            stop2_1 = BusStop(
                route_id=bus_route2.id,
                name="MP Nagar Zone 1",
                scheduled_time="07:40 AM",
                stop_order=1,
            )
            stop2_2 = BusStop(
                route_id=bus_route2.id,
                name="Board Office Square",
                scheduled_time="07:55 AM",
                stop_order=2,
            )
            stop2_3 = BusStop(
                route_id=bus_route2.id,
                name="Link Road Stop 2",
                scheduled_time="08:15 AM",
                stop_order=3,
            )
            stop2_4 = BusStop(
                route_id=bus_route2.id,
                name="University Sports Complex",
                scheduled_time="08:35 AM",
                stop_order=4,
            )
            db.add_all([stop2_1, stop2_2, stop2_3, stop2_4])
            db.flush()

            bus2 = Bus(
                route_id=bus_route2.id,
                driver_name="Mohanlal Yadav",
                driver_phone="+91 98261 44556",
                vehicle_number="MP-04-E-3312",
                capacity=52,
            )
            db.add(bus2)
            db.flush()

            pos2 = BusPosition(
                bus_id=bus2.id,
                lat=Decimal("23.233200"),
                lng=Decimal("77.434100"),
                speed_kmh=Decimal("28.0"),
                occupied_seats=48,
                current_stop_id=stop2_2.id,
                next_stop_id=stop2_3.id,
                eta_minutes=14,
            )
            db.add(pos2)
            db.flush()

        # ── 4. Student Entity ─────────────────────────────────────────────────
        student = db.query(Student).filter_by(profile_id=student_profile.id).first()
        if not student:
            student = Student(
                profile_id=student_profile.id,
                roll_number="0827CS221045",
                enrollment_id="ENR-2022-CSE-0145",
                program="Bachelor of Technology (Computer Science)",
                batch="2022 - 2026",
                semester=6,
                cgpa=Decimal("8.74"),
                hostel_room_id=h_room.id,
                bus_route_id=bus_route.id,
            )
            db.add(student)
            db.flush()
            print("[SEED] Added Student record for Faizan Ali (Roll: 0827CS221045, CGPA: 8.74)")

        # Faculty entity
        faculty = db.query(Faculty).filter_by(profile_id=faculty_profile.id).first()
        if not faculty:
            faculty = Faculty(
                profile_id=faculty_profile.id,
                cabin_number="Academic Block A - Room 412",
            )
            db.add(faculty)
            db.flush()

        # ── 5. Academics: Program, Rooms, Courses ─────────────────────────────
        prog = db.query(Program).filter_by(code="BTECH_CSE").first()
        if not prog:
            prog = Program(
                name="B.Tech Computer Science & Engineering", code="BTECH_CSE", duration_years=4
            )
            db.add(prog)
            db.flush()

        rooms_data = [
            ("Room 402 - Tech Block", "Tech Block", 23.2599, 77.4126),
            ("Lab 2B - IT Center", "IT Center", 23.2605, 77.4131),
            ("Seminar Hall 1", "Tech Block", 23.2595, 77.4120),
            ("Room 305 - Main Block", "Main Block", 23.2588, 77.4115),
            ("Lab 4 - Tech Block", "Tech Block", 23.2600, 77.4128),
        ]
        room_map: dict[str, Room] = {}
        for r_name, bldg, lat, lng in rooms_data:
            room = db.query(Room).filter_by(name=r_name).first()
            if not room:
                room = Room(
                    name=r_name, building=bldg, latitude=lat, longitude=lng, geofence_radius_m=60.0
                )
                db.add(room)
                db.flush()
            room_map[r_name] = room

        courses_data = [
            (
                "CS601",
                "Distributed Systems & Cloud Computing",
                4,
                6,
                "Room 402 - Tech Block",
                "Monday",
                "10:00 AM",
                "11:15 AM",
                36,
                32,
                88.9,
                78,
            ),
            (
                "CS602",
                "Database Management & Advanced SQL",
                4,
                6,
                "Lab 2B - IT Center",
                "Monday",
                "11:30 AM",
                "12:45 PM",
                35,
                33,
                94.3,
                82,
            ),
            (
                "CS603",
                "Machine Learning & Deep Neural Networks",
                4,
                6,
                "Seminar Hall 1",
                "Monday",
                "01:45 PM",
                "03:00 PM",
                34,
                29,
                85.3,
                70,
            ),
            (
                "CS604",
                "Software Engineering & Agile Architectures",
                3,
                6,
                "Room 305 - Main Block",
                "Tuesday",
                "09:00 AM",
                "10:15 AM",
                32,
                23,
                71.9,
                65,
            ),
            (
                "CS605",
                "Information Security & Cryptography",
                4,
                6,
                "Lab 4 - Tech Block",
                "Tuesday",
                "10:30 AM",
                "11:45 AM",
                30,
                27,
                90.0,
                75,
            ),
        ]

        course_map: dict[str, Course] = {}
        for code, name, creds, sem, r_name, day, s_time, e_time, tot, att, pct, syl in courses_data:
            course = db.query(Course).filter_by(code=code).first()
            if not course:
                course = Course(code=code, name=name, credits=creds, semester=sem)
                db.add(course)
                db.flush()
            course_map[code] = course

            offering = (
                db.query(CourseOffering)
                .filter_by(course_id=course.id, faculty_id=faculty_profile.id)
                .first()
            )
            if not offering:
                offering = CourseOffering(
                    course_id=course.id,
                    faculty_id=faculty_profile.id,
                    academic_year="2025-2026",
                    semester=sem,
                )
                db.add(offering)
                db.flush()

                slot = TimetableSlot(
                    offering_id=offering.id,
                    room_id=room_map[r_name].id,
                    day_of_week=day,
                    start_time=s_time,
                    end_time=e_time,
                )
                db.add(slot)
                db.flush()

            enrollment = (
                db.query(Enrollment)
                .filter_by(student_id=student_profile.id, offering_id=offering.id)
                .first()
            )
            if not enrollment:
                enrollment = Enrollment(
                    student_id=student_profile.id,
                    offering_id=offering.id,
                    total_classes=tot,
                    attended_classes=att,
                    attendance_percent=pct,
                    syllabus_covered=syl,
                )
                db.add(enrollment)
                db.flush()
                print(f"[SEED] Enrolled Faizan in {code}: {att}/{tot} ({pct}%)")

        # ── 6. Live Attendance Session ────────────────────────────────────────
        cs601 = course_map["CS601"]
        now = datetime.now(UTC)
        active_session = (
            db.query(AttendanceSession).filter_by(course_id=cs601.id, status="active").first()
        )
        if not active_session:
            active_session = AttendanceSession(
                course_id=cs601.id,
                faculty_id=faculty_profile.id,
                room_id=room_map["Room 402 - Tech Block"].id,
                opens_at=now - timedelta(minutes=5),
                expires_at=now + timedelta(minutes=15),
                code="SA-601",
                status="active",
            )
            db.add(active_session)
            db.flush()

            att_rec = AttendanceRecord(
                session_id=active_session.id,
                student_id=student_profile.id,
                status="present",
                verification_method="geo_face_liveness",
                location_verified=True,
                latitude=23.259930,
                longitude=77.412610,
                accuracy_m=4.2,
                face_confidence=98.4,
                liveness_verified=True,
                notes="Biometric verification verified within geofence perimeter.",
            )
            db.add(att_rec)
            db.flush()

        # ── 7. Exams & Exam Seats ─────────────────────────────────────────────
        exams_data = [
            (
                "CS601",
                "Mid-Semester",
                date(2026, 10, 6),
                "10:00 AM",
                "12:00 PM",
                "Tech Block Hall 401",
                "B-24",
                50,
            ),
            (
                "CS602",
                "Mid-Semester",
                date(2026, 10, 8),
                "10:00 AM",
                "12:00 PM",
                "Main Block Hall 202",
                "A-18",
                50,
            ),
            (
                "CS603",
                "Mid-Semester",
                date(2026, 10, 10),
                "02:00 PM",
                "04:00 PM",
                "Tech Block Hall 402",
                "C-05",
                50,
            ),
            (
                "CS604",
                "Mid-Semester",
                date(2026, 10, 12),
                "10:00 AM",
                "12:00 PM",
                "Main Block Hall 301",
                "B-11",
                50,
            ),
            (
                "CS605",
                "Mid-Semester",
                date(2026, 10, 14),
                "02:00 PM",
                "04:00 PM",
                "Tech Block Hall 401",
                "A-09",
                50,
            ),
        ]
        for c_code, e_type, e_date, s_time, e_time, hall, seat, m_marks in exams_data:
            course = course_map[c_code]
            exam = (
                db.query(Exam)
                .filter_by(course_id=course.id, exam_type=e_type, exam_date=e_date)
                .first()
            )
            if not exam:
                exam = Exam(
                    course_id=course.id,
                    exam_type=e_type,
                    exam_date=e_date,
                    start_time=s_time,
                    end_time=e_time,
                    hall=hall,
                    max_marks=m_marks,
                )
                db.add(exam)
                db.flush()

                exam_seat = ExamSeat(
                    exam_id=exam.id,
                    student_id=student_profile.id,
                    seat_number=seat,
                )
                db.add(exam_seat)
                db.flush()

        # ── 8. Fee Invoices ───────────────────────────────────────────────────
        inv6 = db.query(FeeInvoice).filter_by(invoice_number="INV-SEM6-8842").first()
        if not inv6:
            inv6 = FeeInvoice(
                invoice_number="INV-SEM6-8842",
                student_id=student_profile.id,
                semester=Decimal("6"),
                academic_year="2025 - 2026",
                due_date=date(2026, 10, 15),
                tuition_fee=Decimal("55000.00"),
                development_fee=Decimal("10000.00"),
                exam_fee=Decimal("5000.00"),
                hostel_fee=Decimal("15000.00"),
                total_amount=Decimal("85000.00"),
                status="partial",
            )
            db.add(inv6)
            db.flush()

            p1 = Payment(
                invoice_id=inv6.id,
                amount=Decimal("70000.00"),
                gateway="razorpay",
                gateway_payment_id="pay_demo_sem6_70000",
                status="success",
                receipt_path="/receipts/RCP-SEM6-8842.pdf",
            )
            db.add(p1)
            db.flush()

        inv5 = db.query(FeeInvoice).filter_by(invoice_number="INV-SEM5-8842").first()
        if not inv5:
            inv5 = FeeInvoice(
                invoice_number="INV-SEM5-8842",
                student_id=student_profile.id,
                semester=Decimal("5"),
                academic_year="2025 - 2026",
                due_date=date(2025, 10, 15),
                tuition_fee=Decimal("55000.00"),
                development_fee=Decimal("10000.00"),
                exam_fee=Decimal("5000.00"),
                hostel_fee=Decimal("15000.00"),
                total_amount=Decimal("85000.00"),
                status="paid",
            )
            db.add(inv5)
            db.flush()

            p2 = Payment(
                invoice_id=inv5.id,
                amount=Decimal("85000.00"),
                gateway="razorpay",
                gateway_payment_id="pay_demo_sem5_85000",
                status="success",
                receipt_path="/receipts/RCP-SEM5-8842.pdf",
            )
            db.add(p2)
            db.flush()

        # ── 9. Canteen Menu, Orders & Wallet ──────────────────────────────────
        menu_items_data = [
            ("Paneer Butter Masala Thali", "Lunch & Meals", 130, True, 12, 620, "veg", 4.8),
            ("Grilled Veggie Club Sandwich", "Snacks & Bites", 75, True, 8, 340, "veg", 4.6),
            ("Masala Dosa with Sambar", "Breakfast Specials", 60, True, 6, 280, "veg", 4.7),
            ("Chole Bhature (2 pcs)", "Breakfast Specials", 80, True, 10, 520, "veg", 4.5),
            ("Iced Hazelnut Cold Coffee", "Beverages", 55, True, 4, 180, "veg", 4.9),
            ("Fresh Orange & Carrot Juice", "Beverages", 45, True, 3, 110, "veg", 4.6),
            ("Sprouted Moong Salad Bowl", "Healthy Bites", 50, True, 5, 160, "vegan", 4.4),
            ("Hyderabadi Veg Biryani", "Lunch & Meals", 110, True, 10, 540, "veg", 4.7),
        ]
        for name, cat, price, avail, prep, cal, diet, rat in menu_items_data:
            item = db.query(CanteenMenuItem).filter_by(name=name).first()
            if not item:
                item = CanteenMenuItem(
                    name=name,
                    category=cat,
                    price=Decimal(str(price)),
                    available=avail,
                    prep_time_mins=prep,
                    calories=cal,
                    dietary=diet,
                    rating=rat,
                )
                db.add(item)
                db.flush()

        wallet = db.query(WalletAccount).filter_by(student_id=student_profile.id).first()
        if not wallet:
            wallet = WalletAccount(
                student_id=student_profile.id,
                balance=Decimal("850.00"),
                status="active",
            )
            db.add(wallet)
            db.flush()

            tx = WalletTransaction(
                wallet_id=wallet.id,
                amount=Decimal("1000.00"),
                transaction_type="credit",
                reference="UPI Top-Up via PhonePe",
                balance_after=Decimal("1000.00"),
                timestamp=now - timedelta(days=2),
            )
            db.add(tx)
            db.flush()

        order = db.query(CanteenOrder).filter_by(order_date=date.today(), token_number=104).first()
        if not order:
            order = CanteenOrder(
                token_number=104,
                order_date=date.today(),
                student_id=student_profile.id,
                items_json='[{"itemId":"m2","name":"Grilled Veggie Club Sandwich","price":75,"quantity":1},{"itemId":"m5","name":"Iced Hazelnut Cold Coffee","price":55,"quantity":1}]',
                total_amount=Decimal("130.00"),
                pickup_time="11:15 AM (Morning Recess)",
                status="preparing",
                payment_status="paid",
                payment_method="wallet",
                qr_value="SMARTUNI-ORDER-A104-STU8842",
                counter="Counter #2",
            )
            db.add(order)
            db.flush()

        # ── 10. Certificates ──────────────────────────────────────────────────
        cert1 = db.query(CertificateRequest).filter_by(verification_code="CRT-2026-9041").first()
        if not cert1:
            cert1 = CertificateRequest(
                student_id=student_profile.id,
                certificate_type="Bonafide Certificate",
                purpose="Application for Madhya Pradesh State Higher Education Merit Scholarship & State Bus Concession",
                academic_year="2025 - 2026",
                status="ready_for_download",
                verified_by=admin_profile.id,
                approved_at=now - timedelta(days=1),
                verification_code="CRT-2026-9041",
                document_hash="SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                file_path="/certificates/bonafide_0827CS221045.pdf",
            )
            db.add(cert1)
            db.flush()

        # ── 11. Helpdesk ──────────────────────────────────────────────────────
        ticket = db.query(HelpdeskTicket).filter_by(ticket_number="TKT-2026-881").first()
        if not ticket:
            ticket = HelpdeskTicket(
                ticket_number="TKT-2026-881",
                student_id=student_profile.id,
                subject="Hostel Block B 3rd Floor Wi-Fi Access Point frequent disconnects",
                description="The Wi-Fi access point in corridor 3 near room 304 keeps dropping DNS resolution every 15 minutes, affecting project lab submissions.",
                category="IT & Wi-Fi",
                priority="High",
                ai_sentiment="Frustrated",
                assigned_department="Campus Network & IT Infrastructure Cell",
                status="in_progress",
                sla_deadline=now + timedelta(hours=24),
                resolution_notes="Hardware switch reboot scheduled. Technician assigned.",
            )
            db.add(ticket)
            db.flush()

            msg = HelpdeskMessage(
                ticket_id=ticket.id,
                sender_id=student_profile.id,
                message="Issue is persistent across multiple laptops in our corridor.",
            )
            db.add(msg)
            db.flush()

        # ── 12. Notifications & Audit Logs ────────────────────────────────────
        notifs_data = [
            (
                "SmartAttend AI Session Active",
                "Prof. Rajesh Sharma has started attendance for CS601 in Room 402. Verification window closes in 12 mins.",
                "attendance",
                "smart-attend",
            ),
            (
                "Canteen Order Token #A-104",
                "Your order is currently being prepared in Kitchen Counter 2. Estimated pickup: 11:15 AM.",
                "canteen",
                "canteen",
            ),
            (
                "Attendance Risk Alert (CS604)",
                "Software Engineering attendance is 71.9% (below 75% requirement). Attend the next 3 lectures to recover eligibility.",
                "attendance",
                "attendance",
            ),
            (
                "Digital Certificate Issued",
                "Your Bonafide Certificate request has been digitally signed and is ready for download.",
                "certificate",
                "certificates",
            ),
        ]
        for title, msg, n_type, act in notifs_data:
            notif = (
                db.query(Notification).filter_by(user_id=student_profile.id, title=title).first()
            )
            if not notif:
                notif = Notification(
                    user_id=student_profile.id,
                    title=title,
                    message=msg,
                    type=n_type,
                    read=False,
                    action_link=act,
                )
                db.add(notif)
                db.flush()

        audit_entries = [
            (
                str(student_profile.id),
                "student",
                "ATTENDANCE_VERIFIED_GEO_FACE",
                "AttendanceSession",
                "CS601-20260926",
                "Geofence validated within 4.2m. Face confidence 98.4%. Liveness passed.",
            ),
            (
                str(admin_profile.id),
                "admin",
                "CERTIFICATE_DIGITALLY_SIGNED",
                "CertificateRequest",
                "CRT-2026-9041",
                "Approved Bonafide Certificate for Faizan Ali. Verified zero fee dues and 86.4% aggregate attendance.",
            ),
            (
                str(student_profile.id),
                "student",
                "FEE_PAYMENT_PROCESSED",
                "FeeInvoice",
                "INV-SEM6-8842",
                "Razorpay payment of Rs 70,000 processed. Receipt generated.",
            ),
            (
                str(student_profile.id),
                "student",
                "CANTEEN_ORDER_PLACED",
                "CanteenOrder",
                "ORD-801",
                "Order Token #A-104 placed at Counter 2. Total: Rs 130.",
            ),
        ]
        for actor, role, action, target, ent_id, detail in audit_entries:
            log_row = (
                db.query(AuditLog)
                .filter_by(actor_id=actor, action=action, entity_id=ent_id)
                .first()
            )
            if not log_row:
                log_row = AuditLog(
                    timestamp=now - timedelta(hours=2),
                    actor_id=actor,
                    actor_role=role,
                    action=action,
                    target_entity=target,
                    entity_id=ent_id,
                    details=detail,
                    ip_address="10.24.112.84",
                )
                db.add(log_row)
                db.flush()

        # ── 13. ML Early Warning, Learning Resources & Interventions ──────────
        resources_data = [
            (
                "Operating Systems: Concurrency & Semaphores",
                "https://smartuni.ai/resources/cs604-concurrency",
                "CS604, OS, Concurrency, Multithreading",
                "Intermediate",
            ),
            (
                "Compiler Design: Syntax Directed Translation",
                "https://smartuni.ai/resources/cs601-parsing",
                "CS601, Compiler, Lex-Yacc, Parsing",
                "Advanced",
            ),
            (
                "Computer Networks: TCP Congestion Control Deep Dive",
                "https://smartuni.ai/resources/cs602-tcp",
                "CS602, Networks, TCP, Sockets",
                "Intermediate",
            ),
            (
                "Software Engineering: Agile Sprint Planning & CI/CD",
                "https://smartuni.ai/resources/cs603-agile",
                "CS603, Software Engineering, DevOps, Scrum",
                "Beginner",
            ),
        ]
        created_resources = []
        for title, url, tags, diff in resources_data:
            res = db.query(LearningResource).filter_by(title=title).first()
            if not res:
                res = LearningResource(title=title, url=url, tags=tags, difficulty=diff)
                db.add(res)
                db.flush()
            created_resources.append(res)

        # Run ML early warning evaluation for student Faizan Ali
        from app.services import ml_service  # noqa: PLC0415

        prediction_out = ml_service.evaluate_student(student_profile.id, db, save_db=True)
        print(
            f"[SEED] Student Early Warning evaluated: {prediction_out.risk_level} risk (p={prediction_out.probability})"
        )

        # Create active intervention assigned to Prof. Rajesh Sharma
        pred_record = db.query(AIPrediction).filter_by(student_id=student_profile.id).first()
        if pred_record:
            inv = db.query(Intervention).filter_by(prediction_id=pred_record.id).first()
            if not inv:
                inv = Intervention(
                    prediction_id=pred_record.id,
                    status="In Progress",
                    notes="Academic counseling session held on 2026-09-27. Student committed to 100% attendance in CS604 to clear detention risk.",
                    owner_id=faculty_profile.id,
                )
                db.add(inv)
                db.flush()

        # Create smart recommendation linking CS604 resource
        os_res = db.query(LearningResource).filter(LearningResource.tags.contains("CS604")).first()
        if os_res:
            rec = (
                db.query(Recommendation)
                .filter_by(student_id=student_profile.id, resource_id=os_res.id)
                .first()
            )
            if not rec:
                rec = Recommendation(
                    student_id=student_profile.id,
                    resource_id=os_res.id,
                    reason="Recommended for CS604 reinforcement due to 71.9% attendance shortfall.",
                    status="Active",
                )
                db.add(rec)
                db.flush()

        db.commit()
        print("[SEED] Successfully completed SmartUni.Ai database seed.")

    except Exception as exc:
        db.rollback()
        print(f"[SEED] ERROR during database seed: {exc}")
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed()
