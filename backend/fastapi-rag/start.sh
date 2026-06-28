#!/bin/bash
set -euo pipefail

# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# install dependencies
uv sync

# Build the vector store from docs/. The ChromaDB index is a build artifact and
# is no longer committed to git, so it is (re)created from source on each deploy.
uv run python scripts/ingest.py

# Run the app. Render (and most PaaS) inject the port via $PORT.
uv run uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8001}"
