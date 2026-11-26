"""SmartUni.Ai Backend — Application Settings.

All values are loaded from environment variables (or a .env file).
Pydantic Settings handles validation, type coercion, and provides
clear error messages if required variables are missing.
"""

from __future__ import annotations

import secrets
from typing import Literal

from pydantic import AnyHttpUrl, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Core ----
    ENV: Literal["development", "production", "test"] = "development"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # ---- Auth ----
    AUTH_MODE: Literal["dev", "supabase"] = "dev"
    JWT_SECRET: str = Field(default_factory=lambda: secrets.token_hex(32))
    JWT_ALGORITHM: str = "HS256"
    JWT_TTL_SECONDS: int = 86400

    # ---- Database ----
    DATABASE_URL: str = "postgresql+psycopg://smartuni:smartuni@localhost:5432/smartuni_dev"
    DIRECT_URL: str = "postgresql+psycopg://smartuni:smartuni@localhost:5432/smartuni_dev"

    # ---- Supabase ----
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ---- CORS ----
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ---- LLM ----
    LLM_PROVIDER: Literal["gemini", "mock"] = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODELS: str = "gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash"
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_RETRIES: int = 2

    @property
    def gemini_models_list(self) -> list[str]:
        return [m.strip() for m in self.GEMINI_MODELS.split(",") if m.strip()]

    # ---- Payments ----
    PAYMENT_MODE: Literal["mock", "razorpay"] = "mock"
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ---- Storage ----
    STORAGE_BACKEND: Literal["local", "supabase"] = "local"

    # ---- Certificate Verification ----
    PUBLIC_VERIFY_BASE_URL: AnyHttpUrl = "http://localhost:3000"  # type: ignore[assignment]

    # ---- Scheduler ----
    ENABLE_SCHEDULER: bool = False
    TRANSPORT_SIMULATOR: bool = False

    # ---- Biometrics ----
    FACE_VERIFIER: Literal["simulated", "embedding"] = "simulated"

    # ---- Demo Seeds ----
    DEMO_STUDENT_PASSWORD: str = "demo1234"
    DEMO_FACULTY_PASSWORD: str = "demo1234"
    DEMO_ADMIN_PASSWORD: str = "demo1234"
    DEMO_CANTEEN_PASSWORD: str = "demo1234"

    # ---- Razorpay Payment Gateway (Test Mode) ----
    RAZORPAY_KEY_ID: str = "rzp_test_51PLACEHOLDER"
    RAZORPAY_KEY_SECRET: str = "rzp_test_secret_placeholder"
    RAZORPAY_WEBHOOK_SECRET: str = "rzp_test_webhook_secret_placeholder"

    # ---- Security validators ----
    @model_validator(mode="after")
    def production_safety_checks(self) -> Settings:
        if self.ENV == "production":
            if self.AUTH_MODE == "dev":
                raise ValueError(
                    "SECURITY: AUTH_MODE=dev is FORBIDDEN in production. "
                    "Set AUTH_MODE=supabase and configure Supabase variables."
                )
            if self.JWT_SECRET and len(self.JWT_SECRET) < 32:
                raise ValueError("JWT_SECRET must be at least 32 characters in production.")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("SECURITY: Wildcard CORS_ORIGINS is FORBIDDEN in production.")
        return self

    @field_validator("LOG_LEVEL")
    @classmethod
    def normalize_log_level(cls, v: str) -> str:
        return v.upper()


settings = Settings()
