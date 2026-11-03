"""Legacy AI proxy endpoints — kept for frontend compatibility.

POST /api/ai/chat            — now proxies to the real CampusAI service (Phase 7).
POST /api/ai/classify-ticket — heuristic classifier (Phase 5 helpdesk uses the proper service).

The legacy paths /api/ai/* are kept so the existing frontend works without
any URL changes during the migration period. The real endpoints are at /api/v1/ai/*.
"""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.core.config import settings

router = APIRouter(tags=["ai-legacy"])


@router.post("/api/ai/chat")
async def legacy_chat(request: Request):
    """
    Legacy chat endpoint — now proxies to the real CampusAI service.
    Uses AUTH_MODE=dev student profile in dev mode for seamless demo.
    Falls back to heuristic stub if no auth header is present.
    """
    body = await request.json()
    message = body.get("message", "")
    persona = body.get("persona", "default")
    history_raw = body.get("history", [])

    if not message:
        return {"reply": "Please send a message.", "toolCall": None, "actionExecuted": None}

    # In dev mode, attempt to use the real CampusAI service with the demo student profile
    if settings.AUTH_MODE == "dev" and settings.ENV != "production":
        try:
            from app.db.session import SessionLocal  # noqa: PLC0415
            from app.schemas.ai import ChatMessageIn, ChatRequest  # noqa: PLC0415
            from app.services import ai_service  # noqa: PLC0415
            from app.services.auth_service import DEMO_PROFILES, MockProfileObj  # noqa: PLC0415

            db = SessionLocal()
            try:
                demo_data = DEMO_PROFILES.get("student")
                if demo_data:
                    profile = MockProfileObj(demo_data)
                    history_items = [
                        ChatMessageIn(sender=h.get("sender", "user"), text=h.get("text", ""))
                        for h in history_raw
                        if h.get("text")
                    ]
                    chat_body = ChatRequest(
                        message=message,
                        history=history_items,
                        persona=persona,
                    )
                    result = ai_service.chat(profile=profile, body=chat_body, db=db)
                    return {
                        "reply": result.reply,
                        "toolCall": result.tool_call,
                        "actionExecuted": result.action_executed.model_dump()
                        if result.action_executed
                        else None,
                    }
            finally:
                db.close()
        except Exception:
            pass  # Fall through to stub

    # Stub fallback (no DB available or auth mismatch)
    return {
        "reply": (
            "SmartUni.Ai CampusAI is online! For full AI tool-calling with real campus data, "
            "please use the authenticated endpoint at /api/v1/ai/chat. 🎓"
        ),
        "toolCall": None,
        "actionExecuted": None,
    }


@router.post("/api/ai/classify-ticket")
async def legacy_classify_ticket(request: Request):
    """Legacy ticket classification endpoint — delegates to the real heuristic classifier."""
    body = await request.json()
    subject: str = body.get("subject", "")
    description: str = body.get("description", "")

    from app.services.helpdesk_service import classify_ticket  # noqa: PLC0415

    result = classify_ticket(subject, description)

    return {
        "category": result.category,
        "priority": result.priority,
        "sentiment": result.sentiment,
        "assignedDepartment": result.assigned_department,
        "slaHours": result.sla_hours,
        "summary": result.summary,
    }
