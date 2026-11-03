"""Base Pydantic models with camelCase alias support.

All request/response schemas should inherit from CamelModel so that
JSON payloads match the React TypeScript interface conventions (e.g. rollNumber,
cgpa, enrollmentId) while Python code uses snake_case.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Pydantic model that automatically converts snake_case fields to camelCase
    aliases for JSON serialization and deserialization.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
