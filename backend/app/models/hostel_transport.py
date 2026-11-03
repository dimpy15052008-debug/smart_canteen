"""Hostel and transport domain models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKey


class Hostel(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "hostels"
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    warden_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    warden_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    curfew_time: Mapped[str | None] = mapped_column(String(10), nullable=True)


class HostelRoom(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "hostel_rooms"
    hostel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hostels.id"), nullable=False, index=True
    )
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    bed_label: Mapped[str | None] = mapped_column(String(10), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=2)


class HostelAllocation(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "hostel_allocations"
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hostel_rooms.id"), nullable=False, index=True
    )
    academic_year: Mapped[str] = mapped_column(String(20), default="2025-2026", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="allocated", nullable=False)


class GatePass(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "gate_passes"
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="approved", nullable=False)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True
    )


class BusRoute(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "bus_routes"
    route_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    route_name: Mapped[str] = mapped_column(String(300), nullable=False)


class BusStop(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "bus_stops"
    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bus_routes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    scheduled_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    stop_order: Mapped[int] = mapped_column(Integer, nullable=False)


class Bus(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "buses"
    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bus_routes.id"), nullable=False, index=True
    )
    driver_name: Mapped[str] = mapped_column(String(200), nullable=False)
    driver_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    vehicle_number: Mapped[str] = mapped_column(String(30), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=48)


class BusPosition(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "bus_positions"
    bus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buses.id"), nullable=False, index=True
    )
    lat: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    lng: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    speed_kmh: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    occupied_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_stop_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bus_stops.id"), nullable=True
    )
    next_stop_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bus_stops.id"), nullable=True
    )
    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
