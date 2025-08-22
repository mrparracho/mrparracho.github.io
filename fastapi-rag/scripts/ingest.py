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
import asyncpg
from openai import AsyncOpenAI
from app.rag import chunk_markdown

# Load environment variables
load_dotenv()

# Configuration
client = AsyncOpenAI()
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
NAMESPACE = os.getenv("RAG_NAMESPACE", "miguel")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)


async def ensure_schema(conn):
    """Ensure the database schema exists."""
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    # Split and execute schema statements
    statements = schema_sql.split(";")
    for statement in statements:
        statement = statement.strip()
        if statement:
            await conn.execute(statement)
    
    print("✅ Database schema ensured")


async def embed(texts):
    """Generate embeddings for a list of texts."""
    if not texts:
        return []
    
    try:
        resp = await client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
        return [d.embedding for d in resp.data]
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")
        return []


async def upsert(conn, doc_id, chunks, meta):
    """Upsert document chunks into the database."""
    if not chunks:
        print(f"⚠️  No chunks for {doc_id}")
        return
    
    vectors = await embed(chunks)
    if not vectors:
        print(f"❌ Failed to generate embeddings for {doc_id}")
        return
    
    # Prepare batch insert
    values = []
    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        vec_literal = "[" + ",".join(str(x) for x in vector) + "]"
        values.append((NAMESPACE, doc_id, i, chunk, meta, vec_literal))
    
    # Batch insert with conflict handling
    await conn.executemany(
        """
        INSERT INTO documents(namespace, doc_id, chunk_id, content, metadata, embedding)
        VALUES($1, $2, $3, $4, $5, $6::vector)
        ON CONFLICT (namespace, doc_id, chunk_id) 
        DO UPDATE SET 
            content = EXCLUDED.content,
            metadata = EXCLUDED.metadata,
            embedding = EXCLUDED.embedding
        """,
        values
    )
    
    print(f"✅ Upserted {len(chunks)} chunks for {doc_id}")


async def main():
    """Main ingestion function."""
    print("🚀 Starting document ingestion...")
    
    # Connect to database
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    try:
        # Ensure schema exists
        await ensure_schema(conn)
        
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
                
                # Upsert chunks
                await upsert(conn, doc_id, chunks, meta)
                total_chunks += len(chunks)
                
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")
        
        print(f"🎉 Ingestion complete! Total chunks: {total_chunks}")
        
    finally:
        await conn.close()
        print("🔌 Database connection closed")


if __name__ == "__main__":
    asyncio.run(main())
