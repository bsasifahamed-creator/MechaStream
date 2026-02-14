"""
API simple de prueba sin vLLM para verificar que FastAPI funciona
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

app = FastAPI(
    title="Simple Test API",
    description="API de prueba para verificar conectividad",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 100
    temperature: float = 0.7

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: int = 100
    temperature: float = 0.7

@app.get("/")
async def root():
    return {
        "message": "Simple Test API",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": True,  # Simular que está cargado
        "timestamp": datetime.now().isoformat()
    }

@app.post("/v1/generate")
async def generate_text(request: GenerateRequest):
    # Respuesta simulada
            return {
        "id": str(uuid.uuid4()),
        "text": f"This is a simulated response for: '{request.prompt}'. In a real API, this would be the vLLM model response.",
        "model": "test-model",
        "created": int(datetime.now().timestamp()),
        "usage": {
            "prompt_tokens": len(request.prompt.split()),
            "completion_tokens": 20,
            "total_tokens": len(request.prompt.split()) + 20
        }
    }

@app.post("/v1/chat/completions")
async def chat_completion(request: ChatRequest):
    last_message = request.messages[-1].content if request.messages else "Hello"
    
    return {
        "id": str(uuid.uuid4()),
        "message": {
            "role": "assistant",
            "content": f"This is a simulated response for: '{last_message}'. In a real API, this would be the vLLM model response."
        },
        "model": "test-model",
        "created": int(datetime.now().timestamp()),
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 15,
            "total_tokens": 25
        }
    }

@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": "test-model",
                "object": "model",
                "created": int(datetime.now().timestamp()),
                "owned_by": "test-server"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting simple test API...")
    print("📡 Available endpoints:")
    print("   GET  /")
    print("   GET  /health")
    print("   POST /v1/generate")
    print("   POST /v1/chat/completions")
    print("   GET  /v1/models")
    print("\n🌐 Server running on: http://localhost:8000")
    
    uvicorn.run(
        "simple_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )