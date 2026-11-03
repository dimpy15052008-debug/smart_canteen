"""CampusAI schemas: chat request/response and conversation history."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class ChatMessageIn(CamelModel):
    """Single entry in conversation history sent by the client."""

    sender: str  # "user" | "assistant"
    text: str


class ChatRequest(CamelModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessageIn] = Field(default_factory=list)
    persona: str = Field(
        default="default",
        description="One of: default, cool_buddy, wise_prof, sparky, comedic",
    )
    conversation_id: UUID | None = Field(
        default=None,
        description="Pass an existing conversation ID to continue a persisted thread.",
    )


class ActionExecuted(CamelModel):
    type: str
    data: Any | None = None
    ticket_number: str | None = None
    request_id: str | None = None


class ChatResponse(CamelModel):
    reply: str
    tool_call: dict[str, Any] | None = None
    action_executed: ActionExecuted | None = None
    conversation_id: UUID | None = None
    model_used: str | None = None


class ConversationOut(CamelModel):
    id: UUID
    title: str
    created_at: Any
    updated_at: Any


class MessageOut(CamelModel):
    id: UUID
    role: str
    content: str
    tool_name: str | None = None
    tool_args: Any | None = None
    tool_result: Any | None = None
    model: str | None = None
    latency_ms: int | None = None
    created_at: Any
