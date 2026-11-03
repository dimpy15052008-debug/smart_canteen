# SmartUni.Ai Backend — API Reference

> Auto-generated OpenAPI spec: `docs/openapi.json` (exported by CI)
> Interactive docs: http://localhost:8000/docs

## Base URLs

| Environment | Base URL |
|---|---|
| Local dev | `http://localhost:8000` |
| Prod | Set by `PUBLIC_VERIFY_BASE_URL` env var |

## Auth

All endpoints (except `/api/health*`, `/api/public/*`, `/api/webhooks/*`) require:
```
Authorization: Bearer <JWT>
```

### Dev Mode Tokens
In `AUTH_MODE=dev`, obtain a token via:
```
POST /api/v1/auth/dev-login
{"role": "student"}   # or faculty | admin | canteen
```

## Authorization Matrix

| Endpoint Group | student | faculty | admin | canteen |
|---|---|---|---|---|
| `/api/v1/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/students/me` | ✅ own | ❌ | ✅ all | ❌ |
| `/api/v1/academics/courses/me` | ✅ own | ❌ | ✅ | ❌ |
| `/api/v1/attendance/mark` | ✅ | ❌ | ❌ | ❌ |
| `/api/v1/attendance/sessions` (create) | ❌ | ✅ own courses | ✅ | ❌ |
| `/api/v1/attendance/{id}/override` | ❌ | ✅ own courses | ✅ | ❌ |
| `/api/v1/fees/invoices/me` | ✅ own | ❌ | ✅ all | ❌ |
| `/api/v1/fees/invoices/{id}/pay` | ✅ own | ❌ | ✅ | ❌ |
| `/api/v1/canteen/menu` | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/canteen/orders` (POST) | ✅ | ❌ | ❌ | ❌ |
| `/api/v1/canteen/orders/{id}/status` (PATCH) | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/certificates` (POST) | ✅ | ❌ | ❌ | ❌ |
| `/api/v1/certificates/{id}/approve` | ❌ | ❌ | ✅ | ❌ |
| `/api/v1/helpdesk/tickets` | ✅ own | ❌ | ✅ all | ❌ |
| `/api/v1/analytics/*` | ❌ | ❌ | ✅ | ❌ |
| `/api/v1/analytics/audit-logs` | ❌ | ❌ | ✅ | ❌ |
| `/api/ai/chat` | ✅ | ✅ | ✅ | ❌ |
| `/api/public/certificates/verify` | public | public | public | public |

## Error Format

All errors follow:
```json
{
  "error": {
    "code": "not_found",
    "message": "Human-readable description.",
    "details": {}
  }
}
```

## Standard Headers

| Header | Direction | Description |
|---|---|---|
| `Authorization: Bearer <token>` | Request | JWT auth |
| `X-Request-Id` | Both | UUID per request, echoed in response |
| `X-Total-Count` | Response | Total record count for paginated list endpoints |

## Pagination

List endpoints accept `?limit=20&offset=0` query params.
Response includes `X-Total-Count` header with the total matching row count.

## Phase Implementation Status

| Phase | Endpoints | Status |
|---|---|---|
| 0 | `GET /api/health`, `GET /api/health/ready`, `POST /api/ai/chat` (stub), `POST /api/ai/classify-ticket` (heuristic) | ✅ |
| 1 | `POST /api/v1/auth/login`, `POST /api/v1/auth/dev-login`, `GET /api/v1/auth/me` | ⬜ |
| 2 | DB migrations + seed | ⬜ |
| 3 | Student dashboard reads | ⬜ |
| 4 | Fees + payments | ⬜ |
| 5 | Helpdesk + classifier | ⬜ |
| 6 | Certificates + verify | ⬜ |
| 7 | CampusAI tool calls | ⬜ |
| 8 | Smart Attend | ⬜ |
| 9 | Canteen + wallet | ⬜ |
| 10 | Notifications + transport | ⬜ |
| 11 | Admin analytics | ⬜ |
| 12 | ML early-warning | ⬜ |
