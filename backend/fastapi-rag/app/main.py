import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.responses import HTMLResponse

# Load environment variables first
load_dotenv()

# Check if running in Vercel
IS_VERCEL = os.getenv("VERCEL") or os.getenv("VERCEL_ENV")
if IS_VERCEL:
    print("🚀 Running in Vercel serverless environment")
else:
    print("🏠 Running in local environment")

app = FastAPI(title="Miguel's RAG Assistant", version="1.0.0")

# Check if OpenAI API key is available
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("⚠️  Warning: OPENAI_API_KEY not found in environment variables")
    print("   The /ask endpoint will not work without it")
    oclient = None
else:
    from openai import AsyncOpenAI
    oclient = AsyncOpenAI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # HTML server
        "http://localhost:8000",  # Portfolio page
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:8000",  # Alternative portfolio
        "*"  # Fallback for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify deployment."""
    return {
        "message": "API is working!",
        "environment": "Vercel" if IS_VERCEL else "Local",
        "openai_configured": oclient is not None,
        "timestamp": "2024-01-27T14:40:00Z"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    status = "healthy" if oclient else "unhealthy"
    message = "Service is running" if oclient else "OpenAI API key not configured"
    
    return {
        "status": status, 
        "service": "miguel-rag",
        "message": message,
        "openai_configured": oclient is not None
    }


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the portfolio chat interface HTML."""
    try:
        # Try multiple possible paths for the HTML file in different environments
        possible_paths = [
            "portfolio_chat.html",
            "backend/fastapi-rag/portfolio_chat.html",
            "../portfolio_chat.html",
            "/var/task/backend/fastapi-rag/portfolio_chat.html",  # Vercel serverless path
            "/tmp/portfolio_chat.html"  # Fallback
        ]
        
        for path in possible_paths:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    html_content = f.read()
                print(f"✅ Successfully loaded HTML from: {path}")
                return HTMLResponse(content=html_content)
            except FileNotFoundError:
                print(f"❌ File not found at: {path}")
                continue
            except Exception as e:
                print(f"⚠️ Error reading {path}: {str(e)}")
                continue
        
        # If file not found, return a simple message
        return HTMLResponse(
            content="<h1>Chat interface not available</h1><p>HTML file not found in serverless environment</p>", 
            status_code=404
        )
    except Exception as e:
        return HTMLResponse(
            content=f"<h1>Error loading interface</h1><p>{str(e)}</p>", 
            status_code=500
        )


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "message": "Miguel's RAG Assistant API",
        "version": "1.0.0",
        "environment": "Vercel Serverless" if IS_VERCEL else "Local",
        "vector_db": "ChromaDB (In-Memory)" if IS_VERCEL else "ChromaDB (Local)",
        "openai_configured": oclient is not None,
        "endpoints": {
            "GET /": "Test chat interface",
            "GET /test": "Simple test endpoint",
            "POST /ask": "Streaming RAG question answering",
            "GET /health": "Health check",
            "GET /api": "API information",
            "GET /docs": "API documentation"
        }
    }


@app.post("/ask")
async def ask(payload: dict):
    """Streaming endpoint for RAG-based question answering."""
    if not oclient:
        raise HTTPException(500, "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
    
    question = (payload or {}).get("question")
    if not question:
        raise HTTPException(400, "Missing question")

    try:
        print(f"🔍 Processing question: {question}")
        
        # Import here to avoid startup errors
        print("📦 Importing RAG modules...")
        from .rag import retrieve, build_user_prompt, SYSTEM_PROMPT, GENERATION_MODEL
        print("✅ RAG modules imported successfully")
        
        # Get contexts from RAG system
        print("🔍 Retrieving contexts...")
        contexts = await retrieve(question)
        print(f"✅ Retrieved {len(contexts)} contexts")
        
        context_texts = [c for c, _ in contexts]

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(question, context_texts)},
        ]

        print("🤖 Generating response...")
        
        async def sse_stream():
            # Send context information
            yield "event: context\n".encode()
            yield f"data: {json.dumps({'snippets': contexts})}\n\n".encode()

            # Stream the response
            stream = await oclient.chat.completions.create(
                model=GENERATION_MODEL,
                messages=messages,
                temperature=0.4,
                stream=True,
                max_tokens=int(os.getenv("MAX_TOKENS", "600")),
            )

            full = ""
            async for part in stream:
                token = part.choices[0].delta.content or ""
                if token:
                    full += token
                    yield b"event: token\n"
                    yield f"data: {{\"token\": {json.dumps(token)}}}\n\n".encode()
            
            # Send completion event
            yield b"event: done\n"
            yield f"data: {{\"text\": {json.dumps(full)}}}\n\n".encode()

        headers = {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            # Let the CORS middleware handle this
            # "Access-Control-Allow-Origin": os.getenv("CORS_ORIGIN", "*")
        }
        return StreamingResponse(sse_stream(), headers=headers)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        raise HTTPException(500, f"RAG system not ready: {e}")
    except Exception as e:
        print(f"❌ General error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Error processing question: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)