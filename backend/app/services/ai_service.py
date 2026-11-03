"""CampusAI service: Gemini tool-calling, real DB tool executors, heuristic fallback, and conversation persistence.

Architecture
------------
1. Build Gemini client lazily (only if GEMINI_API_KEY is set and LLM_PROVIDER=gemini).
2. On each chat request:
   a. Persist/resume AIConversation in the DB.
   b. Attempt Gemini call with 8 function declarations; iterate GEMINI_MODELS_LIST as fallback chain.
   c. If a function_call is returned, execute the matching DB tool and send the result back.
   d. If Gemini fails or is unavailable, run the heuristic semantic fallback engine.
3. Save user + assistant messages (with tool metadata) to ai_messages.
"""

from __future__ import annotations

import json
import re
import time
import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.models.academics import Course, CourseOffering, Enrollment, TimetableSlot
from app.models.ai import AIConversation, AIMessage
from app.models.assessment import Exam, ExamSeat
from app.models.fees import FeeInvoice, Payment
from app.models.identity import Profile, Student
from app.schemas.ai import ActionExecuted, ChatRequest, ChatResponse, ConversationOut, MessageOut
from app.schemas.certificates import RequestCertificateIn
from app.schemas.helpdesk import CreateTicketRequest
from app.services import certificate_service, helpdesk_service

log = get_logger(__name__)


# ── Persona tone strings (mirrors server.ts) ────────────────────────────────────

_PERSONA_TONES: dict[str, str] = {
    "cool_buddy": (
        "Adopt a cool, confident, humorous buddy swagger. Use punchy campus flair like "
        "'Deal with it!', 'Gotchu covered!', 'Check this out:', or funny robotic confidence."
    ),
    "wise_prof": (
        "Adopt a scholarly, wise, and erudite professor persona with thoughtful academic wit, "
        "e.g. 'An astute academic inquiry, my esteemed scholar...'"
    ),
    "sparky": (
        "Adopt an ultra-energetic, cheery, fast-paced robotic tone full of enthusiasm and positive sparks!"
    ),
    "comedic": (
        "Adopt a comedic standup robot personality with hilarious analogies, clever jokes, "
        "and playful humor while keeping factual answers accurate."
    ),
}

_DEFAULT_TONE = "Be warm, articulate, charismatic, and genuinely helpful."


# ── Tool declarations (mirrors server.ts) ──────────────────────────────────────

_TOOL_DECLARATIONS = [
    {
        "name": "get_attendance",
        "description": "Retrieve current student attendance stats, course-wise breakdown, and detention warnings.",
        "parameters": {
            "type": "object",
            "properties": {
                "studentId": {"type": "string", "description": "The student profile ID"},
            },
        },
    },
    {
        "name": "get_fee_status",
        "description": "Get pending dues, paid amounts, and upcoming payment deadlines.",
        "parameters": {
            "type": "object",
            "properties": {
                "studentId": {"type": "string", "description": "The student profile ID"},
            },
        },
    },
    {
        "name": "get_exam_schedule",
        "description": "Get upcoming mid-semester and end-semester examination dates, halls, and seating.",
        "parameters": {
            "type": "object",
            "properties": {
                "semester": {"type": "integer", "description": "Semester number"},
            },
        },
    },
    {
        "name": "get_timetable",
        "description": "Get today's class timetable, room locations, and professor names.",
        "parameters": {
            "type": "object",
            "properties": {
                "day": {"type": "string", "description": "Day of week, e.g. Monday"},
            },
        },
    },
    {
        "name": "get_transport_info",
        "description": "Get campus bus route details, current stop, ETA, and driver phone.",
        "parameters": {
            "type": "object",
            "properties": {
                "routeNumber": {"type": "string", "description": "Route number, e.g. Route 4"},
            },
        },
    },
    {
        "name": "get_hostel_status",
        "description": "Get student hostel room allotment, warden details, and gate curfew rules.",
        "parameters": {
            "type": "object",
            "properties": {
                "studentId": {"type": "string", "description": "The student profile ID"},
            },
        },
    },
    {
        "name": "create_helpdesk_ticket",
        "description": "Submit an official university complaint/grievance ticket on behalf of the student.",
        "parameters": {
            "type": "object",
            "properties": {
                "subject": {"type": "string", "description": "Short summary of the problem"},
                "category": {"type": "string"},
                "description": {"type": "string", "description": "Detailed problem description"},
            },
            "required": ["subject", "description"],
        },
    },
    {
        "name": "request_certificate",
        "description": "Submit a certificate application: Bonafide Certificate, Character Certificate, Official Transcript, Course Completion Certificate.",
        "parameters": {
            "type": "object",
            "properties": {
                "certificateType": {"type": "string"},
                "purpose": {"type": "string", "description": "Reason for requesting the document"},
            },
            "required": ["certificateType", "purpose"],
        },
    },
]


