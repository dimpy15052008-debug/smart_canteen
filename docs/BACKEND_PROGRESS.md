# SmartUni.Ai Backend — Progress Tracker

## Status Legend
- done: Done
- wip: In Progress  
- todo: Not Started
- gap: Known Gap / Decision Recorded

---

## Phase 0 - Plan + Scaffold [DONE]

**Acceptance:** `make dev` serves `/docs` and `/api/health`

### What was built
- Read all source files: `src/types/index.ts` (API contract), `src/mock/campusData.ts` 
  (seed source of truth), `src/context/AppContext.tsx` (action map), `server.ts` (AI spec)
- Scaffolded full `backend/` directory layout per spec
- Created `docker-compose.yml`, `Dockerfile`, `Makefile`, `requirements.txt`, `requirements-dev.txt`, `.env.example`
- Created Alembic skeleton with `alembic.ini` and `alembic/env.py`
- Created FastAPI app factory with lifespan, CORS, rate limiting, health endpoints
- Created CI skeleton (`.github/workflows/ci.yml`)
- Created legacy AI proxy (`/api/ai/chat`, `/api/ai/classify-ticket`) that keeps the frontend working
- Created `docs/BACKEND_PROGRESS.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/DEMO_SCRIPT.md`

### Key Decisions (Phase 0)

| Decision | Choice | Reason |
|---|---|---|
| Auth default | AUTH_MODE=dev | Works offline without Supabase |
| LLM default model | gemini-2.5-flash | First valid known model |
| Payment default | PAYMENT_MODE=mock | Demo runs with no Razorpay keys |
| Face verifier default | simulated | No biometric infra needed locally |
| Scheduler default | ENABLE_SCHEDULER=false | Opt-in to avoid port conflicts |
| Transport sim default | TRANSPORT_SIMULATOR=false | Opt-in only |
| Campus timezone | Asia/Kolkata | University location |
| Money type | NUMERIC(12,2) rupees | Paise only at Razorpay boundary |
| CORS origins default | http://localhost:3000 | Matches Vite/Express dev server |
| Roll number source of truth | 0827CS221045 (campusData.ts) | Overrides server.ts inconsistency |
| GPA source of truth | 8.74 (campusData.ts) | Overrides server.ts 8.7 |

---

## Phase 1 - Auth + Roles + Profiles + Audit Core + RLS SQL [DONE]

**Acceptance:** Auth matrix tests green; dev-login works; prod refuses dev mode

### What was built
- Implemented `app/schemas/base.py` (`CamelModel`) for camelCase JSON contracts
- Implemented `app/schemas/auth.py` (`LoginRequest`, `DevLoginRequest`, `UserProfileResponse`, `TokenResponse`)
- Implemented `app/services/auth_service.py` with mock demo profiles matching `campusData.ts` (student, faculty, admin, canteen, parent)
- Implemented `POST /api/v1/auth/login`, `POST /api/v1/auth/dev-login`, `GET /api/v1/auth/me`, `GET /api/v1/auth/status`
- Added production startup security assertions (`RuntimeError` on `ENV=production` with `AUTH_MODE=dev`)
- Hardened `get_current_user`, `require_roles`, and `student_owns` IDOR protection
- Wrote full RLS SQL policies in `backend/supabase/rls_policies.sql` for all personal-data tables
- Wrote test suite in `tests/test_phase1_auth.py` (12 tests, 100% passing)

---

## Phase 2 - Models + Migrations + Seed [DONE]

**Acceptance:** `make migrate seed` yields exact demo data from campusData.ts

### What was built
- Implemented all 45 domain models in SQLAlchemy 2.0 (`academics.py`, `attendance.py`, `assessment.py`, `fees.py`, `canteen.py`, `certificates.py`, `helpdesk.py`, `hostel_transport.py`, `identity.py`, `platform.py`, `ai.py`)
- Configured universal `sqlalchemy.types.Uuid` for seamless PostgreSQL native UUID + SQLite test compatibility
- Created Alembic initial migration `0001_initial_schema.py`
- Implemented comprehensive, idempotent `app/seed/seed_demo.py` porting `src/mock/campusData.ts` across all 15 domains
- Wrote test suite in `tests/test_phase2_seed.py` (all 7 tests passing, verifying CS604 attendance 71.9%, roll 0827CS221045, CGPA 8.74, fees, canteen, helpdesk, certificates)

