-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    chunk_id INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding VECTOR(3072) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_namespace ON documents(namespace);
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_documents_doc_id ON documents(doc_id);

-- Create unique constraint to prevent duplicate chunks
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_unique_chunk 
ON documents(namespace, doc_id, chunk_id);

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Stores document chunks with embeddings for RAG system';
COMMENT ON COLUMN documents.namespace IS 'Namespace for organizing documents (e.g., user_id)';
COMMENT ON COLUMN documents.doc_id IS 'Original document identifier';
COMMENT ON COLUMN documents.chunk_id IS 'Chunk index within the document';
COMMENT ON COLUMN documents.content IS 'Text content of the chunk';
COMMENT ON COLUMN documents.metadata IS 'Additional metadata as JSON';
COMMENT ON COLUMN documents.embedding IS 'Vector embedding of the content';