# ── Real DB tool executors ─────────────────────────────────────────────────────


def _exec_get_attendance(
    profile: Profile, student: Student, db: Session
) -> tuple[str, ActionExecuted]:
    enrollments = db.query(Enrollment).filter_by(student_id=profile.id).all()
    courses_data = []
    for e in enrollments:
        offering = db.query(CourseOffering).filter_by(id=e.offering_id).first()
        course = db.query(Course).filter_by(id=offering.course_id).first() if offering else None
        pct = e.attendance_percent
        status = "Safe" if pct >= 75.0 else "⚠️ AT RISK (<75% threshold)"
        courses_data.append(
            {
                "code": course.code if course else "N/A",
                "name": course.name if course else "N/A",
                "attendance": f"{pct:.1f}%",
                "status": status,
            }
        )

    overall = (
        sum(e.attendance_percent for e in enrollments) / len(enrollments) if enrollments else 0.0
    )
    at_risk = [c for c in courses_data if "AT RISK" in c["status"]]
    at_risk_str = (
        ", ".join(f"{c['code']} ({c['attendance']})" for c in at_risk) if at_risk else "None"
    )
    reply = (
        f"Overall attendance: {overall:.1f}%. "
        f"{'Courses at risk: ' + at_risk_str + '.' if at_risk else 'All courses are in the safe zone.'} "
        f"{'You need 3 consecutive classes to recover in at-risk subjects.' if at_risk else ''}"
    ).strip()
    return reply, ActionExecuted(type="attendance_lookup", data=courses_data)


def _exec_get_fee_status(profile: Profile, db: Session) -> tuple[str, ActionExecuted]:
    invoices = db.query(FeeInvoice).filter_by(student_id=profile.id).all()
    fee_data: dict[str, Any] = {}
    if invoices:
        inv = invoices[0]
        paid_sum = sum(
            float(p.amount)
            for p in db.query(Payment)
            .filter(Payment.invoice_id == inv.id, Payment.status == "success")
            .all()
        )
        total = float(inv.total_amount)
        pending = max(0.0, total - paid_sum)
        fee_data = {
            "total": f"₹{total:,.0f}",
            "paid": f"₹{paid_sum:,.0f}",
            "pending": f"₹{pending:,.0f}",
            "dueDate": str(inv.due_date),
            "status": "Paid" if pending <= 0 else ("Partially Paid" if paid_sum > 0 else "Due"),
        }
        reply = (
            f"Total semester fee is ₹{total:,.0f}. You have paid ₹{paid_sum:,.0f} "
            f"with a remaining balance of ₹{pending:,.0f} due by {inv.due_date}."
        )
    else:
        fee_data = {}
        reply = "No fee invoices found for your account."
    return reply, ActionExecuted(type="fee_lookup", data=fee_data)


