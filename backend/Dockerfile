# SmartUni.Ai — Multi-stage Dockerfile
# Stage 1: builder  — installs dependencies into a virtualenv
# Stage 2: runtime  — lean image, non-root user, Gunicorn + Uvicorn workers

# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build deps for psycopg, argon2, Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies into an isolated venv
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn==23.0.0

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Only the runtime shared libraries (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source (respects .dockerignore)
COPY . .

# Non-root user for security
RUN groupadd --system smartuni && useradd --system --gid smartuni smartuni

# Create local storage directory owned by app user
RUN mkdir -p /app/data/uploads && chown -R smartuni:smartuni /app/data

USER smartuni

EXPOSE 8000

# Health check — hits the lightweight /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Startup: apply DB migrations then launch Gunicorn with Uvicorn workers
# WEB_CONCURRENCY controls worker count (default 2; set via env in compose/k8s)
CMD ["sh", "-c", \
    "alembic upgrade head && \
     gunicorn app.main:app \
       --worker-class uvicorn.workers.UvicornWorker \
       --workers ${WEB_CONCURRENCY:-2} \
       --bind 0.0.0.0:${PORT:-8000} \
       --timeout 120 \
       --graceful-timeout 30 \
       --keep-alive 5 \
       --access-logfile - \
       --error-logfile -"]
