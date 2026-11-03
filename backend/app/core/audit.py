"""Audit log service.

Every significant write action (role changes, approvals, payments, attendance
overrides, etc.) must produce an audit row via log_action().

The audit_logs table is effectively append-only: the Postgres role used by the
API has no UPDATE or DELETE privileges on it.
"""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.logging import get_logger

log = get_logger(__name__)


def log_action(
    db: Session,
    *,
    actor_id: str,
    actor_role: str,
    action: str,
    target_entity: str,
    entity_id: str,
    details: str,
    ip_address: str = "unknown",
) -> None:
    """Write an audit log row.

    This is a thin wrapper to isolate the audit model import and keep callers
    clean. The row is flushed to the DB within the caller's transaction.
    """
    from app.models.platform import AuditLog  # noqa: PLC0415

    row = AuditLog(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        target_entity=target_entity,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.now(UTC),
    )
    db.add(row)
    log.info(
        "audit",
        action=action,
        actor=actor_id,
        entity=target_entity,
        entity_id=entity_id,
    )
