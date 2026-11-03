# SmartUni.Ai — Demo Script

> **For judges, investors and evaluators.** This script walks through the 8 demo steps
> that prove end-to-end functionality of the platform.

## Prerequisites

```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY (or set LLM_PROVIDER=mock for offline demo)
make migrate seed
make dev        # starts FastAPI on :8000
# In another terminal, from the repo root:
npm run dev     # starts Vite+Express on :3000
```

Open http://localhost:3000 in a browser.

---

## Step 1 — Student Dashboard

1. The app opens with role = **Student** (Faizan Ali, Roll 0827CS221045, Sem 6 CSE)
2. Dashboard shows: CGPA 8.74, 5 courses, CS604 attendance **71.9% ⚠️ AT RISK**
3. Fee card shows ₹15,000 pending due 15 Oct 2026

---

## Step 2 — CampusAI: Fee Query

1. Click **CampusAI** tab → 3D avatar appears
2. Type or say: *"What are my pending fees?"*
3. CampusAI calls `get_fee_status` tool → reads real DB → replies with ₹15,000 due 15 Oct
4. `actionExecuted.type = "fee_lookup"` — UI shows the fee card panel

---

## Step 3 — Fee Payment

1. Click **Fees** tab → Semester 6 invoice shows ₹15,000 outstanding
2. Click **Pay Now** → enter ₹15,000 → gateway (mock or Razorpay test)
3. Invoice status changes to **Paid**, receipt PDF link appears
4. Notification: *"Fee Payment Successful 💳"*
5. Audit log row: `FEE_PAYMENT_PROCESSED`

---

## Step 4 — Helpdesk Complaint

1. Click **Helpdesk** → **New Ticket**
2. Subject: "Wi-Fi dropping in hostel Block B room 304"
3. Description: "DNS resolution fails every 15 minutes near access point in corridor 3"
4. Submit → AI classifies: **IT & Wi-Fi, High priority, 24h SLA, Frustrated**
5. Ticket number `TKT-2026-XXX` appears with SLA deadline

---

## Step 5 — Certificate → Admin Approve → Public Verify

1. Click **Certificates** → **Request Certificate**
2. Type: **Bonafide Certificate**, Purpose: "MP State Scholarship application"
3. Submit → eligibility check passes → status: `pending_verification`
4. Switch role to **Admin** (header role switcher) → Certificates dashboard
5. Click **Approve** → PDF generated, QR embedded, status: `ready_for_download`
6. Copy the verification URL from the QR → open in a new tab
7. Public verify page shows: **Valid ✅**, issue date, masked holder name, hash matches

---

## Step 6 — Canteen Order → Ready → QR Scan

1. Switch back to **Student** → click **Smart Canteen**
2. Add: Paneer Butter Masala Thali (₹130) + Cold Coffee (₹55) → Checkout
3. Order placed: Token **A-107**, status: `new`
4. Switch role to **Canteen** → Orders board shows the token
5. Click **Mark Preparing** → status: `preparing`
6. Click **Mark Ready** → student gets notification: *"Order Ready! 🍔"*
7. Click **Scan QR** → enter the QR value → order completes

---

## Step 7 — Smart Attend: Faculty → Student → Override

1. Switch role to **Faculty** (Prof. Rajesh Sharma)
2. Click **Smart Attend** → Start Session for **CS601**
3. Switch role to **Student** → Smart Attend tab shows active session
4. Click **Mark Attendance** → simulates geo (within 150m geofence) + face confidence
5. Status: **Present ✅**, audit row: `ATTENDANCE_VERIFIED_GEO_FACE`
6. Switch back to Faculty → session roster shows Faizan as Present
7. Click override on another student → add notes → status: `manual_override`
8. Audit row: `ATTENDANCE_MANUAL_OVERRIDE`

---

## Step 8 — Admin Analytics + Audit Trail

1. Switch role to **Admin** → click **Analytics**
2. See: attendance heatmap, helpdesk by category, fee collection vs dues, canteen revenue
3. Click **Audit Logs** → filter by action = `FEE_PAYMENT_PROCESSED`
4. All 8 demo actions are visible in the timeline

---

## Judge Tour

Click the **⭐ Judge Tour** button in the header to see an auto-guided walkthrough
of all key features with annotations.
