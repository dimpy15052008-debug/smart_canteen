# SmartUni.Ai Backend — Makefile
# Run from the backend/ directory.

.PHONY: dev migrate seed train test test-fast lint fmt typecheck security-check docker docker-clean help

PYTHON := python
UVICORN := uvicorn
ALEMBIC := alembic
PYTEST := pytest
RUFF := ruff

# ── Development server ────────────────────────────────────────────────────────
dev:
	@echo ">>> Starting FastAPI dev server on :8000..."
	$(UVICORN) app.main:app --host 0.0.0.0 --port 8000 --reload

# ── Database migrations ───────────────────────────────────────────────────────
migrate:
	@echo ">>> Running Alembic migrations..."
	$(ALEMBIC) upgrade head

migrate-new:
	@echo ">>> Creating new Alembic migration (autogenerate)..."
	$(ALEMBIC) revision --autogenerate -m "$(MSG)"

migrate-down:
	$(ALEMBIC) downgrade -1

# ── Seed demo data ────────────────────────────────────────────────────────────
seed:
	@echo ">>> Seeding demo data from campusData.ts..."
	$(PYTHON) -m app.seed.seed_demo

# ── Train ML models ───────────────────────────────────────────────────────────
train:
	@echo ">>> Training ML early-warning model..."
	$(PYTHON) scripts/train_models.py

# ── Tests ─────────────────────────────────────────────────────────────────────
test:
	@echo ">>> Running test suite..."
	$(PYTEST) tests/ -v --cov=app --cov-report=term-missing --cov-fail-under=70

test-fast:
	$(PYTEST) tests/ -v -x --no-cov

# ── Linting and formatting ────────────────────────────────────────────────────
lint:
	$(RUFF) check app/ tests/ scripts/
	$(RUFF) format --check app/ tests/ scripts/

fmt:
	$(RUFF) check --fix app/ tests/ scripts/
	$(RUFF) format app/ tests/ scripts/

# ── Type checking ─────────────────────────────────────────────────────────────
typecheck:
	@echo ">>> Running mypy type checker..."
	python -m mypy app/ --ignore-missing-imports

# ── Security audit ────────────────────────────────────────────────────────────
security-check:
	@echo ">>> Running pip-audit dependency vulnerability scan..."
	pip-audit -r requirements.txt --desc on 2>/dev/null || pip install pip-audit && pip-audit -r requirements.txt --desc on

# ── Docker ────────────────────────────────────────────────────────────────────
docker:
	docker compose up --build -d

docker-clean:
	docker compose down -v --remove-orphans

# ── Help ─────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "SmartUni.Ai Backend — Available commands:"
	@echo "  make dev             Start FastAPI dev server with --reload"
	@echo "  make migrate         Run Alembic migrations (alembic upgrade head)"
	@echo "  make migrate-new     Create a new migration (MSG='description')"
	@echo "  make seed            Seed database with demo data from campusData.ts"
	@echo "  make train           Train ML early-warning models"
	@echo "  make test            Run full test suite with coverage"
	@echo "  make test-fast       Run tests without coverage (faster)"
	@echo "  make lint            Run ruff linter + format check"
	@echo "  make fmt             Auto-fix lint issues and format code"
	@echo "  make typecheck       Run mypy type checker"
	@echo "  make security-check  Run pip-audit dependency vulnerability scan"
	@echo "  make docker          docker compose up --build"
	@echo "  make docker-clean    docker compose down -v"
	@echo ""
