# SmartUni.Ai Backend — Architecture

## System Overview

SmartUni.Ai is a **modular-monolith** FastAPI backend on PostgreSQL that:
- Replaces all React mock data with real, authorized, persisted APIs
- Implements full AI tool-calling (CampusAI) via Google Gemini
- Automates university workflows: attendance, fees, canteen, certificates, helpdesk
- Provides ML early-warning for at-risk students
- Is secure by default (JWT, RBAC, ownership checks, RLS, audit log)

```
┌─────────────────────────────────────────────────────────────┐
│  React 19 SPA (Vite + TypeScript + Tailwind v4)            │
│  src/api/client.ts ─── /api/v1/* ──────────────────────┐  │
└────────────────────────────────────────────────────────│──┘
                                                         │
┌────────────────────────────────────────────────────────▼──┐
│  FastAPI (Python 3.12)  port 8000                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Routers (thin — parse, auth, serialize)             │ │
│  │  auth | students | academics | attendance | fees     │ │
│  │  canteen | certificates | helpdesk | notifications   │ │
│  │  analytics | ai | public | webhooks                  │ │
│  └─────────────────────┬────────────────────────────────┘ │
│  ┌──────────────────────▼────────────────────────────────┐ │
│  │  Services (ALL business logic)                        │ │
│  │  attendance_svc | fee_svc | canteen_svc               │ │
│  │  certificate_svc | helpdesk_svc | notification_svc    │ │
│  └─────────────────────┬────────────────────────────────┘ │
│  ┌──────────────────────▼────────────────────────────────┐ │
│  │  AI Layer                                             │ │
│  │  GeminiClient (LLMClient interface)                   │ │
│  │  CampusAI tool loop (max 3 rounds)                    │ │
│  │  TicketClassifier (LLM → Pydantic → heuristic fb)    │ │
│  │  ML: LogisticRegression + RandomForest early-warning  │ │
│  └─────────────────────┬────────────────────────────────┘ │
│  ┌──────────────────────▼────────────────────────────────┐ │
│  │  Models (SQLAlchemy 2.0 Mapped[] style)               │ │
│  │  Identity | Academics | Attendance | Fees | Canteen   │ │
│  │  Certificates | Helpdesk | Hostel | Transport | AI    │ │
│  └─────────────────────┬────────────────────────────────┘ │
└────────────────────────│───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│  PostgreSQL 16 (Supabase-hosted in prod, Docker locally)   │
│  RLS enabled on all personal-data tables                   │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Concern | Technology |
|---|---|
| Language | Python 3.12 |
| API | FastAPI + Uvicorn |
| Validation | Pydantic v2 + pydantic-settings |
| ORM | SQLAlchemy 2.0 (Mapped[] typed style, sync sessions) |
| Driver | psycopg v3 (psycopg[binary,pool]) |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Auth | Supabase Auth (prod) / Local HS256 JWT (dev) |
| Storage | Supabase Storage (prod) / Local disk (dev) |
| Realtime | Supabase Realtime + FastAPI SSE |
| LLM | Google Gemini via google-genai (configurable) |
| ML | pandas, NumPy, scikit-learn, joblib |
| Payments | Razorpay test mode / mock fallback |
| PDF | reportlab |
| QR | qrcode[pil] |
| Jobs | APScheduler (single-process) |
| Rate limiting | slowapi |
| Logging | structlog (JSON in prod, pretty in dev) |
| Tests | pytest + httpx TestClient + freezegun |
| Linting | ruff |

## Security Principles

1. **JWT on every route** except `/public/*`, `/webhooks/*` (signature-verified), and health
2. **RBAC + object-level ownership checks** on every read/write (IDOR prevention)
3. **Server-side secrets only** — frontend never sees Gemini, Razorpay secret, or Supabase service keys
4. **Strict CORS allow-list** — wildcard CORS blocked in production
5. **Rate limits** — auth (5/min), AI (20/min), public verify (30/min)
6. **Pydantic validation** everywhere, upload size/type limits, parameterized queries only
7. **Constant-time signature comparisons** for Razorpay webhook and payment verification
8. **Idempotent payments/webhooks** — deduplicated by event_id / idempotency_key
9. **Audit log rows** for all significant actions (append-only table)
10. **No PII or tokens in logs**
11. **Face data** stored as embeddings only (with consent flag), never raw images
12. **Startup safety check** — refuses to boot with dangerous prod configs

## ML Ethics

The early-warning model uses ONLY academic signals:
- Overall attendance percentage
- 30-day attendance trend  
- Average marks percentage
- Marks trend
- Assignment submission rate
- Recent activity count

**Protected attributes (gender, religion, caste, income, etc.) are explicitly EXCLUDED** from the feature set. The model output is labeled as a "support signal, not a decision" and requires human acknowledgement before any intervention is created.

## Deploy Notes (Render / Railway)

1. Set `ENV=production`, `AUTH_MODE=supabase`
2. Add all env vars from `.env.example`
3. Build command: `pip install -r requirements.txt && alembic upgrade head`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add a PostgreSQL add-on (or use Supabase — set `DATABASE_URL` to the session-pooler URI and `DIRECT_URL` to the direct connection)
6. Enable `ENABLE_SCHEDULER=true` only in a single designated worker dyno/container
