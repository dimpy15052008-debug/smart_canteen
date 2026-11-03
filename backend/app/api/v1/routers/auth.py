"""Auth router — Phase 1.

Endpoints:
  POST /api/v1/auth/login           — email+password login
  POST /api/v1/auth/dev-login       — role-based demo login (dev mode only)
  GET  /api/v1/auth/me              — current user profile
  GET  /api/v1/auth/status          — current auth status
"""

from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.deps import CurrentUser, DbDep
from app.core.rate_limit import limiter
from app.schemas.auth import DevLoginRequest, LoginRequest, TokenResponse, UserProfileResponse
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/status")
def auth_status():
    """Return current auth mode. Useful for the frontend to detect dev vs prod."""
    return {
        "authMode": settings.AUTH_MODE,
        "devLoginEnabled": settings.AUTH_MODE == "dev" and settings.ENV != "production",
    }


@router.post("/dev-login", response_model=TokenResponse)
def dev_login(payload: DevLoginRequest, db: DbDep):
    """Log in as a seeded demo user for a role.

    Hard-disabled in production. Available in AUTH_MODE=dev.
    """
    return auth_service.dev_login(payload.role, db)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: DbDep):
    """Email or institutional ID + password login with rate limiting."""
    identifier = payload.identifier or payload.email or ""
    return auth_service.login(identifier, payload.password, db, payload.expected_role)


@router.post("/logout")
def logout(user: CurrentUser):
    """Log out current user (client clears token)."""
    return {"message": "Successfully logged out", "userId": str(user.id)}


@router.post("/change-password")
def change_password(user: CurrentUser):
    """Change password endpoint stub for current user."""
    return {"message": "Password updated successfully"}


@router.post("/forgot-password")
def forgot_password():
    """Forgot password endpoint stub."""
    return {"message": "Password reset link sent if account exists"}


@router.get("/me", response_model=UserProfileResponse)
def get_me(user: CurrentUser, db: DbDep):
    """Get the currently authenticated user's profile."""
    return auth_service.profile_to_response(user, db)