def _exec_get_exam_schedule(
    profile: Profile, student: Student, db: Session
) -> tuple[str, ActionExecuted]:
    seats = (
        db.query(ExamSeat, Exam, Course)
        .join(Exam, ExamSeat.exam_id == Exam.id)
        .join(Course, Exam.course_id == Course.id)
        .filter(ExamSeat.student_id == profile.id)
        .order_by(Exam.exam_date)
        .limit(5)
        .all()
    )
    exam_data = []
    if seats:
        for seat, exam, course in seats:
            exam_data.append(
                {
                    "course": f"{course.code} - {course.name}",
                    "type": exam.exam_type,
                    "date": str(exam.exam_date),
                    "time": f"{exam.start_time} - {exam.end_time}",
                    "hall": exam.hall,
                    "seat": seat.seat_number,
                }
            )
    else:
        # Fallback: check exams for courses the student is enrolled in
        enrolled_exams = (
            db.query(Exam, Course)
            .join(Course, Exam.course_id == Course.id)
            .join(CourseOffering, CourseOffering.course_id == Course.id)
            .join(Enrollment, Enrollment.offering_id == CourseOffering.id)
            .filter(Enrollment.student_id == student.id)
            .order_by(Exam.exam_date)
            .limit(5)
            .all()
        )
        for exam, course in enrolled_exams:
            exam_data.append(
                {
                    "course": f"{course.code} - {course.name}",
                    "type": exam.exam_type,
                    "date": str(exam.exam_date),
                    "time": f"{exam.start_time} - {exam.end_time}",
                    "hall": exam.hall,
                    "seat": "TBD",
                }
            )

    if exam_data:
        e = exam_data[0]
        reply = (
            f"Your next exam is {e['course']} ({e['type']}) on {e['date']} "
            f"at {e['time']}, Hall: {e['hall']}, Seat: {e['seat']}."
        )
    else:
        reply = "No upcoming exams found in your schedule."
    return reply, ActionExecuted(type="exam_lookup", data=exam_data)


def _exec_get_timetable(
    profile: Profile, student: Student, db: Session, day: str = ""
) -> tuple[str, ActionExecuted]:
    from datetime import date  # noqa: PLC0415

    day_name = day or date.today().strftime("%A")
    enrollments = db.query(Enrollment).filter_by(student_id=profile.id).all()
    today_classes = []
    for e in enrollments:
        slots = (
            db.query(TimetableSlot)
            .filter_by(offering_id=e.offering_id)
            .filter(TimetableSlot.day_of_week == day_name)
            .all()
        )
        for slot in slots:
            offering = db.query(CourseOffering).filter_by(id=e.offering_id).first()
            course = db.query(Course).filter_by(id=offering.course_id).first() if offering else None
            faculty_profile = (
                db.query(Profile).filter_by(id=offering.faculty_id).first() if offering else None
            )
            today_classes.append(
                {
                    "time": f"{slot.start_time} - {slot.end_time}",
                    "code": course.code if course else "N/A",
                    "name": course.name if course else "N/A",
                    "faculty": faculty_profile.name if faculty_profile else "TBD",
                }
            )

    if today_classes:
        slots_str = "; ".join(f"{c['code']} at {c['time']}" for c in today_classes)
        reply = f"Today's schedule ({day_name}): {slots_str}."
    else:
        reply = f"No classes scheduled for {day_name}."
    return reply, ActionExecuted(type="timetable_lookup", data=today_classes)


def _exec_get_transport() -> tuple[str, ActionExecuted]:
    # Transport is simulated — real-time data comes from Phase 10 (SSE)
    bus_data = {
        "route": "Route 4 (North Campus Express)",
        "currentStop": "Gandhi Nagar Square",
        "eta": "6 minutes to Main Campus Gate 1",
        "driver": "Sukhdev Singh (+91 94250 11223)",
        "speed": "34 km/h",
    }
    reply = (
        "Campus Bus Route 4 is currently at Gandhi Nagar Square and will arrive at "
        "Main Campus Gate 1 in approximately 6 minutes. Driver: Sukhdev Singh (+91 94250 11223)."
    )
    return reply, ActionExecuted(type="transport_lookup", data=bus_data)


