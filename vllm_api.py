from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, AsyncIterator
import asyncio
import json
import uuid
from datetime import datetime
import logging
import vllm
from vllm import LLM, SamplingParams

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar FastAPI
app = FastAPI(
    title="vLLM API Server",
    description="API server para modelos de lenguaje usando vLLM",
    version="1.0.0"
)

# Configurar CORS para permitir requests desde Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Puertos de Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para requests y responses
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="El prompt para generar texto")
    max_tokens: int = Field(default=100, ge=1, le=2048, description="Máximo número de tokens a generar")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Temperatura para el sampling")
    top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="Top-p para nucleus sampling")
    top_k: int = Field(default=50, ge=1, description="Top-k para el sampling")
    repetition_penalty: float = Field(default=1.1, ge=1.0, le=2.0, description="Penalización por repetición")
    stream: bool = Field(default=False, description="Si devolver respuesta en streaming")

class ChatMessage(BaseModel):
    role: str = Field(..., description="Rol del mensaje: 'user', 'assistant', o 'system'")
    content: str = Field(..., description="Contenido del mensaje")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Lista de mensajes del chat")
    max_tokens: int = Field(default=100, ge=1, le=2048)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    stream: bool = Field(default=False, description="Si devolver respuesta en streaming")

class GenerateResponse(BaseModel):
    id: str = Field(..., description="ID único de la respuesta")
    text: str = Field(..., description="Texto generado")
    model: str = Field(..., description="Nombre del modelo usado")
    created: int = Field(..., description="Timestamp de creación")
    usage: Dict[str, int] = Field(..., description="Información de uso de tokens")

class ChatResponse(BaseModel):
    id: str = Field(..., description="ID único de la respuesta")
    message: ChatMessage = Field(..., description="Mensaje de respuesta del asistente")
    model: str = Field(..., description="Nombre del modelo usado")
    created: int = Field(..., description="Timestamp de creación")
    usage: Dict[str, int] = Field(..., description="Información de uso de tokens")

# Variables globales para el modelo
llm_model: Optional[LLM] = None
model_name = "meta-llama/Meta-Llama-3-8B-Instruct"

def initialize_model():
    """Inicializar el modelo vLLM"""
    global llm_model
    try:
        logger.info(f"Inicializando modelo: {model_name}")
        llm_model = LLM(
            model=model_name,
            tensor_parallel_size=1,  # Ajustar según tu GPU
            gpu_memory_utilization=0.8,  # Usar 80% de la memoria GPU
            max_model_len=2048,  # Longitud máxima del contexto
        )
        logger.info("Modelo inicializado exitosamente")
    except Exception as e:
        logger.error(f"Error inicializando modelo: {e}")
        raise e

def format_chat_prompt(messages: List[ChatMessage]) -> str:
    """Formatear mensajes de chat en un prompt para Llama"""
    formatted_prompt = ""
    
    for message in messages:
        if message.role == "system":
            formatted_prompt += f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n{message.content}<|eot_id|>"
        elif message.role == "user":
            formatted_prompt += f"<|start_header_id|>user<|end_header_id|>\n{message.content}<|eot_id|>"
        elif message.role == "assistant":
            formatted_prompt += f"<|start_header_id|>assistant<|end_header_id|>\n{message.content}<|eot_id|>"
    
    # Agregar el inicio de la respuesta del asistente
    formatted_prompt += "<|start_header_id|>assistant<|end_header_id|>\n"
    
    return formatted_prompt

