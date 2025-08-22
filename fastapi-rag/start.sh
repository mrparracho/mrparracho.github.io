#!/bin/bash

# FastAPI RAG Assistant Startup Script

echo "🚀 Starting FastAPI RAG Assistant..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Install dependencies if needed
if [ ! -d ".uv" ]; then
    echo "📦 Installing dependencies..."
    uv sync
fi

# Start the application
echo "🌐 Starting server on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo "🏥 Health check at http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