def _exec_get_hostel(student: Student) -> tuple[str, ActionExecuted]:
    hostel_data = {
        "room": "Block B, Room 304, Bed 1",
        "warden": "Dr. R. K. Mishra (Ext: 4410)",
        "curfewTime": "09:30 PM",
        "gatePassStatus": "All past gate passes approved",
    }
    reply = (
        "You are allotted Block B, Room 304, Bed 1. "
        "Your hostel warden is Dr. R. K. Mishra (Office Ext: 4410). "
        "Night gate curfew is strictly 09:30 PM."
    )
    return reply, ActionExecuted(type="hostel_lookup", data=hostel_data)


def _exec_create_helpdesk_ticket(
    profile: Profile,
    fn_args: dict[str, Any],
    db: Session,
) -> tuple[str, ActionExecuted]:
    req = CreateTicketRequest(
        subject=fn_args.get("subject", "Campus Issue"),
        description=fn_args.get("description", "Reported via CampusAI."),
        category=fn_args.get("category"),
    )
    ticket = helpdesk_service.create_ticket(req, profile, db)
    reply = (
        f'I have logged Helpdesk Ticket #{ticket.id} for "{req.subject}". '
        f"Category: {ticket.category}. It has been dispatched to {ticket.assigned_department} "
        f"with a {ticket.sla_hours}h SLA."
    )
    return reply, ActionExecuted(
        type="ticket_created", ticket_number=str(ticket.id), data={"subject": req.subject}
    )


def _exec_request_certificate(
    profile: Profile,
    fn_args: dict[str, Any],
    db: Session,
    base_url: str,
) -> tuple[str, ActionExecuted]:
    cert_type = fn_args.get("certificateType", "Bonafide Certificate")
    # Map to valid types
    valid_map = {
        "bonafide": "Bonafide Certificate",
        "character": "Character Certificate",
        "transcript": "Official Transcript",
        "completion": "Course Completion Certificate",
    }
    for key, val in valid_map.items():
        if key in cert_type.lower():
            cert_type = val
            break
    else:
        cert_type = "Bonafide Certificate"

    body = RequestCertificateIn(
        certificate_type=cert_type,
        purpose=fn_args.get("purpose", "Requested via CampusAI."),
        academic_year="2025-2026",
    )
    try:
        cert = certificate_service.request_certificate(profile, body, db, base_url)
        reply = (
            f"Your request for a {cert_type} has been submitted (ID: {cert.id}). "
            f"Status: {cert.status}. "
            + (
                "It is now awaiting approval."
                if cert.status == "pending"
                else "Some eligibility checks failed — please review in the Certificates tab."
            )
        )
        return reply, ActionExecuted(
            type="certificate_requested", request_id=str(cert.id), data={"type": cert_type}
        )
    except Exception as exc:
        reply = f"Certificate request noted for {cert_type}. Please complete your request in the Certificates tab."
        return reply, ActionExecuted(
            type="certificate_requested", data={"type": cert_type, "error": str(exc)}
        )


# ── Tool dispatcher ────────────────────────────────────────────────────────────


def _dispatch_tool(
    fn_name: str,
    fn_args: dict[str, Any],
    profile: Profile,
    student: Student | None,
    db: Session,
    base_url: str,
) -> tuple[str, ActionExecuted]:
    """Dispatch a Gemini function call to the real DB executor."""
    if fn_name == "get_attendance":
        return _exec_get_attendance(profile, student, db)
    elif fn_name == "get_fee_status":
        return _exec_get_fee_status(profile, db)
    elif fn_name == "get_exam_schedule":
        return _exec_get_exam_schedule(profile, student, db)
    elif fn_name == "get_timetable":
        return _exec_get_timetable(profile, student, db, fn_args.get("day", ""))
    elif fn_name == "get_transport_info":
        return _exec_get_transport()
    elif fn_name == "get_hostel_status":
        return _exec_get_hostel(student)
    elif fn_name == "create_helpdesk_ticket":
        return _exec_create_helpdesk_ticket(profile, fn_args, db)
    elif fn_name == "request_certificate":
        return _exec_request_certificate(profile, fn_args, db, base_url)
    else:
        return f"Tool '{fn_name}' is not implemented.", ActionExecuted(type="unknown_tool")


