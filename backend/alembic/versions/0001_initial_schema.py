"""Initial database schema migration for SmartUni.Ai.

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-29

Creates all 45 domain tables across Identity, Academics, Attendance, Assessment,
Fees, Canteen, Certificates, Helpdesk, Hostel, Transport, Platform, and AI.
"""

from __future__ import annotations

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.db.base import Base
import app.models  # Registers all models with Base.metadata

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
