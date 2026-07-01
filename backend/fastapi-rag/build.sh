#!/bin/sh
set -eu

# Render provides uv, but install it if this script is run somewhere else.
if ! command -v uv >/dev/null 2>&1; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

uv sync --frozen

# Build the vector store from docs/. The ChromaDB index is a build artifact and
# is recreated from source on each deploy.
uv run python scripts/ingest.py
