"""Admin Analytics schemas: KPIs, departmental attendance, grievance distribution, audit trail."""

from __future__ import annotations

from app.schemas.base import CamelModel


class DeptAttendanceOut(CamelModel):
    """Per-department attendance benchmark row."""

    department: str
    attendance_pct: float
    student_count: int


class GrievanceCategoryOut(CamelModel):
    """Helpdesk ticket category count."""

    category: str
    count: int
    share_pct: float


class AnalyticsKpiOut(CamelModel):
    """Top-level KPI card data for the admin dashboard."""

    campus_overall_attendance_pct: float
    canteen_daily_order_count: int
    grievance_sla_compliance_pct: float
    certificates_issued: int
    active_students: int
    open_tickets: int
    avg_resolution_hours: float


class AuditLogOut(CamelModel):
    """Audit log entry matching frontend AuditLog contract."""

    id: str
    action: str
    performed_by: str
    role: str
    target_entity: str
    entity_id: str
    details: str
    timestamp: str
    ip_address: str


class AdminAnalyticsOut(CamelModel):
    """Full admin analytics response payload."""

    kpis: AnalyticsKpiOut
    departmental_attendance: list[DeptAttendanceOut]
    grievance_breakdown: list[GrievanceCategoryOut]
    recent_audit_logs: list[AuditLogOut]
