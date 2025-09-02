# FastAPI RAG Assistant - Template

A Retrieval-Augmented Generation (RAG) system built with FastAPI, designed to power AI portfolio assistants. This system provides intelligent, context-aware responses based on professional background, experience, and projects.

## 🚀 Features

- **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **Vector Search**: ChromaDB for semantic similarity search
- **OpenAI Integration**: GPT-4o-mini for intelligent response generation
- **Document Ingestion**: Web UI for uploading and managing documents
- **Async Architecture**: High-performance async/await patterns
- **CORS Support**: Cross-origin resource sharing for web integration

## 🏗️ Architecture

```
fastapi-rag/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application & endpoints
│   ├── rag.py           # RAG logic (chunking, embeddings, retrieval)
│   └── chroma_db.py     # ChromaDB vector database management
├── docs/
│   └── templates/       # Generic document templates (not personal)
├── pyproject.toml       # UV dependency management
├── env.example          # Environment variables template
└── README.template.md   # This template file
```

## 🛠️ Tech Stack

- **Backend**: FastAPI, Uvicorn
- **Database**: ChromaDB (local vector database)
- **AI/ML**: OpenAI GPT-4o-mini, text-embedding-ada-002
- **Async**: asyncpg, httpx
- **Documentation**: Markdown processing
- **Package Management**: UV

## 📋 Prerequisites

- Python 3.9+
- OpenAI API key
- ElevenLabs API key (optional, for voice features)
- UV package manager

## 🚀 Quick Start

### 1. Install UV (if not already installed)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Clone and setup
```bash
git clone <repository-url>
cd fastapi-rag
uv sync
```

### 3. Environment Configuration
```bash
cp env.example .env
# Edit .env with your actual values
```

### 4. Start the API
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📖 API Usage

### Health Check
```bash
curl http://localhost:8000/health
```

### Ask a Question (Streaming)
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is your experience with data engineering?"}'
```

### Interactive API Documentation
Visit `http://localhost:8000/docs` for Swagger UI documentation.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-ada-002` |
| `GENERATION_MODEL` | OpenAI generation model | `gpt-4o-mini` |
| `RAG_NAMESPACE` | Document namespace | `portfolio` |
| `TOP_K` | Number of context chunks | `6` |
| `MAX_TOKENS` | Max response tokens | `600` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 📚 Document Management

### Adding Documents via Web UI
1. **Start the server** and visit `/rag-manager` endpoint
2. **Upload documents** through the drag-and-drop interface
3. **Documents are automatically** chunked and embedded
4. **No personal documents** stored in repository
5. **Manage your knowledge base** with the intuitive UI

### Document Management Features
- **Drag & Drop Upload**: Easy file upload with visual feedback
- **Multiple Formats**: Support for .md, .txt, and .pdf files
- **Real-time Processing**: Automatic chunking and embedding
- **Document Management**: View, delete, and manage uploaded files
- **System Operations**: Re-ingest, reset, and monitor collection
- **Statistics Dashboard**: Real-time collection metrics

### Document Format
Documents should be in Markdown format. The system automatically:
- Splits content into semantic chunks
- Generates embeddings for each chunk
- Stores metadata about the document

## 🔍 RAG Process

1. **Query Processing**: User question is received
2. **Embedding**: Question is converted to vector embedding
3. **Retrieval**: Similar document chunks are retrieved using vector similarity
4. **Context Building**: Retrieved chunks are formatted as context
5. **Generation**: GPT model generates response using context
6. **Streaming**: Response is streamed back to client

## 🧪 Development

### Install Development Dependencies
```bash
uv sync --extra dev
```

### Code Formatting
```bash
uv run black .
uv run isort .
```

### Linting
```bash
uv run flake8 .
```

### Testing
```bash
uv run pytest
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install uv
RUN uv sync --frozen

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Considerations
- Use proper database connection pooling
- Implement rate limiting
- Add authentication/authorization
- Set up monitoring and logging
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
- Create an issue in the repository
- Contact: your.email@example.com

## 🔗 Related Projects

- [Portfolio Website](https://yourusername.github.io)
- [GitHub Profile](https://github.com/yourusername)

## 🔒 Security Features

- **No personal documents** stored in repository
- **Template-based approach** for open source
- **Environment-based configuration** for sensitive data
- **Secure API key management** via environment variables

## 📝 Important Notes

- **This is a template** - customize for your needs
- **Documents are ingested via UI** - not stored in repo
- **Personal information** should be added through the system
- **Repository stays clean** and template-ready
