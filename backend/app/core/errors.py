"""Standardized error types and HTTP exception helpers."""

from __future__ import annotations

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    code: str = "internal_error"

    def __init__(self, message: str, details: object = None) -> None:
        self.message = message
        self.details = details
        super().__init__(message)


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "bad_request"


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class ValidationError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "validation_error"


class PaymentError(AppError):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    code = "payment_error"


def _error_body(code: str, message: str, details: object = None) -> dict:
    body: dict = {"error": {"code": code, "message": message}}
    if details is not None:
        body["error"]["details"] = details
    return body


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(exc.code, exc.message, exc.details),
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body("http_error", exc.detail),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Do NOT expose internals in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body("internal_error", "An unexpected error occurred."),
    )
