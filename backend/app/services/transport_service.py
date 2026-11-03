"""Transport service: live bus route telemetry and stop management."""

from __future__ import annotations

import random
import uuid

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.logging import get_logger
from app.models.hostel_transport import Bus, BusPosition, BusRoute, BusStop
from app.schemas.platform import BusCoordinatesOut, BusRouteOut, BusStopOut

log = get_logger(__name__)


def _build_route_out(
    route: BusRoute,
    bus: Bus | None,
    pos: BusPosition | None,
    stops: list[BusStop],
) -> BusRouteOut:
    """Assemble BusRouteOut from ORM objects."""
    current_stop_name = ""
    next_stop_name = ""

    stop_by_id = {s.id: s for s in stops}

    if pos and pos.current_stop_id:
        s = stop_by_id.get(pos.current_stop_id)
        current_stop_name = s.name if s else ""
    if pos and pos.next_stop_id:
        s = stop_by_id.get(pos.next_stop_id)
        next_stop_name = s.name if s else ""

    # Build stops list — mark passed if order <= current stop order
    current_order = 0
    if pos and pos.current_stop_id:
        cs = stop_by_id.get(pos.current_stop_id)
        if cs:
            current_order = cs.stop_order

    stops_out = [
        BusStopOut(
            name=s.name,
            time=s.scheduled_time or "",
            passed=(s.stop_order <= current_order),
        )
        for s in sorted(stops, key=lambda x: x.stop_order)
    ]

    return BusRouteOut(
        id=str(route.id),
        route_number=route.route_number,
        route_name=route.route_name,
        driver_name=bus.driver_name if bus else "",
        driver_phone=bus.driver_phone if bus else "",
        vehicle_number=bus.vehicle_number if bus else "",
        current_stop=current_stop_name,
        next_stop=next_stop_name,
        eta_minutes=pos.eta_minutes if (pos and pos.eta_minutes is not None) else 0,
        capacity=bus.capacity if bus else 0,
        occupied_seats=pos.occupied_seats if pos else 0,
        speed_km_h=float(pos.speed_kmh) if pos else 0.0,
        stops=stops_out,
        coordinates=BusCoordinatesOut(
            lat=float(pos.lat) if pos else 0.0,
            lng=float(pos.lng) if pos else 0.0,
        ),
    )


def _load_route(route_id: uuid.UUID, db: Session):
    """Load route with bus, position, and stops. Returns (route, bus, pos, stops)."""
    route = db.query(BusRoute).filter(BusRoute.id == route_id).first()
    if not route:
        raise NotFoundError("Bus route not found.")
    bus = db.query(Bus).filter(Bus.route_id == route.id).first()
    pos = None
    if bus:
        pos = db.query(BusPosition).filter(BusPosition.bus_id == bus.id).first()
    stops = db.query(BusStop).filter(BusStop.route_id == route.id).all()
    return route, bus, pos, stops


def list_bus_routes(db: Session) -> list[BusRouteOut]:
    """Return all bus routes with live telemetry."""
    routes = db.query(BusRoute).order_by(BusRoute.route_number).all()
    results = []
    for route in routes:
        bus = db.query(Bus).filter(Bus.route_id == route.id).first()
        pos = None
        if bus:
            pos = db.query(BusPosition).filter(BusPosition.bus_id == bus.id).first()
        stops = db.query(BusStop).filter(BusStop.route_id == route.id).all()
        results.append(_build_route_out(route, bus, pos, stops))
    return results


def get_bus_route(route_id: str, db: Session) -> BusRouteOut:
    """Return a single bus route by ID."""
    try:
        rid = uuid.UUID(route_id)
    except ValueError:
        raise NotFoundError("Bus route not found.") from None
    route, bus, pos, stops = _load_route(rid, db)
    return _build_route_out(route, bus, pos, stops)


def simulate_telemetry_step(route_id: str, db: Session) -> BusRouteOut:
    """Apply a subtle GPS/speed jitter to simulate real-time telemetry movement."""
    try:
        rid = uuid.UUID(route_id)
    except ValueError:
        raise NotFoundError("Bus route not found.") from None

    route, bus, pos, stops = _load_route(rid, db)

    if pos:
        # Apply subtle jitter: ±0.0005 degrees lat/lng, ±2 km/h speed
        jitter_lat = random.uniform(-0.0005, 0.0005)
        jitter_lng = random.uniform(-0.0005, 0.0005)
        jitter_speed = random.uniform(-2.0, 2.0)

        new_lat = float(pos.lat) + jitter_lat
        new_lng = float(pos.lng) + jitter_lng
        new_speed = max(0.0, float(pos.speed_kmh) + jitter_speed)

        # Tick down eta by 1 each call (min 1 minute)
        new_eta = max(1, (pos.eta_minutes or 5) - 1)

        from sqlalchemy import update  # noqa: PLC0415

        db.execute(
            update(BusPosition)
            .where(BusPosition.id == pos.id)
            .values(
                lat=round(new_lat, 7),
                lng=round(new_lng, 7),
                speed_kmh=round(new_speed, 1),
                eta_minutes=new_eta,
            )
        )
        db.flush()
        # Refresh pos object
        db.expire(pos)

    route, bus, pos, stops = _load_route(rid, db)
    log.info("telemetry_step", route_id=str(rid))
    return _build_route_out(route, bus, pos, stops)
