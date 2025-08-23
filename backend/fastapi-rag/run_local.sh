#!/bin/bash

# Local Development Script for RAG + HTML Interface
# This script runs both the RAG API and serves the HTML interface locally

echo "🚀 Starting Local RAG Development Environment..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    pkill -f "uv run python -m app.main"
    pkill -f "python -m http.server"
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

echo "📦 Starting RAG API on http://localhost:8001..."
echo "   - Health check: http://localhost:8001/health"
echo "   - API docs: http://localhost:8001/docs"
echo ""

# Start RAG API in background
uv run python -m app.main &
RAG_PID=$!

# Wait a moment for RAG API to start
sleep 3

echo "🌐 Starting HTML server on http://localhost:3000..."
echo "   - Chat interface: http://localhost:3000/chat_interface.html"
echo ""

# Start HTML server in background
python -m http.server 3000 &
HTML_PID=$!

echo "✅ Both services are running!"
echo ""
echo "🔗 Access your chat interface at: http://localhost:3000/chat_interface.html"
echo "🔗 RAG API is running at: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait $RAG_PID $HTML_PID