---

## Phase 3 - Student Dashboard Read APIs [DONE]

**Acceptance:** CS604 = 71.9%, numbers match mock

### What was built
- Implemented `app/schemas/academics.py` with `CourseScheduleOut`, `ExamRecordOut`, `AttendanceRecordOut`, `AttendanceSummaryOut`
- Implemented `app/services/academic_service.py` with student course timetable resolution, exam seating queries, and attendance aggregate warning calculations
- Implemented `app/api/v1/routers/academics.py` (`GET /courses/me`, `GET /exams/me`, `GET /attendance/summary/me`, `GET /attendance/history/me`)
- Implemented `app/api/v1/routers/students.py` (`GET /api/v1/students/me` full student dashboard profile + academic overview)
- Wrote test suite in `tests/test_phase3_dashboard.py` (5 tests passing, verifying CS604 attendance 71.9%, exams, attendance summary, and dashboard)

---

## Phase 4 - Fees + Razorpay/Mock + Webhook + Receipts [DONE]

**Acceptance:** Replay-safe webhook test green

### What was built
- Implemented `app/schemas/fees.py` (`FeeInvoiceOut`, `InitiatePaymentRequest`, `InitiatePaymentResponse`, `VerifyPaymentRequest`, `PaymentOut`)
- Implemented `app/services/fee_service.py` with dynamic computed status (`paid`, `partial`, `due`, `overdue`), strict amount boundary validation (`0 < amount <= outstanding`), Razorpay/Mock order creation (amount in paise)
- Implemented constant-time HMAC-SHA256 checkout signature verification and automated audit log recording
- Implemented official university PDF receipt generator using ReportLab (`/api/v1/fees/payments/{id}/receipt`)
- Implemented replay-safe Razorpay webhook (`/api/v1/webhooks/razorpay`) with raw body signature check and event deduplication
- Implemented `app/api/v1/routers/fees.py`
- Wrote test suite in `tests/test_phase4_fees.py` (5 tests passing, including replay-safe webhook verification)

---

## Phase 5 - Helpdesk + Classifier + SLA Job [DONE]

**Acceptance:** Escalation test green

### What was built
- Implemented `app/schemas/helpdesk.py` (`ClassifyTicketRequest`, `ClassifyTicketResponse`, `CreateTicketRequest`, `HelpdeskTicketOut`, `TicketMessageOut`, `ResolveTicketRequest`)
- Implemented `app/services/helpdesk_service.py` with multi-category AI/heuristic classification, SLA deadline setting, thread messages, and ticket resolution
- Implemented idempotent SLA escalation scheduler job (`run_sla_escalation_job`) bumping overdue tickets (`Open|in_progress` past deadline -> `Escalated`, priority bump, admin alert, audit log)
- Implemented `app/api/v1/routers/helpdesk.py` (`/classify`, `/tickets`, `/resolve`, `/messages`, `/sla/run`)
- Wrote test suite in `tests/test_phase5_helpdesk.py` (5 tests passing, including SLA escalation and idempotency)

---

## Phase 6 - Certificates + PDF + QR + Public Verify [DONE]

**Acceptance:** 9/9 tests green; PDF has `%PDF` magic bytes; public verify returns valid=True/False correctly

### What was built
- Implemented `app/schemas/certificates.py` (`RequestCertificateIn`, `ApproveRejectIn`, `CertificateRequestOut`, `EligibilityDetail`, `PublicVerifyOut`)
- Implemented `app/services/certificate_service.py`:
  - **Eligibility engine** (4 rules): enrollment/account-active check, average attendance ≥ 75% (via `Enrollment.attendance_percent`), CGPA ≥ 5.0 (Transcript/Completion only), fee clearance (all invoices fully paid)
  - **PDF generation** with ReportLab: styled A4 document with university header, body text per certificate type, metadata table, registrar signature block
  - **QR code** embedded via `qrcode` library pointing to the public verify URL
  - **SHA-256 document hash** of the canonical certificate payload
  - 16-byte hex **verification code** (32 uppercase chars)
  - Full audit trail via `log_action` on every state change
