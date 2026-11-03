"""Transport v1 router — live bus route telemetry and SSE stream.

Endpoints
---------
GET /api/v1/transport/routes        — list all bus routes with live telemetry
GET /api/v1/transport/routes/{id}   — get single route details
GET /api/v1/transport/stream        — SSE: server-sent events stream for live telemetry
"""

from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.deps import CurrentUser, DbDep
from app.db.session import SessionLocal
from app.schemas.platform import BusRouteOut
from app.services import transport_service

router = APIRouter(prefix="/api/v1/transport", tags=["transport"])


@router.get("/routes", response_model=list[BusRouteOut])
def list_routes(
    user: CurrentUser,
    db: DbDep,
):
    """Return all bus routes with their current telemetry."""
    return transport_service.list_bus_routes(db)


@router.get("/routes/{route_id}", response_model=BusRouteOut)
def get_route(
    route_id: str,
    user: CurrentUser,
    db: DbDep,
):
    """Return a single bus route by ID."""
    return transport_service.get_bus_route(route_id, db)


@router.get("/stream")
async def transport_sse_stream(
    user: CurrentUser,
    db: DbDep,
    interval: int = 5,
    max_events: int = 60,
):
    """Server-Sent Events stream: pushes live telemetry every `interval` seconds.

    Each event is a JSON object with all active bus routes. The stream runs until
    the client disconnects or max_events is reached.
    Pass max_events=1 and interval=0 for a quick test probe.
    """

    async def event_generator():
        tick = 0
        while tick < max_events:
            # Use a fresh DB session per tick to avoid long-lived transactions
            tick_db = SessionLocal()
            try:
                routes = transport_service.list_bus_routes(tick_db)
                payload = [r.model_dump() for r in routes]
                data = json.dumps(payload, default=str)
                yield f"data: {data}\n\n"
            except Exception:
                yield "data: {}\n\n"
            finally:
                tick_db.close()

            tick += 1
            if tick < max_events:
                await asyncio.sleep(interval)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
