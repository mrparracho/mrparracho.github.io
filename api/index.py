import sys
import os

# Add the backend path to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'fastapi-rag'))

# Import your existing FastAPI app
from app.main import app

# Vercel will automatically serve this
handler = app