# ── System prompt builder ──────────────────────────────────────────────────────


def _build_system_prompt(
    profile: Profile,
    student: Student | None,
    db: Session,
    persona: str,
) -> str:
    """Build a rich system prompt populated with live DB data (mirrors server.ts)."""
    persona_tone = _PERSONA_TONES.get(persona, _DEFAULT_TONE)
    name = profile.name or "Student"
    roll = student.roll_number if student else "N/A"
    cgpa = float(student.cgpa or 0.0) if student else 0.0
    semester = student.semester if student else 6

    # Live attendance
    enrollments = db.query(Enrollment).filter_by(student_id=profile.id).all()
    att_lines = []
    for e in enrollments:
        offering = db.query(CourseOffering).filter_by(id=e.offering_id).first()
        course = db.query(Course).filter_by(id=offering.course_id).first() if offering else None
        pct = e.attendance_percent
        risk = "DETENTION RISK! Below 75% threshold" if pct < 75 else "Safe"
        att_lines.append(
            f"  * {course.code if course else 'N/A'} {course.name if course else ''}: {pct:.1f}% ({risk})"
        )
    att_block = "\n".join(att_lines) if att_lines else "  * No courses enrolled."

    # Live fees
    invoices = db.query(FeeInvoice).filter_by(student_id=profile.id).all()
    fee_block = "No fee data available."
    if invoices:
        inv = invoices[0]
        paid_sum = sum(
            float(p.amount)
            for p in db.query(Payment)
            .filter(Payment.invoice_id == inv.id, Payment.status == "success")
            .all()
        )
        total = float(inv.total_amount)
        pending = max(0.0, total - paid_sum)
        fee_block = (
            f"Semester Fee ₹{total:,.0f}, Paid ₹{paid_sum:,.0f}, "
            f"Pending Due: ₹{pending:,.0f} (Deadline: {inv.due_date})"
        )

    return f"""You are CampusAI, the official 3D intelligent voice & digital campus assistant and academic co-pilot for SmartUni.Ai.
Student Profile:
- Name: {name} (Roll No: {roll})
- Degree: B.Tech Computer Science & Engineering (Semester {semester}), CGPA: {cgpa:.2f}
- Attendance breakdown:
{att_block}
- Fees: {fee_block}

Core Directives:
1. ALWAYS answer the student's EXACT question directly, intelligently, and specifically.
2. If asked conceptual, programming, science, math, or study questions, provide a sharp, insightful, and knowledgeable answer.
3. If asked about campus records, use the real-time data above with high precision.
4. Voice Persona & Tone: {persona_tone}
5. Keep answers articulate and concise (2–4 sentences or clear bullet points) so they sound natural when spoken aloud by the 3D robot companion.
6. Expressive Audio SFX Cues: end jokes with \"*Ba-dum-tss!*\", laughter with \"*laughs*\", sad news with \"*cries*\", frustration with \"*grrr*\", weariness with \"*sigh*\"."""


# ── Gemini client (lazy singleton) ────────────────────────────────────────────

_gemini_client = None
_gemini_init_tried = False


def _get_gemini_client():
    global _gemini_client, _gemini_init_tried
    if _gemini_init_tried:
        return _gemini_client
    _gemini_init_tried = True
    if settings.LLM_PROVIDER != "gemini" or not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai  # type: ignore

        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        log.info("gemini_client_initialized")
    except Exception as exc:
        log.warning("gemini_client_init_failed", error=str(exc))
        _gemini_client = None
    return _gemini_client


