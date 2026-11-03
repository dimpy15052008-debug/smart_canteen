"""AI domain models: AIConversation, AIMessage, AIPrediction, Intervention, LearningResource, Recommendation."""

from __future__ import annotations

import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class AIConversation(Base, UUIDPrimaryKey, TimestampMixin):
    """Chat session for CampusAI assistant."""

    __tablename__ = "ai_conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="New Conversation", nullable=False)

    messages: Mapped[list[AIMessage]] = relationship(back_populates="conversation")


class AIMessage(Base, UUIDPrimaryKey, TimestampMixin):
    """Single message in an AI conversation with tool call tracking."""

    __tablename__ = "ai_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_conversations.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    # user, model, system, tool
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tool_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tool_args_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    tool_result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    conversation: Mapped[AIConversation] = relationship(back_populates="messages")


class AIPrediction(Base, UUIDPrimaryKey, TimestampMixin):
    """ML early warning prediction for a student."""

    __tablename__ = "ai_predictions"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    # Low, Medium, High, Critical
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    factors_json: Mapped[str] = mapped_column(Text, nullable=False)


class Intervention(Base, UUIDPrimaryKey, TimestampMixin):
    """Faculty / counselor intervention created from an AI risk prediction."""

    __tablename__ = "interventions"

    prediction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_predictions.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False)
    # Pending, In Progress, Resolved
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False
    )


class LearningResource(Base, UUIDPrimaryKey, TimestampMixin):
    """Curated learning resource for student recommendation."""

    __tablename__ = "learning_resources"

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    tags: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(30), default="Intermediate", nullable=False)


class Recommendation(Base, UUIDPrimaryKey, TimestampMixin):
    """Personalized learning recommendation for a student."""

    __tablename__ = "recommendations"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("learning_resources.id"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Active", nullable=False)

    resource: Mapped[LearningResource] = relationship()
