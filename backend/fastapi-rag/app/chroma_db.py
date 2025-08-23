import os
import chromadb
from chromadb.config import Settings
from typing import List, Tuple, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class ChromaDBManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="./chroma_db",  # Local storage directory
            settings=Settings(
                anonymized_telemetry=False,  # Disable telemetry
                allow_reset=True
            )
        )
        
        # Get or create collection with explicit dimensions
        try:
            # Try to get existing collection
            self.collection = self.client.get_collection(name="miguel_documents")
            print(f"📚 Using existing collection: {self.collection.name}")
        except:
            # Create new collection with explicit dimensions
            print("🆕 Creating new collection...")
            self.collection = self.client.create_collection(
                name="miguel_documents",
                metadata={"description": "Miguel's RAG document collection"}
            )
            print(f"✅ Created new collection: {self.collection.name}")
    
    async def upsert_documents(self, doc_id: str, chunks: List[str], metadata: Dict[str, Any]):
        """Upsert document chunks into ChromaDB."""
        if not chunks:
            return
        
        # Generate embeddings for the chunks
        from .rag import embed
        embeddings = await embed(chunks)
        
        # Prepare data for ChromaDB
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "doc_id": doc_id,
                "chunk_id": i,
                "filename": metadata.get("filename", ""),
                "file_size": metadata.get("file_size", 0),
                "chunk_count": metadata.get("chunk_count", 0)
            }
            for i in range(len(chunks))
        ]
        
        # Upsert to ChromaDB with embeddings
        self.collection.upsert(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        print(f"✅ Upserted {len(chunks)} chunks for {doc_id}")
    
    async def search_similar(self, query_embedding: List[float], top_k: int = 6) -> List[Tuple[str, float]]:
        """Search for similar documents using vector similarity."""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results: (content, similarity_score)
        documents = results["documents"][0]
        distances = results["distances"][0]
        
        # Convert distance to similarity score (1 - distance)
        similarities = [(doc, 1 - dist) for doc, dist in zip(documents, distances)]
        return similarities
    
    async def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection."""
        count = self.collection.count()
        return {
            "total_documents": count,
            "collection_name": self.collection.name
        }
    
    async def reset_collection(self):
        """Reset the collection (useful for testing)."""
        try:
            self.client.delete_collection("miguel_documents")
            print("🗑️  Deleted existing collection")
        except:
            print("ℹ️  No existing collection to delete")
        
        # Create new collection
        self.collection = self.client.create_collection(
            name="miguel_documents",
            metadata={"description": "Miguel's RAG document collection"}
        )
        print("✅ Created new collection")

# Global instance
chroma_manager = ChromaDBManager()