- Implemented `app/api/v1/routers/certificates.py`:
  - `POST /api/v1/certificates/request` — student only; runs eligibility immediately
  - `GET /api/v1/certificates/me` — student sees own requests
  - `POST /api/v1/certificates/{id}/action` — admin/faculty approve or reject
  - `GET /api/v1/certificates/{id}/download` — streams PDF bytes
  - `GET /api/v1/certificates/verify/{code}` — **public, no-auth** QR verification
- Registered router in `app/main.py`
- Wrote `tests/test_phase6_certificates.py` (9 tests: request, invalid type, list, approve, reject, PDF download, public verify valid/invalid, not-ready download)

---

## Phase 7 - CampusAI Tool Calls + Persistence + Fallback [DONE]

**Acceptance:** 10/10 tests green (58/58 total); tool execution, history persistence, fallback chain, legacy proxies verified

### What was built
- Implemented `app/schemas/ai.py` (`ChatRequest`, `ChatResponse`, `ActionExecuted`, `ConversationOut`, `MessageOut`, `ChatMessageIn`)
- Implemented `app/services/ai_service.py`:
  - **Gemini client integration** using lazy singleton and `google.genai` SDK
  - **8 tool declarations** matching frontend contracts (`get_attendance`, `get_fee_status`, `get_exam_schedule`, `get_timetable`, `get_transport_info`, `get_hostel_status`, `create_helpdesk_ticket`, `request_certificate`)
  - **8 real database tool executors**:
    - `get_attendance`: live attendance calculation across enrolled course offerings
    - `get_fee_status`: semester invoices, payments made, pending dues, due dates
    - `get_exam_schedule`: exam seats assigned, timings, halls, seat numbers
    - `get_timetable`: weekday timetable slots joined with courses and faculty
    - `get_transport_info`: live route status, driver contact, ETA
    - `get_hostel_status`: allotted room, warden contact, curfew rules
    - `create_helpdesk_ticket`: creates real ticket in DB and assigns SLA
    - `request_certificate`: submits certificate request through certificate engine
  - **Fallback chain** across Gemini models from `GEMINI_MODELS` list
  - **Semantic heuristic fallback engine** with word-boundary matching and arithmetic evaluation
  - **Conversation persistence**: automatic creation of `AIConversation` and tracking of user and model `AIMessage` rows with tool call metadata and execution latency
  - **Multi-persona tone support**: `cool_buddy`, `wise_prof`, `sparky`, `comedic`, and `default`
- Implemented `app/api/v1/routers/campus_ai.py`:
  - `POST /api/v1/ai/chat` — main authenticated chat endpoint
  - `GET /api/v1/ai/conversations` — user conversation list
  - `GET /api/v1/ai/conversations/{id}/messages` — message history
- Upgraded `app/api/v1/routers/ai_legacy.py`:
  - `POST /api/ai/chat` — dev mode auto-auth proxy with fallback
  - `POST /api/ai/classify-ticket` — delegates to `helpdesk_service.classify_ticket`
- Registered `campus_ai_router` in `app/main.py`
- Wrote `tests/test_phase7_campus_ai.py` (10 tests, 100% pass)

---

## Phase 8 - Smart Attend [DONE]

**Acceptance:** 12/12 tests green (70/70 total); session windows, classroom geofencing, facial biometric verification, manual overrides, rosters verified

### What was built
- Implemented `app/schemas/attendance.py`:
  - `CreateSessionIn`, `AttendanceSessionOut`, `MarkAttendanceIn`, `MarkAttendanceResponse`, `ManualOverrideIn`, `SessionRosterOut`
- Implemented `app/services/attendance_service.py`:
  - **Great-circle geofencing** via Haversine formula against configured campus room perimeters (`room.geofence_radius_m`)
  - **Biometric anti-spoof verification**: checks landmark confidence threshold (≥ 75%) and liveness challenge confirmation
  - **Timezone-safe session management**: auto-expiration of overdue sessions across PostgreSQL and SQLite
  - **Duplicate prevention**: 409 Conflict if already marked in session
  - **Enrollment validation**: prevents marking for courses student is not registered in
  - **Academic ledger integration**: live increments to student `attended_classes`, `total_classes`, and automatic recalculated `attendance_percent` on `Enrollment`
  - **Faculty / Admin manual exception override**: grants attendance with mandatory justification note and recording of `corrected_by` / `corrected_at`
  - **Tamper-proof audit logging**: every session creation, close, successful verification, and manual override is recorded via `log_action`
