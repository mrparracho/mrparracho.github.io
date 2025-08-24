#!/usr/bin/env python3
"""
Test script to check if all imports work correctly.
"""

import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

print("🧪 Testing imports...")

try:
    print("1. Testing ChromaDB import...")
    from app.chroma_db import chroma_manager
    print("   ✅ ChromaDB import successful")
except Exception as e:
    print(f"   ❌ ChromaDB import failed: {e}")

try:
    print("2. Testing RAG import...")
    # Import the module directly
    from app.rag import retrieve, build_user_prompt, SYSTEM_PROMPT, GENERATION_MODEL
    print("   ✅ RAG import successful")
    
    # Test if key functions exist
    if hasattr(retrieve, '__call__'):
        print("   ✅ retrieve function found")
    if hasattr(build_user_prompt, '__call__'):
        print("   ✅ build_user_prompt function found")
    if SYSTEM_PROMPT:
        print("   ✅ SYSTEM_PROMPT found")
        
except Exception as e:
    print(f"   ❌ RAG import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    print("3. Testing OpenAI import...")
    from openai import AsyncOpenAI
    print("   ✅ OpenAI import successful")
except Exception as e:
    print(f"   ❌ OpenAI import failed: {e}")

print("\n🎯 Import test complete!")
