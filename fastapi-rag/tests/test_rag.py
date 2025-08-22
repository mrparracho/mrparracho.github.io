import pytest
from app.rag import chunk_markdown, build_user_prompt


def test_chunk_markdown():
    """Test markdown chunking functionality."""
    text = "This is sentence one. This is sentence two. This is a longer sentence that should be split appropriately."
    chunks = chunk_markdown(text, max_len=50)
    
    assert len(chunks) > 0
    assert all(len(chunk) <= 50 for chunk in chunks)


def test_build_user_prompt():
    """Test user prompt building."""
    question = "What is your experience?"
    contexts = ["Context 1", "Context 2"]
    
    prompt = build_user_prompt(question, contexts)
    
    assert "Context:" in prompt
    assert "Question: What is your experience?" in prompt
    assert "Answer as Miguel." in prompt
    assert "[[CTX 1]]" in prompt
    assert "[[CTX 2]]" in prompt


def test_chunk_markdown_empty():
    """Test chunking with empty text."""
    chunks = chunk_markdown("")
    assert chunks == []


def test_chunk_markdown_single_sentence():
    """Test chunking with a single sentence."""
    text = "This is a single sentence."
    chunks = chunk_markdown(text)
    assert len(chunks) == 1
    assert chunks[0] == text
