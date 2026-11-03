"""Export OpenAPI spec to docs/openapi.json.

Usage: python scripts/export_openapi.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

spec = app.openapi()
out = Path(__file__).resolve().parents[1] / "docs" / "openapi.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(spec, indent=2))
print(f"OpenAPI spec written to {out}")
