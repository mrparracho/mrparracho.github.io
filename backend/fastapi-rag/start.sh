#!/bin/bash

# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# install dependencies
uv sync

# run the app
uv run python scripts/reset_collection.py

# run the app
uv run uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload