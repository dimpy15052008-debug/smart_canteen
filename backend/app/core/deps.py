"""FastAPI dependency injectors.

Provides:
  - get_db: Yields a SQLAlchemy Session per-request with automatic commit/rollback.
  - get_current_user: Decodes the bearer token and returns the authenticated profile.
  - require_roles(*roles): Dependency factory for RBAC enforcement.
  - student_owns: Asserts the current user is the owner of a student resource.
"""

from __future__ import annotations

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import SessionLocal

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------


def get_db() -> Generator[Session, None, None]:
    """Yield a database session, auto-rolling back on exception."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


DbDep = Annotated[Session, Depends(get_db)]

# ---------------------------------------------------------------------------
# Bearer token extraction
# ---------------------------------------------------------------------------

_bearer = HTTPBearer(auto_error=False)


def _extract_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> str:
    if credentials is None or not credentials.credentials:
        raise UnauthorizedError("Missing or invalid Authorization header.")
    return credentials.credentials


# ---------------------------------------------------------------------------
# Current user
# ---------------------------------------------------------------------------


# Import here to avoid circular imports — models are resolved at call time.
def get_current_user(
    token: Annotated[str, Depends(_extract_token)],
    db: DbDep,
):
    """Decode the JWT and load the matching profile from the database.

    Returns a models.Profile instance. The profile.role is the authoritative
    role — never trust user_metadata from the token.
    """
    # Import inside function to break circular dep
    from app.models.identity import Profile  # noqa: PLC0415

    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise UnauthorizedError("Token is invalid or expired.") from exc

    profile_id: str | None = payload.get("sub")
    if not profile_id:
        raise UnauthorizedError("Token is missing subject claim.")

    profile = None
    try:
        import uuid as _uuid

        lookup_id = (
            _uuid.UUID(profile_id)
            if isinstance(profile_id, str) and len(profile_id) == 36
            else profile_id
        )
        profile = db.get(Profile, lookup_id)
    except Exception:
        profile = None

    if profile is not None:
        if not profile.active:
            raise UnauthorizedError("User account not found or deactivated.")
        return profile

    # In dev mode, fall back to in-memory demo profiles for seamless offline development
    if settings.AUTH_MODE == "dev" and settings.ENV != "production":
        from app.services.auth_service import DEMO_PROFILES, MockProfileObj  # noqa: PLC0415

        role = payload.get("role")
        # Check by id first
        matched = next((p for p in DEMO_PROFILES.values() if p["id"] == str(profile_id)), None)
        if not matched and role in DEMO_PROFILES:
            matched = DEMO_PROFILES[role]
        if matched:
            return MockProfileObj(matched)

    raise UnauthorizedError("User account not found or deactivated.")


CurrentUser = Annotated[object, Depends(get_current_user)]


# ---------------------------------------------------------------------------
# RBAC
# ---------------------------------------------------------------------------


def require_roles(*roles: str):
    """Return a FastAPI dependency that enforces the given set of roles."""

    def _check(user: CurrentUser) -> object:
        if user.role not in roles:
            raise ForbiddenError(
                f"Access denied. Required role(s): {', '.join(roles)}. Your role: {user.role}."
            )
        return user

    return Depends(_check)


# ---------------------------------------------------------------------------
# Ownership helpers
# ---------------------------------------------------------------------------


def student_owns(student_id: str, current_user) -> None:
    """Raise ForbiddenError if the current user is not the owner of student_id
    (unless the current user is admin or faculty)."""
    if current_user.role in ("admin", "faculty"):
        return
    if current_user.role == "student":
        # The student's own profile id != student_id query param —
        # student_id here refers to the students.id (UUID FK to profiles)
        if str(current_user.id) != str(student_id):
            raise ForbiddenError("You can only access your own data.")
    else:
        raise ForbiddenError("Access denied.")