- Implemented `app/api/v1/routers/attendance.py`:
  - `POST /api/v1/attendance/sessions` — open attendance window (faculty/admin)
  - `GET /api/v1/attendance/sessions/active` — list active sessions
  - `GET /api/v1/attendance/sessions/{id}` — session details
  - `POST /api/v1/attendance/sessions/{id}/close` — close session (faculty/admin)
  - `POST /api/v1/attendance/mark` — verify and mark attendance (student)
  - `POST /api/v1/attendance/override` & `POST /api/v1/attendance/{id}/override` — manual exception (faculty/admin)
  - `GET /api/v1/attendance/sessions/{id}/roster` — live classroom verification roster
  - `GET /api/v1/attendance/records/me` — student verification history
- Registered `attendance_router` in `app/main.py`
- Wrote `tests/test_phase8_smart_attend.py` (12 tests, 100% pass)

---

## Phase 9 - Canteen [DONE]

**Acceptance:** 14/14 tests green (84/84 total); food court menu, pre-orders, campus wallet, top-up, staff kitchen queue, QR redemption verified

### What was built
- Implemented `app/schemas/canteen.py`:
  - `CanteenMenuItemOut`, `CreateMenuItemIn`, `UpdateMenuItemIn`, `CanteenOrderItemIn`, `CanteenOrderItemOut`, `CreateOrderIn`, `CanteenOrderOut`, `UpdateOrderStatusIn`, `VerifyQrIn`, `WalletTransactionOut`, `WalletAccountOut`, `TopupWalletIn`
- Implemented `app/services/canteen_service.py`:
  - **Menu Management**: listing with category filtering and availability check, staff-only CRUD with audit logs
  - **Prepaid Campus Wallet**: balance tracking, instant UPI/Card top-up, atomic debiting with append-only `WalletTransaction` ledger
  - **Digital Food Pre-ordering**: sequential token numbers per day (`A-101`, `A-102`), digital QR code value generation (`SMARTUNI-ORDER-A{token}-{student_id}`)
  - **Staff Kitchen Queue**: live order preparation management by staff role (`new` -> `preparing` -> `ready` -> `completed`)
  - **QR Code Verification & Redemption**: staff scans student QR code, checks validity, prevents double-redemption, transitions order to `completed`
  - **Cancellation Refunds**: automatic refund credited to campus wallet if a wallet-paid order is cancelled
  - **Tamper-proof audit logging**: every order placement, status transition, wallet recharge, and QR redemption logged via `log_action`
- Implemented `app/api/v1/routers/canteen.py`:
  - `GET /api/v1/canteen/menu` — list menu items with category filter
  - `POST /api/v1/canteen/menu` — staff add menu item
  - `PATCH /api/v1/canteen/menu/{id}` — staff update item price/availability
  - `DELETE /api/v1/canteen/menu/{id}` — staff remove menu item
  - `GET /api/v1/canteen/wallet/me` — student prepaid wallet balance & transaction ledger
  - `POST /api/v1/canteen/wallet/topup` — student instant wallet recharge
  - `POST /api/v1/canteen/orders` — student place pre-order
  - `GET /api/v1/canteen/orders/me` — student order history
  - `GET /api/v1/canteen/orders/queue` — staff live kitchen queue
  - `PATCH /api/v1/canteen/orders/{id}/status` — staff update order status
  - `POST /api/v1/canteen/orders/verify-qr` — staff scan QR code to release meal
- Registered `canteen_router` in `app/main.py`
- Wrote `tests/test_phase9_canteen.py` (14 tests, 100% pass)

---

## Phase 10 - Notifications + SSE + Transport [DONE]

**Acceptance:** 11/11 tests green (95/95 total); per-user notifications CRUD, unread filter, cross-user IDOR protection, live bus route telemetry, SSE event-stream verified

### What was built
- Implemented `app/schemas/platform.py`:
  - `NotificationOut`, `CreateNotificationIn`, `BusStopOut`, `BusCoordinatesOut`, `BusRouteOut`
- Implemented `app/services/notification_service.py`:
  - `list_notifications(user, db, unread_only)` — newest-first, optional unread filter
  - `mark_as_read(notification_id, user, db)` — IDOR-safe (403 on wrong owner, 404 on missing)
  - `mark_all_read(user, db)` — batch mark all unread; returns count
  - `create_notification(db, ...)` — internal helper for other services to push notifications
