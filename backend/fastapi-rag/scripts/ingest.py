#!/usr/bin/env python3
"""
Document ingestion script for the RAG system.
Loads markdown files from docs/ directory and creates embeddings.
"""

import os
import glob
import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import AsyncOpenAI
import sys

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

from app.rag import chunk_markdown
from app.chroma_db import chroma_manager

# Load environment variables
load_dotenv()

# Configuration
client = AsyncOpenAI()
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")

async def main():
    """Main ingestion function."""
    print("🚀 Starting document ingestion with ChromaDB...")
    
    try:
        # Process markdown files
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
        
        print(f"🎉 Ingestion complete! Total chunks: {total_chunks}")
        
        # Show collection info
        info = await chroma_manager.get_collection_info()
        print(f"📊 ChromaDB collection: {info}")
        
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
