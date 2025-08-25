#!/bin/bash

# install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
export PATH="$HOME/.local/bin:$PATH"

# cd to the backend/fastapi-rag directory
cd backend/fastapi-rag

# install dependencies
uv sync

# run the app
uv run python scripts/reset_collection.py

# run the app
nohup uv run uvicorn app.main:app --host 0.0.0.0 --port 8001 &