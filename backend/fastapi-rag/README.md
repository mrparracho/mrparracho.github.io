# FastAPI RAG Assistant

A Retrieval-Augmented Generation (RAG) system built with FastAPI, designed to power Miguel's AI portfolio assistant. This system provides intelligent, context-aware responses based on Miguel's professional background, experience, and projects.

## 🚀 Features

- **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **Vector Search**: PostgreSQL with pgvector for semantic similarity search
- **OpenAI Integration**: GPT-4o-mini for intelligent response generation
- **Document Chunking**: Intelligent markdown document processing
- **Async Architecture**: High-performance async/await patterns
- **CORS Support**: Cross-origin resource sharing for web integration

## 🏗️ Architecture

```
fastapi-rag/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application & endpoints
│   ├── rag.py           # RAG logic (chunking, embeddings, retrieval)
│   └── db.py            # Database connection management
├── scripts/
│   ├── schema.sql       # PostgreSQL schema with pgvector
│   └── ingest.py        # Document ingestion script
├── docs/
│   ├── cv.md            # Professional background
│   ├── projects.md      # Project portfolio
│   └── faq.md           # Frequently asked questions
├── pyproject.toml       # UV dependency management
├── env.example          # Environment variables template
└── README.md
```

## 🛠️ Tech Stack

- **Backend**: FastAPI, Uvicorn
- **Database**: PostgreSQL with pgvector extension
- **AI/ML**: OpenAI GPT-4o-mini, text-embedding-3-large
- **Async**: asyncpg, httpx
- **Documentation**: Markdown processing
- **Package Management**: UV

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 12+ with pgvector extension
- OpenAI API key
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

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb rag_db

# Install pgvector extension
psql rag_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run schema
psql rag_db -f scripts/schema.sql
```

### 5. Ingest Documents
```bash
uv run python scripts/ingest.py
```

### 6. Start the API
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
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-large` |
| `GENERATION_MODEL` | OpenAI generation model | `gpt-4o-mini` |
| `RAG_NAMESPACE` | Document namespace | `miguel` |
| `TOP_K` | Number of context chunks | `6` |
| `MAX_TOKENS` | Max response tokens | `600` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 📚 Document Management

### Adding New Documents
1. Place markdown files in the `docs/` directory
2. Run the ingestion script: `uv run python scripts/ingest.py`
3. Documents are automatically chunked and embedded

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
- Use proper PostgreSQL connection pooling
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
- Contact: miguel@example.com

## 🔗 Related Projects

- [Portfolio Website](https://mrparracho.github.io)
- [GitHub Profile](https://github.com/mrparracho)