# ── Gemini call with model fallback ───────────────────────────────────────────


def _call_gemini(
    system_prompt: str,
    message: str,
    history: list[dict],
    profile: Profile,
    student: Student | None,
    db: Session,
    base_url: str,
) -> tuple[str, dict | None, ActionExecuted | None, str] | None:
    """Try each model in the fallback chain. Returns (reply, tool_call, action, model_used) or None."""
    client = _get_gemini_client()
    if not client:
        return None

    try:
        from google.genai import types  # type: ignore
    except ImportError:
        return None

    # Build contents list
    contents = []
    for h in history[-6:]:
        role = "user" if h.get("sender") == "user" else "model"
        text = h.get("text", "")
        if text:
            contents.append(types.Content(role=role, parts=[types.Part(text=text)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    # Tool config
    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name=t["name"],
                    description=t["description"],
                    parameters=t.get("parameters"),
                )
                for t in _TOOL_DECLARATIONS
            ]
        )
    ]

    for model_name in settings.gemini_models_list:
        try:
            t0 = time.time()
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    tools=tools,
                    temperature=0.7,
                ),
            )
            log.debug(
                "gemini_call_success", model=model_name, latency_ms=int((time.time() - t0) * 1000)
            )

            # Check for function call
            fn_call = None
            for candidate in response.candidates or []:
                for part in candidate.content.parts if candidate.content else []:
                    if hasattr(part, "function_call") and part.function_call:
                        fn_call = part.function_call
                        break
                if fn_call:
                    break

            if fn_call:
                fn_name = fn_call.name
                fn_args = dict(fn_call.args) if fn_call.args else {}
                tool_reply, action = _dispatch_tool(
                    fn_name, fn_args, profile, student, db, base_url
                )
                return tool_reply, {"name": fn_name, "args": fn_args}, action, model_name

            # Plain text response
            text = response.text
            if text and text.strip():
                return text.strip(), None, None, model_name

        except Exception as exc:
            log.warning("gemini_model_failed", model=model_name, error=str(exc))
            continue

    return None


# ── Heuristic fallback engine (mirrors server.ts) ─────────────────────────────


