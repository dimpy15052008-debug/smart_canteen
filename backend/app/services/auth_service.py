"""Authentication and profile resolution service.

Supports both:
  1. Production Supabase / database-backed profiles
  2. Local development mock profiles (seeded from src/mock/campusData.ts)
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, verify_password
from app.models.identity import Profile
from app.schemas.auth import TokenResponse, UserProfileResponse, UserRole

# Standard deterministic UUIDs for mock profiles in dev mode
DEMO_PROFILES: dict[str, dict[str, Any]] = {
    "student": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Faizan Ali",
        "email": "faizan.ali@smartuni.edu.in",
        "role": "student",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "phone": "+91 98765 43210",
        "department": "Computer Science & Engineering",
        "roll_number": "0827CS221045",
        "enrollment_id": "ENR-2022-CSE-0145",
        "semester": 6,
        "program": "Bachelor of Technology (Computer Science)",
        "batch": "2022 - 2026",
        "cgpa": 8.74,
        "hostel_room": "Block B - Room 304 (Bed 1)",
        "bus_route": "Route #4 (North Campus Express)",
    },
    "faculty": {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Prof. Rajesh Sharma",
        "email": "rajesh.sharma@smartuni.edu.in",
        "role": "faculty",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "phone": "+91 98112 34567",
        "department": "Computer Science & Engineering",
        "designation": "Associate Professor & Lab Director",
        "employee_id": "FAC-2026-002",
        "assigned_courses": [
            "CS601: Distributed Systems",
            "CS603: Machine Learning & NLP",
        ],
        "cabin_number": "Academic Block A - Room 412",
    },
    "admin": {
        "id": "00000000-0000-0000-0000-000000000003",
        "name": "Dr. Sunita Verma",
        "email": "sunita.verma@smartuni.edu.in",
        "role": "admin",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "department": "Academic Affairs & Digital Governance",
        "designation": "Dean of Academics & Controller of Examinations",
        "staff_id": "ADM-2026-001",
    },
    "canteen": {
        "id": "00000000-0000-0000-0000-000000000004",
        "name": "Ramesh Kumar",
        "email": "ramesh.canteen@smartuni.edu.in",
        "role": "canteen",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "department": "University Central Food Court",
        "designation": "Head Chef & Kitchen Operations Lead",
        "staff_id": "CAN-2026-001",
    },
    "parent": {
        "id": "00000000-0000-0000-0000-000000000005",
        "name": "Mr. Asim Ali",
        "email": "asim.ali@parent.smartuni.edu.in",
        "role": "parent",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "department": "Parent Association",
        "designation": "Guardian of Faizan Ali (0827CS221045)",
    },
}


class MockProfileObj:
    """In-memory profile object matching the SQLAlchemy Profile interface."""

    def __init__(self, data: dict[str, Any]):
        self.id = uuid.UUID(data["id"]) if isinstance(data["id"], str) else data["id"]
        self.name = data["name"]
        self.email = data["email"]
        self.role = data["role"]
        self.avatar = data.get("avatar")
        self.phone = data.get("phone")
        self.active = True
        self.department_name = data.get("department")
        self.designation = data.get("designation")
        self.staff_id = data.get("staff_id")
        self._raw_data = data

    @property
    def department(self):
        if self.department_name:

            class MockDept:
                name = self.department_name

            return MockDept()
        return None

    def __repr__(self) -> str:
        return f"<MockProfile id={self.id} role={self.role}>"


def profile_to_response(profile: Any, db: Session | None = None) -> UserProfileResponse:
    """Convert a database Profile or MockProfileObj into a UserProfileResponse schema."""
    if isinstance(profile, MockProfileObj):
        return UserProfileResponse(**profile._raw_data)

    dept_name = profile.department.name if profile.department else None

    # Load student specifics if applicable
    roll_number = None
    enrollment_id = None
    semester = None
    program = None
    batch = None
    cgpa = None

    if profile.role == "student" and profile.student:
        stu = profile.student
        roll_number = stu.roll_number
        enrollment_id = stu.enrollment_id
        semester = stu.semester
        program = stu.program
        batch = stu.batch
        cgpa = float(stu.cgpa) if stu.cgpa is not None else None

    # Load faculty specifics if applicable
    cabin_number = None
    assigned_courses = None
    if profile.role == "faculty" and profile.faculty:
        cabin_number = profile.faculty.cabin_number

    return UserProfileResponse(
        id=str(profile.id),
        name=profile.name,
        email=profile.email,
        role=profile.role,
        avatar=profile.avatar,
        phone=profile.phone,
        department=dept_name,
        roll_number=roll_number,
        enrollment_id=enrollment_id,
        semester=semester,
        program=program,
        batch=batch,
        cgpa=cgpa,
        designation=profile.designation,
        assigned_courses=assigned_courses,
        cabin_number=cabin_number,
    )


def dev_login(role: UserRole, db: Session | None = None) -> TokenResponse:
    """Log in as a seeded demo user for the specified role.

    Disabled in production.
    """
    if settings.ENV == "production" or settings.AUTH_MODE != "dev":
        raise ForbiddenError("Dev login is disabled in production environment.")

    target_profile = None

    # Attempt to load from database if connected
    if db is not None:
        try:
            target_profile = (
                db.query(Profile).filter(Profile.role == role, Profile.active == True).first()
            )
        except Exception:
            target_profile = None

    # Fallback to standard demo profile
    if target_profile is None:
        demo_data = DEMO_PROFILES.get(role)
        if not demo_data:
            raise NotFoundError(f"No demo profile configured for role '{role}'.")
        target_profile = MockProfileObj(demo_data)

    user_response = profile_to_response(target_profile, db)

    token_data = {
        "sub": str(target_profile.id),
        "role": target_profile.role,
        "email": target_profile.email,
        "name": target_profile.name,
    }
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_TTL_SECONDS,
        user=user_response,
    )


def login(
    identifier: str,
    password: str,
    db: Session | None = None,
    expected_role: UserRole | None = None,
) -> TokenResponse:
    """Authenticate using email or institutional ID (roll, enrollment, employee ID, staff ID)."""
    profile = None
    identifier_clean = identifier.strip()

    if db is not None:
        try:
            # 1. Try matching Profile.email or Profile.staff_id
            profile = (
                db.query(Profile)
                .filter(
                    ((Profile.email == identifier_clean) | (Profile.staff_id == identifier_clean)),
                    Profile.active == True,
                )
                .first()
            )

            # 2. If not found, try matching Student.roll_number or Student.enrollment_id
            if profile is None:
                from app.models.identity import Student

                stu = (
                    db.query(Student)
                    .filter(
                        (Student.roll_number == identifier_clean)
                        | (Student.enrollment_id == identifier_clean)
                    )
                    .first()
                )
                if stu:
                    profile = stu.profile

            # 3. If not found, try matching Faculty.employee_id
            if profile is None:
                from app.models.identity import Faculty

                fac = db.query(Faculty).filter(Faculty.employee_id == identifier_clean).first()
                if fac:
                    profile = fac.profile
        except Exception:
            profile = None

    if profile is not None:
        if not profile.hashed_password or not verify_password(password, profile.hashed_password):
            raise UnauthorizedError("Invalid credentials.")

        if expected_role and profile.role != expected_role:
            raise ForbiddenError(f"This ID doesn't belong to a {expected_role} account.")

        user_response = profile_to_response(profile, db)
        user_id = str(profile.id)
        user_role = profile.role
        user_name = profile.name

    elif settings.AUTH_MODE == "dev" and settings.ENV != "production":
        # Check dev profiles by email, roll_number, enrollment_id, employee_id, staff_id, or role shortcut
        matched_demo = None
        for p in DEMO_PROFILES.values():
            if (
                p.get("email") == identifier_clean
                or p.get("roll_number") == identifier_clean
                or p.get("enrollment_id") == identifier_clean
                or p.get("employee_id") == identifier_clean
                or p.get("staff_id") == identifier_clean
                or p.get("role") == identifier_clean.lower()
            ):
                matched_demo = p
                break

        if not matched_demo or (
            password != "demo123"
            and password != "demo1234"
            and password != matched_demo.get("role") + "123"
        ):
            # Allow common dev passwords
            if password not in [
                "demo123",
                "demo1234",
                "password",
                "admin123",
                "student123",
                "faculty123",
                "canteen123",
            ]:
                raise UnauthorizedError("Invalid credentials.")

        if not matched_demo:
            raise UnauthorizedError("Invalid credentials.")

        if expected_role and matched_demo["role"] != expected_role:
            raise ForbiddenError(f"This ID doesn't belong to a {expected_role} account.")

        profile = MockProfileObj(matched_demo)
        user_response = UserProfileResponse(**matched_demo)
        user_id = str(profile.id)
        user_role = profile.role
        user_name = profile.name
    else:
        raise UnauthorizedError("Invalid credentials.")

    token_data = {
        "sub": user_id,
        "role": user_role,
        "email": user_response.email,
        "name": user_name,
    }
    token = create_access_token(token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_TTL_SECONDS,
        user=user_response,
    )
