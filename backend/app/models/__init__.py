"""Central models package — imports all SQLAlchemy models for Alembic discovery."""

# 1. Base identity and facilities
# 2. Academics & Attendance
from app.models.academics import (
    Course,
    CourseOffering,
    Enrollment,
    Program,
    Room,
    TimetableSlot,
)

# 8. AI & Recommendations
from app.models.ai import (
    AIConversation,
    AIMessage,
    AIPrediction,
    Intervention,
    LearningResource,
    Recommendation,
)

# 3. Assessment & Exams
from app.models.assessment import (
    Assessment,
    AssessmentScore,
    Exam,
    ExamSeat,
)
from app.models.attendance import (
    AttendanceRecord,
    AttendanceSession,
)

# 5. Canteen & Wallet
from app.models.canteen import (
    CanteenMenuItem,
    CanteenOrder,
    WalletAccount,
    WalletTransaction,
)

# 6. Certificates & Helpdesk
from app.models.certificates import CertificateRequest

# 4. Fees & Payments
from app.models.fees import (
    FeeInvoice,
    Payment,
    WebhookEvent,
)
from app.models.helpdesk import (
    HelpdeskMessage,
    HelpdeskTicket,
)
from app.models.hostel_transport import (
    Bus,
    BusPosition,
    BusRoute,
    BusStop,
    GatePass,
    Hostel,
    HostelAllocation,
    HostelRoom,
)
from app.models.identity import (
    Department,
    Faculty,
    Parent,
    ParentStudentLink,
    Profile,
    Student,
)

# 7. Platform & Audit
from app.models.platform import (
    ActivityEvent,
    AuditLog,
    Notification,
)

__all__ = [
    # Identity
    "Profile",
    "Department",
    "Student",
    "Faculty",
    "Parent",
    "ParentStudentLink",
    # Hostel & Transport
    "Hostel",
    "HostelRoom",
    "HostelAllocation",
    "GatePass",
    "BusRoute",
    "BusStop",
    "Bus",
    "BusPosition",
    # Academics
    "Program",
    "Room",
    "Course",
    "CourseOffering",
    "TimetableSlot",
    "Enrollment",
    # Attendance
    "AttendanceSession",
    "AttendanceRecord",
    # Assessment
    "Exam",
    "ExamSeat",
    "Assessment",
    "AssessmentScore",
    # Fees
    "FeeInvoice",
    "Payment",
    "WebhookEvent",
    # Canteen
    "CanteenMenuItem",
    "CanteenOrder",
    "WalletAccount",
    "WalletTransaction",
    # Certificates
    "CertificateRequest",
    # Helpdesk
    "HelpdeskTicket",
    "HelpdeskMessage",
    # Platform
    "AuditLog",
    "Notification",
    "ActivityEvent",
    # AI
    "AIConversation",
    "AIMessage",
    "AIPrediction",
    "Intervention",
    "LearningResource",
    "Recommendation",
]