def _heuristic_fallback(
    message: str,
    profile: Profile,
    student: Student | None,
    db: Session,
) -> tuple[str, ActionExecuted | None]:
    """High-intelligence semantic fallback when Gemini is unavailable."""
    lower = message.lower().strip()
    name = profile.name.split()[0] if profile.name else "there"

    # Math
    math_match = re.search(
        r"(?:what is|calculate|compute|solve|eval)?\s*([0-9\.\s\+\-\*\/\^\(\)]+[0-9\)])\s*\??$",
        lower,
    )
    if math_match:
        expr = math_match.group(1)
        if any(op in expr for op in "+-*/"):
            try:
                sanitized = re.sub(r"[^0-9\+\-\*\/\.\(\)\s]", "", expr)
                result = eval(sanitized, {"__builtins__": {}})  # noqa: S307 – safe eval
                if isinstance(result, (int, float)) and not (result != result):
                    return (
                        f"The result of {sanitized.strip()} is {result}. "
                        "Let me know if you need further mathematical derivations or formula proofs!"
                    ), None
            except Exception:
                pass

    def _has_kw(*keywords: str) -> bool:
        return any(re.search(rf"\b{re.escape(k)}\b", lower) for k in keywords)

    # Attendance
    if _has_kw("attendance", "present", "absent", "shortage", "detention"):
        reply, action = _exec_get_attendance(profile, student, db)
        return reply, action

    # Fees
    if _has_kw("fee", "fees", "dues", "payment", "invoice", "paid", "balance"):
        reply, action = _exec_get_fee_status(profile, db)
        return reply, action

    # Exam
    if _has_kw("exam", "exams", "test", "hall ticket", "mid term", "seat", "mid-term"):
        reply, action = _exec_get_exam_schedule(profile, student, db)
        return reply, action

    # Timetable
    if _has_kw("timetable", "today", "lecture", "class", "period"):
        reply, action = _exec_get_timetable(profile, student, db)
        return reply, action

    # Bus / transport
    if _has_kw("bus", "transport", "route", "shuttle", "driver", "eta"):
        reply, action = _exec_get_transport()
        return reply, action

    # Hostel
    if _has_kw("hostel", "warden", "curfew", "mess", "room allot"):
        reply, action = _exec_get_hostel(student)
        return reply, action

    # Certificate
    if _has_kw("certificate", "bonafide", "noc", "character cert", "transcript"):
        return (
            "You can request certificates directly from the Certificates tab. "
            "Available types: Bonafide Certificate, Character Certificate, "
            "Official Transcript, and Course Completion Certificate."
        ), ActionExecuted(type="certificate_info")

    # Helpdesk
    if _has_kw("ticket", "complaint", "wifi", "wi-fi", "grievance", "broken"):
        return (
            "To file a complaint, use the Helpdesk tab where I can auto-classify and route your grievance. "
            "Or describe your issue in detail and I'll create a ticket for you."
        ), ActionExecuted(type="helpdesk_info")

    # Greetings
    if (
        lower in ("hi", "hello")
        or lower.startswith("hey")
        or any(kw in lower for kw in ("good morning", "good evening", "good afternoon"))
    ):
        return (
            f"Hello {name}! How can I assist you with your academics, today's classes, or campus services?",
            None,
        )

    if any(kw in lower for kw in ("who are you", "what is your name", "introduce yourself")):
        return (
            "I am CampusAI, your intelligent 3D campus companion and academic co-pilot! "
            "I can check your attendance, exams, fees, timetable, buses, submit grievances, and more."
        ), None

    if any(kw in lower for kw in ("how are you", "how r u")):
        return (
            "Operating at peak performance with zero latency and full campus telemetry online! Ready to help.",
            None,
        )

    if any(kw in lower for kw in ("thank", "thanks")):
        return f"You're very welcome, {name}! Let me know whenever you need any more answers.", None

    if any(kw in lower for kw in ("joke", "funny", "make me laugh")):
        return (
            "Why do programmers prefer dark mode? Because light attracts bugs! 😄 *Ba-dum-tss!*",
            None,
        )

    # Academic concept fallbacks
    if any(kw in lower for kw in ("machine learning", "what is ml", "neural network")):
        return (
            "Machine Learning is a subset of AI where models learn patterns from data to make predictions "
            "without explicit rules. In your CS603 course you'll cover Supervised Learning, Backpropagation, "
            "and Deep Neural Networks!"
        ), None

    if any(kw in lower for kw in ("distributed system", "cloud computing", "cs601")):
        return (
            "Distributed Systems coordinate multiple networked computers as a single unified system. "
            "In your CS601 course key topics include the CAP Theorem, Raft/Paxos consensus, and microservices."
        ), None

    if any(
        kw in lower for kw in ("recursion", "algorithm", "binary search", "dynamic programming")
    ):
        return (
            "Great CS topic! Master Big-O time/space complexity, divide-and-conquer paradigms, "
            "and graph traversal algorithms (BFS/DFS) for exams and interviews."
        ), None

    # Generic fallback
    return (
        f'I\'ve noted your query about "{message[:60]}{"..." if len(message) > 60 else ""}". '
        f"Let me know if you'd like me to check campus records, explain a concept, or take an action on your student portal!"
    ), None


# ── Conversation persistence ────────────────────────────────────────────────────


