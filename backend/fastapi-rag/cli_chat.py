#!/usr/bin/env python3
"""
CLI chat interface for testing the RAG system.
"""

import asyncio
import json
import sys
from typing import List, Tuple
import aiohttp
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RAGCLI:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def ask_question(self, question: str) -> str:
        """Ask a question and get a streaming response."""
        try:
            async with self.session.post(
                f"{self.base_url}/ask",
                json={"question": question},
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    return f"Error {response.status}: {error_text}"
                
                full_response = ""
                contexts = []
                
                async for line in response.content:
                    line = line.decode('utf-8').strip()
                    if not line:
                        continue
                    
                    # Handle Server-Sent Events format
                    if line.startswith('event: '):
                        event_type = line[7:]  # Extract event type
                        continue
                    
                    if line.startswith('data: '):
                        try:
                            data = json.loads(line[6:])
                            
                            if 'snippets' in data:
                                contexts = data['snippets']
                                print(f"\n🔍 Found {len(contexts)} relevant context sources:")
                                for i, (ctx, score) in enumerate(contexts):
                                    print(f"  {i+1}. Score: {score:.3f} | {ctx[:80]}...")
                                print()
                            
                            elif 'token' in data:
                                token = data['token']
                                print(token, end='', flush=True)
                                full_response += token
                            
                            elif 'text' in data:
                                # Final response
                                print("\n")
                                return full_response
                                
                        except json.JSONDecodeError:
                            continue
                
                return full_response
                
        except Exception as e:
            return f"Connection error: {e}"
    
    async def health_check(self) -> bool:
        """Check if the RAG service is healthy."""
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Service healthy: {data}")
                    return True
                else:
                    print(f"❌ Service unhealthy: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Cannot connect to service: {e}")
            return False

async def main():
    """Main CLI function."""
    print("🤖 Miguel's RAG Assistant - CLI Interface")
    print("=" * 50)
    
    # Check if service is running
    async with RAGCLI() as rag:
        if not await rag.health_check():
            print("\n❌ Please start the RAG service first:")
            print("   cd backend/fastapi-rag")
            print("   python -m app.main")
            print("\nOr with uv:")
            print("   uv run python -m app.main")
            return
        
        print("\n💡 Ask me anything about Miguel's experience, projects, or background!")
        print("   Type 'quit' or 'exit' to leave, 'help' for commands")
        print("-" * 50)
        
        while True:
            try:
                question = input("\n❓ You: ").strip()
                
                if question.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                
                if question.lower() in ['help', 'h']:
                    print("\n�� Available commands:")
                    print("  help, h     - Show this help")
                    print("  quit, exit, q - Exit the chat")
                    print("  health      - Check service health")
                    print("  clear       - Clear the screen")
                    continue
                
                if question.lower() == 'health':
                    await rag.health_check()
                    continue
                
                if question.lower() == 'clear':
                    os.system('clear' if os.name == 'posix' else 'cls')
                    continue
                
                if not question:
                    continue
                
                print("\n�� Miguel: ", end='', flush=True)
                response = await rag.ask_question(question)
                
                if not response:
                    print("(No response received)")
                
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except EOFError:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)
