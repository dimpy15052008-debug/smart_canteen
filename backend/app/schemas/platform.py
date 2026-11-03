"""Platform schemas: Notifications and Live Transport Telemetry."""

from __future__ import annotations

import uuid
from typing import Literal

from app.schemas.base import CamelModel


class NotificationOut(CamelModel):
    """Notification item matching frontend NotificationItem contract."""

    id: str
    title: str
    message: str
    type: Literal["attendance", "exam", "canteen", "certificate", "helpdesk", "system"]
    timestamp: str
    read: bool
    action_link: str | None = None


class CreateNotificationIn(CamelModel):
    """Internal schema for creating a notification."""

    user_id: uuid.UUID
    title: str
    message: str
    type: Literal["attendance", "exam", "canteen", "certificate", "helpdesk", "system"] = "system"
    action_link: str | None = None


class BusStopOut(CamelModel):
    """Single stop on a transit route."""

    name: str
    time: str
    passed: bool = False


class BusCoordinatesOut(CamelModel):
    """GPS coordinates."""

    lat: float
    lng: float


class BusRouteOut(CamelModel):
    """Real-time transit route matching frontend BusRoute contract."""

    id: str
    route_number: str
    route_name: str
    driver_name: str
    driver_phone: str
    vehicle_number: str
    current_stop: str
    next_stop: str
    eta_minutes: int
    capacity: int
    occupied_seats: int
    speed_km_h: float
    stops: list[BusStopOut]
    coordinates: BusCoordinatesOut
