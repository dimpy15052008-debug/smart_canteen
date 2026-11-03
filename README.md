# 🎓 SmartUni.Ai — Next-Gen AI-Powered University Ecosystem

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.4-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**SmartUni.Ai** is an all-in-one, intelligent university management and student copilot system. It combines a stunning, modern React 19 web application with an interactive **3D Campus AI Assistant** (powered by Google Gemini & ElevenLabs) and a high-performance **FastAPI backend** for automated campus operations, predictive student analytics, and digital services.

</div>

---

## 🌟 Key Features

### 🤖 3D Interactive Campus AI Copilot
- **3D Canvas & Avatar**: Interactive WebGL avatar built with Three.js that dynamically reacts to user prompts and campus context.
- **Google Gemini Integration**: Tool-calling assistant that retrieves realtime attendance, grades, fee dues, library books, and schedule queries.
- **Emotion & Voice Engine**: Realistic speech output integrated with ElevenLabs TTS and dynamic emotional state modeling.

### 📊 Student & Faculty Portals
- **Smart Attendance Tracking**: Automated facial biometrics verification and attendance analytics with subject-wise threshold alerts.
- **Academics & Exams**: GPA tracking, semester breakdown, exam schedules, hall tickets, and course resource downloads.
- **Fees & Financial Management**: Fee breakdowns, online payment gateway simulation, receipt generation, and reminder alerts.
- **Smart Canteen & QR Ordering**: Live menu browsing, cart management, digital wallet checkout, and order status updates.
- **Helpdesk & Ticket Classifier**: Automated ticket creation, AI issue classification, SLA escalation, and resolution tracking.
- **Digital Certificates**: Instantly verifiable digital degrees, transcripts, and event certificates with QR verification links.
- **Transport & Hostel Management**: Live bus location tracking, hostel room allocation status, and gate pass requests.

### 🛡️ Production Python Backend (`/backend`)
- **FastAPI Modular Monolith**: Microservice-ready architecture with clean separation between routers, services, and schemas.
- **ML Early Warning System**: Predictive machine learning models (Logistic Regression + Random Forest) for early detection of at-risk students.
- **PostgreSQL & Supabase Integration**: SQLAlchemy 2.0 ORM, Row Level Security (RLS) policies, and Alembic database migrations.
- **Security & RBAC**: JWT authentication, fine-grained role-based access control, security headers, and request rate limiting.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 19 SPA (Vite + TypeScript)                      │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ 3D Campus AI Assistant│  │  Student Portal  │  │ Admin Analytics │  │
│  │ Three.js + Gemini API │  │  React + Tailwind│  │ Recharts + Motion│  │
│  └───────────┬───────────┘  └────────┬─────────┘  └────────┬────────┘  │
└──────────────│───────────────────────│─────────────────────│───────────┘
               │                       │                     │
               ▼                       ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Express / Vite Server (port 5173/3000)               │
│                                or                                      │
│                  FastAPI Backend (Python, port 8000)                    │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Gemini Tool Loop    │  │ Business Services│  │ ML Early-Warning│  │
│  │  Ticket Classifier    │  │ Auth/Attendance/ │  │ LogisticReg/    │  │
│  │  Voice / Emotion Engine│ │ Fees/Canteen/Cert│  │ RandomForest    │  │
│  └───────────┬───────────┘  └────────┬─────────┘  └────────┬────────┘  │
└──────────────│───────────────────────│─────────────────────│───────────┘
               │                       │                     │
               ▼                       ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 / Supabase Database                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.12+ for backend)
- **npm** or **bun**

---

### 1. Frontend & Demo Server

1. **Clone the repository:**
   ```bash
   git clone https://github.com/faizanzafarali385-star/SmartUni.Ai.git
   cd SmartUni.Ai
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here  # Optional for voice
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173` or `http://localhost:3000`.

5. *(Optional)* **Ingest University Knowledge Base:**
   ```bash
   npm run ingest
   ```

---

### 2. Python FastAPI Backend (`/backend`)

To run the full production Python backend:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment & install dependencies:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and configure your database and authentication credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run Database Migrations & Seed Data:**
   ```bash
   alembic upgrade head
   python -m app.seed.seed_demo
   ```

5. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Interactive API Docs: `http://localhost:8000/docs`
   - OpenAPI Schema: `http://localhost:8000/openapi.json`

---

## 📁 Repository Structure

```
SmartUni.Ai/
├── src/
│   ├── components/       # UI components (Attendance, Academics, CampusAI, Canteen, Fees, etc.)
│   ├── context/          # React Context (AppContext)
│   ├── data/             # Knowledge base & mock datasets
│   ├── hooks/            # Custom hooks (useMotionPreset, etc.)
│   ├── pages/            # Showcase & specialized views
│   ├── types/            # TypeScript interfaces and types
│   ├── utils/            # Audio & Emotion engine utilities
│   ├── App.tsx           # Main application routing & layout
│   └── main.tsx          # Application entry point
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── core/         # Security, Auth, Logging, Rate Limiting
│   │   ├── db/           # Database sessions & models
│   │   ├── models/       # SQLAlchemy 2.0 schemas
│   │   ├── schemas/      # Pydantic v2 validation models
│   │   ├── services/     # Business logic & ML early warning
│   │   └── main.py       # FastAPI application factory
│   ├── alembic/          # Database migration scripts
│   └── tests/            # End-to-end integration test suite
├── docs/                 # System architecture, API specs, & design system documentation
├── server.ts             # Express + Vite server script
├── vite.config.ts        # Vite build configuration
└── README.md             # Project overview & guide
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key for Campus AI Assistant | `AIzaSy...` |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API Key for voice synthesis | `sk_...` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql+psycopg://user:pass@localhost:5432/smartuni` |
| `AUTH_MODE` | Auth backend mode (`dev` or `supabase`) | `dev` |
| `JWT_SECRET` | JWT secret key for development auth | `32-byte hex string` |
| `PORT` | Backend server port | `8000` |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Made with ❤️ for modern smart universities.
</div>