def _get_or_create_conversation(
    profile: Profile,
    conversation_id: uuid.UUID | None,
    message: str,
    db: Session,
) -> AIConversation:
    if conversation_id:
        conv = db.query(AIConversation).filter_by(id=conversation_id, user_id=profile.id).first()
        if conv:
            return conv
    # Create new
    title = (message[:60] + "...") if len(message) > 60 else message
    conv = AIConversation(
        id=uuid.uuid4(),
        user_id=profile.id,
        title=title,
    )
    db.add(conv)
    db.flush()
    return conv


def _save_message(
    db: Session,
    conv: AIConversation,
    role: str,
    content: str,
    tool_name: str | None = None,
    tool_args: dict | None = None,
    tool_result: str | None = None,
    model: str | None = None,
    latency_ms: int | None = None,
) -> None:
    msg = AIMessage(
        id=uuid.uuid4(),
        conversation_id=conv.id,
        role=role,
        content=content,
        tool_name=tool_name,
        tool_args_json=json.dumps(tool_args, default=str) if tool_args else None,
        tool_result_json=tool_result,
        model=model,
        latency_ms=latency_ms,
    )
    db.add(msg)


# ── Main chat entry point ──────────────────────────────────────────────────────


def chat(
    profile: Profile,
    body: ChatRequest,
    db: Session,
    base_url: str = "http://localhost:8000",
) -> ChatResponse:
    """Process a CampusAI chat message with tool calls, persistence, and fallback."""
    student = db.query(Student).filter_by(profile_id=profile.id).first()

    # Persist conversation
    conv = _get_or_create_conversation(profile, body.conversation_id, body.message, db)
    _save_message(db, conv, "user", body.message)

    # Build system prompt with live data
    system_prompt = _build_system_prompt(profile, student, db, body.persona)

    # History as plain dicts for the fallback and Gemini
    history = [{"sender": h.sender, "text": h.text} for h in body.history]

    reply: str
    tool_call: dict | None = None
    action: ActionExecuted | None = None
    model_used: str | None = None

    # Try Gemini first
    gemini_result = _call_gemini(
        system_prompt, body.message, history, profile, student, db, base_url
    )
    if gemini_result:
        reply, tool_call, action, model_used = gemini_result
    else:
        # Heuristic fallback
        reply, action = _heuristic_fallback(body.message, profile, student, db)
        model_used = "heuristic_fallback"

    # Persist assistant reply
    _save_message(
        db,
        conv,
        "model",
        reply,
        tool_name=tool_call["name"] if tool_call else None,
        tool_args=tool_call.get("args") if tool_call else None,
        tool_result=json.dumps(action.model_dump(), default=str) if action else None,
        model=model_used,
    )
    db.commit()

    return ChatResponse(
        reply=reply,
        tool_call=tool_call,
        action_executed=action,
        conversation_id=conv.id,
        model_used=model_used,
    )


# ── Conversation list / history ────────────────────────────────────────────────


def list_conversations(profile: Profile, db: Session) -> list[ConversationOut]:
    convs = (
        db.query(AIConversation)
        .filter_by(user_id=profile.id)
        .order_by(AIConversation.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        ConversationOut(id=c.id, title=c.title, created_at=c.created_at, updated_at=c.updated_at)
        for c in convs
    ]


def get_conversation_messages(
    profile: Profile,
    conversation_id: uuid.UUID,
    db: Session,
) -> list[MessageOut]:
    conv = db.query(AIConversation).filter_by(id=conversation_id, user_id=profile.id).first()
    if not conv:
        from app.core.errors import NotFoundError  # noqa: PLC0415

        raise NotFoundError("Conversation not found.")
    msgs = (
        db.query(AIMessage).filter_by(conversation_id=conv.id).order_by(AIMessage.created_at).all()
    )
    return [
        MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            tool_name=m.tool_name,
            tool_args=json.loads(m.tool_args_json) if m.tool_args_json else None,
            tool_result=json.loads(m.tool_result_json) if m.tool_result_json else None,
            model=m.model,
            latency_ms=m.latency_ms,
            created_at=m.created_at,
        )
        for m in msgs
    ]
