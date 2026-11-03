"""Auth schemas for login, token exchange, and user profile serialization."""

from __future__ import annotations

from typing import Literal

from app.schemas.base import CamelModel

UserRole = Literal["student", "faculty", "admin", "canteen", "parent"]


class LoginRequest(CamelModel):
    """Email or institutional ID + password login request."""

    email: str | None = None
    identifier: str | None = None
    password: str
    expected_role: UserRole | None = None


class ChangePasswordRequest(CamelModel):
    old_password: str
    new_password: str


class ForgotPasswordRequest(CamelModel):
    email_or_identifier: str


class DevLoginRequest(CamelModel):
    """Dev-mode instant login by role."""

    role: UserRole


class UserProfileResponse(CamelModel):
    """User profile matching the React UserProfile TypeScript interface."""

    id: str
    name: str
    email: str
    role: str
    avatar: str | None = None
    phone: str | None = None
    department: str | None = None

    # Student-specific fields
    roll_number: str | None = None
    enrollment_id: str | None = None
    semester: int | None = None
    program: str | None = None
    batch: str | None = None
    cgpa: float | None = None
    hostel_room: str | None = None
    bus_route: str | None = None

    # Faculty-specific fields
    designation: str | None = None
    assigned_courses: list[str] | None = None
    cabin_number: str | None = None


class TokenResponse(CamelModel):
    """JWT Bearer token and profile payload."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfileResponse
