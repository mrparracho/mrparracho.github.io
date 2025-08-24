# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import asyncio
from typing import Optional

app = FastAPI()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    audio_url: Optional[str] = None

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(message: ChatMessage):
    try:
        # Configure your OpenAI client with your CV data
        prompt = f"""
        You are Miguel Parracho's AI assistant. Answer questions about his background based on this information:
        
        [Your CV data here]
        
        User question: {message.message}
        
        Respond as Miguel's knowledgeable assistant, providing helpful information about his experience, skills, and projects.
        """
        
        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",  # Use GPT-5 when available
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        
        ai_response = response.choices[0].message.content
        
        # Optional: Generate audio with ElevenLabs
        audio_url = await generate_voice_response(ai_response)
        
        return ChatResponse(response=ai_response, audio_url=audio_url)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_voice_response(text: str) -> Optional[str]:
    # Implement ElevenLabs voice cloning integration
    # Return URL to generated audio file
    pass