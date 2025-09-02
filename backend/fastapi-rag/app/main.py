import os
import json
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

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

# Mount static files for RAG manager UI
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    status = "healthy" if oclient else "unhealthy"
    message = "Service is running" if oclient else "OpenAI API key not configured"
    
    return {
        "status": status, 
        "service": "my-rag",
        "message": message,
        "openai_configured": oclient is not None
    }


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the portfolio chat interface HTML."""
    try:
        with open("portfolio_chat.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Portfolio chat interface not found</h1>", status_code=404)

@app.get("/rag-manager", response_class=HTMLResponse)
async def rag_manager():
    """Serve the RAG document manager UI."""
    try:
        with open("app/static/rag_manager.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>RAG Manager not found</h1>", status_code=404)


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "message": "Miguel's RAG Assistant API",
        "version": "1.0.0",
        "vector_db": "ChromaDB (Local)",
        "openai_configured": oclient is not None,
        "endpoints": {
            "GET /": "Test chat interface",
            "GET /rag-manager": "RAG document manager UI",
            "POST /ask": "Streaming RAG question answering",
            "POST /upload-document": "Upload document to RAG",
            "GET /documents": "List uploaded documents",
            "DELETE /documents/{id}": "Delete document",
            "POST /reingest": "Re-ingest all documents",
            "POST /reset-collection": "Reset collection",
            "GET /collection-info": "Get collection statistics",
            "GET /health": "Health check",
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
            
            print(f"🤖 Generated response: {full}")
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


# Document Management Endpoints
@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document to the RAG system."""
    try:
        from .document_manager import document_manager
        result = await document_manager.upload_document(file)
        return result
    except Exception as e:
        raise HTTPException(500, f"Error uploading document: {str(e)}")


@app.get("/documents")
async def list_documents():
    """Get list of all uploaded documents."""
    try:
        from .document_manager import document_manager
        documents = await document_manager.get_documents()
        return documents
    except Exception as e:
        raise HTTPException(500, f"Error listing documents: {str(e)}")


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a specific document."""
    try:
        from .document_manager import document_manager
        success = await document_manager.delete_document(doc_id)
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(404, "Document not found")
    except Exception as e:
        raise HTTPException(500, f"Error deleting document: {str(e)}")


@app.post("/reingest")
async def reingest_documents():
    """Re-ingest all documents."""
    try:
        from .document_manager import document_manager
        result = await document_manager.reingest_all()
        return result
    except Exception as e:
        raise HTTPException(500, f"Error re-ingesting documents: {str(e)}")


@app.post("/reset-collection")
async def reset_collection():
    """Reset the entire collection."""
    try:
        from .document_manager import document_manager
        result = await document_manager.reset_collection()
        return result
    except Exception as e:
        raise HTTPException(500, f"Error resetting collection: {str(e)}")


@app.get("/collection-info")
async def get_collection_info():
    """Get collection statistics."""
    try:
        from .document_manager import document_manager
        stats = await document_manager.get_collection_stats()
        return stats
    except Exception as e:
        raise HTTPException(500, f"Error getting collection info: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)