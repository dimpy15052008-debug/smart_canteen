"""APScheduler wrapper. Jobs are defined in separate modules and registered here.

IMPORTANT: Only run this in a single process. Do NOT enable when horizontally
scaling the API (set ENABLE_SCHEDULER=false in those replicas and run a
dedicated worker instead).
"""

from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger(__name__)

_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> None:
    global _scheduler
    _scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

    # Jobs registered in Phase 5+:
    # from app.jobs.sla_escalation import escalate_sla_breached_tickets
    # _scheduler.add_job(escalate_sla_breached_tickets, "interval", minutes=5, id="sla_escalation")

    if settings.TRANSPORT_SIMULATOR:
        pass  # from app.jobs.bus_simulator import simulate_bus_positions
        # _scheduler.add_job(simulate_bus_positions, "interval", seconds=5, id="bus_sim")

    _scheduler.start()
    log.info("scheduler_started", jobs=len(_scheduler.get_jobs()))


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        log.info("scheduler_stopped")
    _scheduler = None
