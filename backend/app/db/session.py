"""SQLAlchemy engine and session factory.

Uses psycopg3 (psycopg) with a connection pool sized for the typical
FastAPI single-process deployment.  When using the Supabase transaction
pooler, callers should append ?prepare_threshold=0 to DATABASE_URL to
disable prepared statements.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.ENV == "development",
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        # Connection pool settings tuned for a single-process API
        pool_size=5,
        max_overflow=10,
        pool_timeout=10,  # Don't hang more than 10s waiting for a connection
        pool_pre_ping=True,  # Cheap liveness check before returning a connection
        connect_args={"connect_timeout": 5},  # psycopg3 connect timeout (seconds)
        echo=settings.ENV == "development",  # Log SQL only in dev
    )

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Avoids lazy-load after commit in async-adjacent code
)
