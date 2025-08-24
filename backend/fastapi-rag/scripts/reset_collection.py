#!/usr/bin/env python3
"""
Script to reset the ChromaDB collection and re-ingest documents.
"""

import asyncio
import sys
from pathlib import Path
import os

# Add the parent directory to Python path to find app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.chroma_db import chroma_manager
from app.rag import chunk_markdown
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def reset_and_reingest():
    """Reset the collection and re-ingest documents."""
    print("🔄 Resetting ChromaDB collection...")
    
    # Reset the collection
    await chroma_manager.reset_collection()
    print("✅ Collection reset complete")
    
    # Re-ingest documents
    print("📚 Re-ingesting documents...")
    
    docs_path = Path(__file__).parent.parent / "docs"
    markdown_files = list(docs_path.glob("*.md"))
    
    if not markdown_files:
        print(f"⚠️  No markdown files found in {docs_path}")
        return
    
    print(f"📁 Found {len(markdown_files)} markdown files")
    
    total_chunks = 0
    for file_path in markdown_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw_content = f.read()
            
            # Chunk the content
            chunks = chunk_markdown(raw_content)
            doc_id = file_path.stem
            meta = {
                "filename": file_path.name,
                "file_size": len(raw_content),
                "chunk_count": len(chunks)
            }
            
            # Upsert chunks to ChromaDB
            await chroma_manager.upsert_documents(doc_id, chunks, meta)
            total_chunks += len(chunks)
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"🎉 Re-ingestion complete! Total chunks: {total_chunks}")
    
    # Show collection info
    info = await chroma_manager.get_collection_info()
    print(f"📊 ChromaDB collection: {info}")

if __name__ == "__main__":
    asyncio.run(reset_and_reingest())