async def generate_stream(prompt: str, sampling_params: SamplingParams) -> AsyncIterator[str]:
    """Generar texto en streaming"""
    try:
        # Para streaming, necesitamos usar la API de streaming de vLLM
        # Nota: Esta es una implementación simplificada
        outputs = llm_model.generate([prompt], sampling_params)
        
        for output in outputs:
            generated_text = output.outputs[0].text
            # Simular streaming dividiendo el texto en chunks
            words = generated_text.split()
            for i, word in enumerate(words):
                chunk_data = {
                    "id": str(uuid.uuid4()),
                    "object": "text_completion.chunk",
                    "created": int(datetime.now().timestamp()),
                    "model": model_name,
                    "choices": [{
                        "text": word + " " if i < len(words) - 1 else word,
                        "index": 0,
                        "finish_reason": "length" if i == len(words) - 1 else None
                    }]
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
                await asyncio.sleep(0.05)  # Pequeña pausa para simular streaming
        
        # Enviar mensaje de finalización
        final_chunk = {
            "id": str(uuid.uuid4()),
            "object": "text_completion.chunk",
            "created": int(datetime.now().timestamp()),
            "model": model_name,
            "choices": [{
                "text": "",
                "index": 0,
                "finish_reason": "stop"
            }]
        }
        yield f"data: {json.dumps(final_chunk)}\n\n"
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Error en streaming: {e}")
        error_chunk = {
            "error": {
                "message": str(e),
                "type": "generation_error"
            }
        }
        yield f"data: {json.dumps(error_chunk)}\n\n"

@app.on_event("startup")
async def startup_event():
    """Inicializar modelo al arrancar la aplicación"""
    initialize_model()

@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "message": "vLLM API Server",
        "version": "1.0.0",
        "model": model_name,
        "status": "running" if llm_model else "model_not_loaded"
    }

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    return {
        "status": "healthy" if llm_model else "unhealthy",
        "model_loaded": llm_model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/v1/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """Generar texto a partir de un prompt"""
    if not llm_model:
        raise HTTPException(status_code=503, detail="Modelo no está cargado")
    
    try:
        # Configurar parámetros de sampling
        sampling_params = SamplingParams(
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            max_tokens=request.max_tokens,
            repetition_penalty=request.repetition_penalty,
        )
        
        # Si es streaming, devolver StreamingResponse
        if request.stream:
            return StreamingResponse(
                generate_stream(request.prompt, sampling_params),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )
        
        # Generar texto
        outputs = llm_model.generate([request.prompt], sampling_params)
        generated_text = outputs[0].outputs[0].text
        
        # Crear respuesta
        response = GenerateResponse(
            id=str(uuid.uuid4()),
            text=generated_text,
            model=model_name,
            created=int(datetime.now().timestamp()),
            usage={
                "prompt_tokens": len(request.prompt.split()),
                "completion_tokens": len(generated_text.split()),
                "total_tokens": len(request.prompt.split()) + len(generated_text.split())
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error generando texto: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando texto: {str(e)}")

@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """Completar conversación de chat"""
    if not llm_model:
        raise HTTPException(status_code=503, detail="Modelo no está cargado")
    
    try:
        # Formatear mensajes como prompt
        prompt = format_chat_prompt(request.messages)
        
        # Configurar parámetros de sampling
        sampling_params = SamplingParams(
            temperature=request.temperature,
            top_p=request.top_p,
            max_tokens=request.max_tokens,
        )
        
        # Si es streaming, devolver StreamingResponse
        if request.stream:
            return StreamingResponse(
                generate_stream(prompt, sampling_params),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )
        
        # Generar respuesta
        outputs = llm_model.generate([prompt], sampling_params)
        generated_text = outputs[0].outputs[0].text.strip()
        
        # Crear mensaje de respuesta
        assistant_message = ChatMessage(role="assistant", content=generated_text)
        
        # Crear respuesta
        response = ChatResponse(
            id=str(uuid.uuid4()),
            message=assistant_message,
            model=model_name,
            created=int(datetime.now().timestamp()),
            usage={
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(generated_text.split()),
                "total_tokens": len(prompt.split()) + len(generated_text.split())
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error en chat completion: {e}")
        raise HTTPException(status_code=500, detail=f"Error en chat completion: {str(e)}")

@app.get("/v1/models")
async def list_models():
    """Listar modelos disponibles"""
    return {
        "object": "list",
        "data": [
            {
                "id": model_name,
                "object": "model",
                "created": int(datetime.now().timestamp()),
                "owned_by": "vllm-server"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "vllm_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )