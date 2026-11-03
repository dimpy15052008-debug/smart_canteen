"""CampusAI v1 router — real tool-calling, conversation persistence, Gemini + fallback.

Endpoints
---------
POST /api/v1/ai/chat                              — main chat with tool execution
GET  /api/v1/ai/conversations                     — list user's conversations
GET  /api/v1/ai/conversations/{id}/messages       — retrieve message history
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Request

from app.core.deps import CurrentUser, DbDep
from app.schemas.ai import ChatRequest, ChatResponse, ConversationOut, MessageOut
from app.services import ai_service

router = APIRouter(prefix="/api/v1/ai", tags=["campus-ai"])


def _base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


@router.post("/chat", response_model=ChatResponse)
def campus_ai_chat(
    body: ChatRequest,
    request: Request,
    user: CurrentUser,
    db: DbDep,
):
    """
    CampusAI chat endpoint with Gemini tool-calling, DB tool execution,
    conversation persistence, and heuristic fallback.
    """
    return ai_service.chat(profile=user, body=body, db=db, base_url=_base_url(request))


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(user: CurrentUser, db: DbDep):
    """Return the user's 20 most recent AI conversations."""
    return ai_service.list_conversations(profile=user, db=db)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def get_conversation_messages(
    conversation_id: uuid.UUID,
    user: CurrentUser,
    db: DbDep,
):
    """Retrieve the full message history for a conversation."""
    return ai_service.get_conversation_messages(
        profile=user, conversation_id=conversation_id, db=db
    )