- Implemented `app/services/transport_service.py`:
  - `list_bus_routes(db)` — all routes with live telemetry, stops, driver info
  - `get_bus_route(route_id, db)` — single route by UUID, 404 on miss
  - `simulate_telemetry_step(route_id, db)` — subtle GPS/speed jitter + ETA countdown
- Implemented `app/api/v1/routers/notifications.py`:
  - `GET /api/v1/notifications` — list with optional `?unreadOnly=true`
  - `PATCH /api/v1/notifications/{id}/read` — mark single read
  - `POST /api/v1/notifications/read-all` — bulk mark all read
- Implemented `app/api/v1/routers/transport.py`:
  - `GET /api/v1/transport/routes` — list all bus routes
  - `GET /api/v1/transport/routes/{id}` — route details with stops + GPS
  - `GET /api/v1/transport/stream` — SSE `text/event-stream` with `max_events` param
- Extended `app/seed/seed_demo.py`:
  - Added Route 2 (South City Metro Link) with Bus, Stops, and BusPosition seeding
- Registered `notifications_router` and `transport_router` in `app/main.py`
- Wrote `tests/test_phase10_notifications_transport.py` (11 tests, 100% pass)

---

## Phase 11 - Admin Analytics [DONE]

**Acceptance:** 10/10 tests green (105/105 total); full analytics snapshot, departmental attendance, grievance breakdown, SLA compliance, paginated immutable audit trail, admin-only RBAC verified

### What was built
- Implemented `app/schemas/admin.py`:
  - `AnalyticsKpiOut`, `DeptAttendanceOut`, `GrievanceCategoryOut`, `AuditLogOut`, `AdminAnalyticsOut`
- Implemented `app/services/admin_service.py`:
  - `get_analytics(db)` — computes campus-wide KPIs from real DB: student count, canteen orders, SLA compliance %, certificates issued, open tickets, avg resolution hours; weighted departmental attendance benchmarks; grievance category breakdown from live ticket data; recent 20 audit log entries
  - `list_audit_logs(db, limit, offset)` — paginated immutable audit trail
  - `_compute_sla_compliance(db)` — fraction of resolved tickets resolved before SLA deadline
  - `_avg_resolution_hours(db)` — average resolution time for closed tickets
- Implemented `app/api/v1/routers/admin.py`:
  - `GET /api/v1/admin/analytics` — full admin analytics snapshot (admin only)
  - `GET /api/v1/admin/audit-logs` — paginated audit trail with `?limit=&offset=` (admin only)
- Registered `admin_router` in `app/main.py`
- Wrote `tests/test_phase11_admin_analytics.py` (10 tests, 100% pass)

---

## Phase 12 - ML Early Warning [DONE]

**Acceptance:** 14/14 tests green (119/119 total across entire suite); academic signals extraction, scikit-learn random forest pipeline, explainable risk factors, detention alerts (CS604 71.9%), interventions lifecycle, personalized learning recommendations, ML ethics compliance verified

### What was built
- Implemented `app/schemas/ml.py`:
  - `AcademicFeatures` — strictly non-protected academic signals: `attendance_percent`, `attendance_trend_30d`, `marks_average`, `marks_trend`, `assignment_submission_rate`, `recent_activity_count`
  - `RiskFactorOut`, `EarlyWarningPredictionOut`, `AtRiskStudentSummaryOut`, `BatchEvaluationResultOut`
  - `CreateInterventionIn`, `UpdateInterventionIn`, `InterventionOut`
  - `LearningResourceOut`, `RecommendationOut`, `CreateRecommendationIn`
