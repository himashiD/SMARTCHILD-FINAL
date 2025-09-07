from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from main import get_answer

# ────────────── Initialize FastAPI ──────────────
app = FastAPI(
    title="SmartChild Chatbot API",
    description="AI-powered child health assistant for SmartChild project",
    version="1.0.0"
)

# ────────────── Request / Response Models ──────────────
class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str
    context: str

# ────────────── Routes ──────────────
@app.get("/")
async def root():
    return {"message": "✅ SmartChild Chatbot API is running"}

@app.post("/ask", response_model=ChatResponse)
async def ask_chatbot(req: ChatRequest):
    """
    Accepts a user question + optional chat history.
    Returns AI answer and retrieved context.
    """
    try:
        # Convert history to dicts
        history_dicts: List[Dict[str, str]] = [
            {"role": msg.role, "content": msg.content} for msg in req.history
        ]

        # Call main.py logic
        answer, context = get_answer(req.question, history_dicts)

        return ChatResponse(answer=answer, context=context)

    except Exception as e:
        return ChatResponse(answer="⚠️ An error occurred.", context=str(e))

# ────────────── Run with uvicorn ──────────────
# Command: uvicorn chatbot_api:app --host 0.0.0.0 --port 8000 --reload
