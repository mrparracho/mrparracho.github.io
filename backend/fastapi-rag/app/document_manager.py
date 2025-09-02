"""
Document Manager for RAG System
Handles file uploads, document processing, and RAG operations
"""

import os
import uuid
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import aiofiles

from .rag import chunk_markdown, embed
from .chroma_db import chroma_manager

class DocumentManager:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        self.documents_db: Dict[str, Dict[str, Any]] = {}
        self.load_documents_db()
    
    def load_documents_db(self):
        """Load documents database from file."""
        db_file = Path("documents_db.json")
        if db_file.exists():
            try:
                import json
                with open(db_file, 'r') as f:
                    self.documents_db = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load documents database: {e}")
                self.documents_db = {}
    
    def save_documents_db(self):
        """Save documents database to file."""
        try:
            import json
            with open("documents_db.json", 'w') as f:
                json.dump(self.documents_db, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save documents database: {e}")
    
    async def upload_document(self, file: UploadFile) -> Dict[str, Any]:
        """Upload and process a document."""
        try:
            # Validate file type
            if not file.filename or not file.filename.lower().endswith(('.md', '.txt', '.pdf')):
                raise HTTPException(400, "Only .md, .txt, and .pdf files are supported")
            
            # Generate unique document ID
            doc_id = str(uuid.uuid4())
            
            # Save file
            file_path = self.upload_dir / f"{doc_id}_{file.filename}"
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Process document content
            if file.filename.lower().endswith('.pdf'):
                content_text = await self.extract_pdf_text(file_path)
            else:
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    content_text = await f.read()
            
            # Chunk the content
            chunks = chunk_markdown(content_text)
            
            # Generate embeddings
            embeddings = await embed(chunks)
            
            # Store in ChromaDB
            metadata = {
                "filename": file.filename,
                "file_size": len(content_text),
                "chunk_count": len(chunks),
                "upload_date": datetime.now().isoformat(),
                "file_path": str(file_path)
            }
            
            await chroma_manager.upsert_documents(doc_id, chunks, metadata)
            
            # Store document info
            self.documents_db[doc_id] = {
                "id": doc_id,
                "filename": file.filename,
                "file_size": len(content_text),
                "chunk_count": len(chunks),
                "upload_date": metadata["upload_date"],
                "file_path": str(file_path)
            }
            
            self.save_documents_db()
            
            return {
                "id": doc_id,
                "filename": file.filename,
                "chunk_count": len(chunks),
                "message": "Document uploaded and processed successfully"
            }
            
        except Exception as e:
            # Clean up on error
            if 'file_path' in locals():
                try:
                    os.remove(file_path)
                except:
                    pass
            raise HTTPException(500, f"Error processing document: {str(e)}")
    
    async def extract_pdf_text(self, file_path: Path) -> str:
        """Extract text from PDF file."""
        try:
            import PyPDF2
            text = ""
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except ImportError:
            raise HTTPException(500, "PDF processing requires PyPDF2. Install with: pip install PyPDF2")
        except Exception as e:
            raise HTTPException(500, f"Error extracting PDF text: {str(e)}")
    
    async def get_documents(self) -> List[Dict[str, Any]]:
        """Get list of all uploaded documents."""
        return list(self.documents_db.values())
    
    async def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get specific document by ID."""
        return self.documents_db.get(doc_id)
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document and its embeddings."""
        try:
            if doc_id not in self.documents_db:
                return False
            
            # Get document info
            doc_info = self.documents_db[doc_id]
            file_path = Path(doc_info["file_path"])
            
            # Remove from ChromaDB
            await chroma_manager.delete_document(doc_id)
            
            # Remove file
            if file_path.exists():
                os.remove(file_path)
            
            # Remove from database
            del self.documents_db[doc_id]
            self.save_documents_db()
            
            return True
            
        except Exception as e:
            print(f"Error deleting document {doc_id}: {e}")
            return False
    
    async def reingest_all(self) -> Dict[str, Any]:
        """Re-ingest all documents."""
        try:
            total_chunks = 0
            processed_docs = 0
            
            for doc_id, doc_info in self.documents_db.items():
                try:
                    file_path = Path(doc_info["file_path"])
                    if not file_path.exists():
                        continue
                    
                    # Read content
                    async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                        content = await f.read()
                    
                    # Re-chunk and embed
                    chunks = chunk_markdown(content)
                    embeddings = await embed(chunks)
                    
                    # Update metadata
                    metadata = {
                        "filename": doc_info["filename"],
                        "file_size": len(content),
                        "chunk_count": len(chunks),
                        "upload_date": doc_info["upload_date"],
                        "file_path": str(file_path),
                        "last_updated": datetime.now().isoformat()
                    }
                    
                    # Update in ChromaDB
                    await chroma_manager.upsert_documents(doc_id, chunks, metadata)
                    
                    # Update local database
                    doc_info["chunk_count"] = len(chunks)
                    doc_info["last_updated"] = metadata["last_updated"]
                    
                    total_chunks += len(chunks)
                    processed_docs += 1
                    
                except Exception as e:
                    print(f"Error re-ingesting document {doc_id}: {e}")
                    continue
            
            self.save_documents_db()
            
            return {
                "processed_documents": processed_docs,
                "total_chunks": total_chunks,
                "message": "Re-ingestion completed successfully"
            }
            
        except Exception as e:
            raise HTTPException(500, f"Error during re-ingestion: {str(e)}")
    
    async def reset_collection(self) -> Dict[str, Any]:
        """Reset the entire collection."""
        try:
            # Reset ChromaDB
            await chroma_manager.reset_collection()
            
            # Remove all uploaded files
            for doc_info in self.documents_db.values():
                file_path = Path(doc_info["file_path"])
                if file_path.exists():
                    try:
                        os.remove(file_path)
                    except:
                        pass
            
            # Clear documents database
            self.documents_db = {}
            self.save_documents_db()
            
            return {
                "message": "Collection reset successfully",
                "documents_removed": len(self.documents_db)
            }
            
        except Exception as e:
            raise HTTPException(500, f"Error resetting collection: {str(e)}")
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            chroma_info = await chroma_manager.get_collection_info()
            
            # Calculate total file size
            total_size = sum(doc["file_size"] for doc in self.documents_db.values())
            
            # Get last updated time
            last_updated = None
            if self.documents_db:
                dates = [doc.get("last_updated", doc["upload_date"]) for doc in self.documents_db.values()]
                last_updated = max(dates) if dates else None
            
            return {
                "total_documents": len(self.documents_db),
                "total_chunks": chroma_info.get("total_chunks", 0),
                "collection_size": total_size,
                "last_updated": last_updated,
                "chroma_info": chroma_info
            }
            
        except Exception as e:
            raise HTTPException(500, f"Error getting collection stats: {str(e)}")

# Global instance
document_manager = DocumentManager()