- Implemented `app/services/ml_service.py`:
  - **Feature Extraction Engine**: extracts DB-backed signals from student `Enrollment`, `AttendanceRecord`, `AssessmentScore`, `ExamSeat`, `HelpdeskTicket`, and `CanteenOrder`
  - **Scikit-Learn ML Pipeline**: `Pipeline([('scaler', StandardScaler()), ('rf', RandomForestClassifier)])` with calibrated class probabilities for `Low`, `Medium`, `High`, and `Critical` risk tiers
  - **Institutional Compliance Rules**: hard threshold enforcement for 75% university attendance requirement; detects course-specific detention shortages (e.g. Faizan Ali's CS604 at 71.9%)
  - **Explainable Factor Generator**: produces human-readable risk factors with severity indicators and remediation action targets
  - **ML Ethics Safeguards**: explicitly excludes protected demographic attributes (gender, religion, caste, race, income); attaches `is_support_signal_only=True` and institutional ethical disclaimer to all outputs
  - **Interventions Management**: faculty/counselor support workflow (`Pending` -> `In Progress` -> `Resolved`) with audit logging via `log_action`
  - **Smart Recommendations Engine**: correlates academic diagnostic deficits with curated `LearningResource` materials
- Implemented `app/api/v1/routers/ml.py`:
  - `GET /api/v1/ml/early-warning/me` — student checks own early warning assessment
  - `GET /api/v1/ml/early-warning/students/{id}` — faculty/admin view student assessment (with IDOR protection)
  - `POST /api/v1/ml/early-warning/evaluate/{id}` — faculty/admin trigger on-demand re-evaluation
  - `POST /api/v1/ml/early-warning/batch-evaluate` — batch analyze cohort across department or campus
  - `GET /api/v1/ml/early-warning/at-risk` — filtered monitoring list for academic counseling
  - `POST /api/v1/ml/interventions` — faculty creates student support intervention
  - `GET /api/v1/ml/interventions` — list interventions (role-scoped; student sees own)
  - `PATCH /api/v1/ml/interventions/{id}` — faculty updates intervention status and logs counseling notes
  - `GET /api/v1/ml/recommendations/me` — student views personalized study recommendations
  - `POST /api/v1/ml/recommendations/generate/{id}` — generate remediation recommendations
- Extended `app/seed/seed_demo.py`:
  - Seeded 4 curated CS learning resources (Concurrency, Compilers, TCP Networks, Agile/DevOps)
  - Seeded initial ML evaluation for Faizan Ali (CS604 detention risk)
  - Seeded active intervention assigned to Prof. Rajesh Sharma
  - Seeded smart recommendation linking CS604 OS Concurrency Masterclass
- Registered `ml_router` in `app/main.py`
- Wrote `tests/test_phase12_ml_early_warning.py` (14 tests, 100% pass)

---

## Phase 13 - Frontend Integration [DONE]

**Acceptance:** Type-safe API client, Vite dev proxy, AppContext state synchronization with parallel fetching, live background API dispatches on all user actions, 100% clean TypeScript check (`tsc --noEmit`), and successful production build (`vite build` in 761ms)

### What was built
- Implemented `src/api/client.ts`:
  - Unified type-safe API client targeting the FastAPI backend (`/api/v1/*`)
  - Automatic JWT token management in localStorage (`smartuni_token`, `smartuni_role`)
  - Modules: `authApi`, `academicsApi`, `attendanceApi`, `feesApi`, `helpdeskApi`, `certificatesApi`, `canteenApi`, `notificationsApi`, `transportApi`, `adminApi`, `campusAiApi`, `mlApi`
  - Resilient offline fallback to local campus seed data if the backend is unreachable or booting
- Configured Vite Proxy in `vite.config.ts`:
  - Proxies all `/api/*` requests from Vite port 3000 to FastAPI port 8000 (`http://localhost:8000`)
- Updated `src/context/AppContext.tsx`:
  - Role-switching automatically triggers `api.auth.devLogin(currentRole)` to authenticate the session
  - Live data synchronization on role changes across courses, attendance records, canteen menu, pre-orders, certificate requests, helpdesk tickets, exams, fee invoices, bus routes, notifications, and audit logs via `Promise.allSettled`
  - Wired live background API dispatches for:
    - `markAttendance` ➔ `api.attendance.markAttendance`
    - `createCanteenOrder` ➔ `api.canteen.createOrder`
    - `updateOrderStatus` ➔ `api.canteen.updateOrderStatus`
    - `createCertificateRequest` ➔ `api.certificates.requestCertificate`
    - `approveCertificate` ➔ `api.certificates.approve`
    - `createHelpdeskTicket` ➔ `api.helpdesk.createTicket`
    - `resolveHelpdeskTicket` ➔ `api.helpdesk.resolveTicket`
    - `payFees` ➔ `api.fees.initiatePayment`
    - `markNotificationRead` ➔ `api.notifications.markRead`
- Fixed Frontend TypeScript Compiler Errors:
  - Cast easing cubic-bezier arrays as 4-tuples (`as const`) in `App.tsx` and `StudentDashboard.tsx`
  - Updated canteen status checking in `SmartCanteenView.tsx`
- Verified:
  - `npm run lint` (`tsc --noEmit`) passes with 0 errors
  - `npm run build` generates optimized production assets (`dist/`) cleanly in 761ms

---

## Phase 14 - Hardening + CI Green [DONE]

**Acceptance:** 129/129 tests green; ruff lint + format clean; mypy config; security headers on all responses; production-grade Dockerfile with Gunicorn; CI pipeline with typecheck + Docker Buildx layer cache

### What was built
- **Ruff format fixes**: Auto-formatted `app/models/identity.py` and `app/services/auth_service.py` (2 files reformatted — CI format check now passes clean)
- **pyproject.toml hardening**:
  - Removed invalid `asyncio_mode = "auto"` option (was causing `PytestConfigWarning`)
  - Added `filterwarnings` to suppress known third-party deprecation warnings (jose, passlib, starlette anyio alias)
  - Added full `[tool.mypy]` configuration with `warn_return_any`, `warn_unused_configs`, and per-module `ignore_missing_imports` overrides for all heavy optional deps
- **Security headers middleware** added to `app/main.py`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
  - `Strict-Transport-Security` injected **only** in `ENV=production` (not dev/test)
- **Dockerfile upgrade**:
  - Added `gunicorn==23.0.0` to builder stage
  - Added `curl` to runtime for healthcheck probing
  - Added `HEALTHCHECK` directive (30s interval, 10s timeout, 3 retries)
  - Startup now uses `gunicorn --worker-class uvicorn.workers.UvicornWorker` for production stability
  - `WEB_CONCURRENCY` env var controls worker count (default 2)
- **docker-compose.yml upgrade**:
  - Added API service `healthcheck` using curl to `/api/health`
  - Added `WEB_CONCURRENCY=2` environment variable
  - Added profile comments for easy scaling
- **`.dockerignore`** created: excludes `__pycache__`, `.env`, `*.db`, `docs/`, `.git/`, IDE configs from Docker build context
- **Makefile additions**:
  - `make typecheck` — runs `mypy app/ --ignore-missing-imports`
  - `make security-check` — runs `pip-audit -r requirements.txt`
  - Updated `.PHONY` and `help` text
- **CI workflow (`.github/workflows/ci.yml`) upgrades**:
  - Added `typecheck` job (mypy) running in parallel with `test`
  - Added pip caching to `lint` job
  - Added Docker Buildx with GHA layer caching to `docker-build` job
  - Coverage upload uses `if: always()` + `fail_ci_if_error: false` (CI doesn't fail on Codecov issues)
  - OpenAPI artifact has `retention-days: 30`
- **`tests/test_phase14_hardening.py`** — 10 new tests:
  - Security headers present on all responses
  - Request ID passthrough (client-supplied header echoed back)
  - Request ID auto-generated when missing
  - Health endpoint JSON structure validation
  - All protected routes return 401/403, never 500 for unauthenticated
  - 404 returns JSON not HTML
  - Validation errors return 422 JSON
  - `/docs` and `/redoc` accessible in non-production
  - `/openapi.json` spec has correct title and ≥10 registered paths
  - Production safety check blocks AUTH_MODE=dev



## Known Gaps / Risks

1. server.ts model names (gemini-3.8-flash, gemini-3.1-flash-lite) are invalid.
   Backend uses configurable model env vars with gemini-2.5-flash as default.

2. Roll number inconsistency: mock has 0827CS221045, server.ts has 2024-CSE-084.
   DB uses 0827CS221045 as the source of truth per campusData.ts.

3. GPA inconsistency: mock has 8.74, server.ts has 8.7. DB uses 8.74.

4. server.ts uses Function() eval - injection risk.
   Backend uses Python ast.literal_eval safe evaluator.

5. framer-motion not in package.json (only motion is listed).
   Will add explicitly in Phase 13.

6. No face-recognition in prod: using SimulatedFaceVerifier by default.
   Real embedding verifier is an optional adapter.

7. Single-instance scheduler: APScheduler must only run in one process.
   Docker Compose does not scale workers by default.

8. RLS only enforced via Supabase: FastAPI RBAC is the primary auth layer.
