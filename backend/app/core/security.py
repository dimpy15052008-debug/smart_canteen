"""JWT creation, verification, and password hashing utilities."""

from __future__ import annotations

import hmac
import time
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Argon2 context for password hashing
_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ── Password helpers ──────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────


def create_access_token(data: dict[str, Any], expires_in: int | None = None) -> str:
    """Create a signed HS256 JWT."""
    ttl = expires_in if expires_in is not None else settings.JWT_TTL_SECONDS
    payload = {**data, "exp": int(time.time()) + ttl}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify an HS256 JWT. Raises JWTError on failure."""
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )


# ── Constant-time comparison ──────────────────────────────────────────────────


def constant_time_equal(a: str, b: str) -> bool:
    """Timing-safe string comparison to prevent oracle attacks."""
    return hmac.compare_digest(a.encode(), b.encode())
