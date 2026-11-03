"""ML Early Warning schemas: academic signals, risk factors, early warning predictions,
interventions, learning resources, and recommendations.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class AcademicFeatures(CamelModel):
    """Academic signals used exclusively for early warning risk prediction.
    Strictly excludes demographic or protected attributes (ML Ethics compliance).
    """

    attendance_percent: float = Field(
        ..., description="Overall attendance percentage across enrolled courses"
    )
    attendance_trend_30d: float = Field(
        ..., description="Percentage point difference in 30-day attendance trend"
    )
    marks_average: float = Field(
        ..., description="Average percentage marks across assessments and exams"
    )
    marks_trend: float = Field(
        ..., description="Percentage point difference between recent vs older assessment scores"
    )
    assignment_submission_rate: float = Field(
        ..., description="Ratio of submitted coursework vs total course assessments (0.0 - 1.0)"
    )
    recent_activity_count: int = Field(
        ..., description="Interactions and campus activities logged in past 14 days"
    )


class RiskFactorOut(CamelModel):
    """Specific explainable risk factor identified by the early warning system."""

    factor: str
    severity: str = Field(..., description="Low, Medium, High, or Critical")
    description: str


class EarlyWarningPredictionOut(CamelModel):
    """Comprehensive ML risk assessment for a student."""

    id: UUID
    student_id: UUID
    student_name: str | None = None
    roll_number: str | None = None
    department: str | None = None
    model_version: str
    risk_level: str = Field(..., description="Low, Medium, High, or Critical")
    probability: float = Field(..., description="Risk probability score between 0.0 and 1.0")
    factors: list[RiskFactorOut] = Field(default_factory=list)
    academic_signals: AcademicFeatures
    is_support_signal_only: bool = Field(
        default=True,
        description="ML Ethics: marks this output as a support signal, never an automated institutional decision.",
    )
    disclaimer: str = Field(
        default="Support signal, not an automated decision. Human faculty/counselor review is required before taking any institutional action.",
        description="Institutional ethics disclaimer",
    )
    created_at: Any


class AtRiskStudentSummaryOut(CamelModel):
    """Summary card for faculty/admin monitoring dashboard."""

    student_id: UUID
    student_name: str
    roll_number: str
    department: str
    semester: int
    risk_level: str
    probability: float
    top_risk_factor: str
    has_active_intervention: bool
    evaluated_at: Any


class BatchEvaluationResultOut(CamelModel):
    """Result of batch running the early warning model over student cohort."""

    evaluated_count: int
    at_risk_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int


class CreateInterventionIn(CamelModel):
    """Faculty or counselor request to create an academic/wellbeing intervention."""

    prediction_id: UUID
    notes: str = Field(
        ..., min_length=5, max_length=2000, description="Intervention action plan and notes"
    )


class UpdateInterventionIn(CamelModel):
    """Update status or append notes to an existing intervention."""

    status: str = Field(..., pattern="^(Pending|In Progress|Resolved)$")
    notes: str | None = Field(None, max_length=2000)


class InterventionOut(CamelModel):
    """Details of an academic support intervention."""

    id: UUID
    prediction_id: UUID
    student_id: UUID
    student_name: str
    roll_number: str | None = None
    status: str
    notes: str
    owner_id: UUID
    owner_name: str
    risk_level: str
    created_at: Any
    updated_at: Any


class LearningResourceOut(CamelModel):
    """Curated learning resource for academic remediation."""

    id: UUID
    title: str
    url: str
    tags: str
    difficulty: str


class RecommendationOut(CamelModel):
    """Personalized learning recommendation for a student."""

    id: UUID
    student_id: UUID
    resource: LearningResourceOut
    reason: str
    status: str
    created_at: Any


class CreateRecommendationIn(CamelModel):
    """Faculty or counselor adding a custom learning recommendation."""

    student_id: UUID
    resource_id: UUID
    reason: str = Field(..., min_length=5, max_length=1000)
