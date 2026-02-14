"""
Cliente de ejemplo para interactuar con la API de vLLM
"""

import requests
import json
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional, AsyncIterator

class VLLMClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        
    def generate_text(
        self, 
        prompt: str, 
        max_tokens: int = 100,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50,
        repetition_penalty: float = 1.1
    ) -> Dict[str, Any]:
        """Generar texto usando el endpoint /v1/generate"""
        url = f"{self.base_url}/v1/generate"
        
        payload = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "repetition_penalty": repetition_penalty,
            "stream": False
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        return response.json()
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 100,
        temperature: float = 0.7,
        top_p: float = 0.9
    ) -> Dict[str, Any]:
        """Completar conversación usando el endpoint /v1/chat/completions"""
        url = f"{self.base_url}/v1/chat/completions"
        
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": False
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        return response.json()
    
    def generate_stream(
        self,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 0.7
    ) -> requests.Response:
        """Generar texto en streaming"""
        url = f"{self.base_url}/v1/generate"
        
        payload = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True
        }
        
        response = requests.post(url, json=payload, stream=True)
        response.raise_for_status()
        
        return response
    
    async def async_generate_text(
        self,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Versión asíncrona de generate_text"""
        url = f"{self.base_url}/v1/generate"
        
        payload = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                response.raise_for_status()
                return await response.json()
    
    async def async_chat_completion(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 100,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Versión asíncrona de chat_completion"""
        url = f"{self.base_url}/v1/chat/completions"
        
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                response.raise_for_status()
                return await response.json()
    
    def health_check(self) -> Dict[str, Any]:
        """Verificar el estado de la API"""
        url = f"{self.base_url}/health"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    
    def list_models(self) -> Dict[str, Any]:
        """Listar modelos disponibles"""
        url = f"{self.base_url}/v1/models"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

# Ejemplos de uso
def main():
    # Crear cliente
    client = VLLMClient()
    
    try:
        # Verificar estado
        health = client.health_check()
        print("Estado de la API:", health)
        
        # Generar texto simple
        print("\n=== Generación de texto ===")
        result = client.generate_text(
            prompt="Explica qué es la inteligencia artificial en términos simples:",
            max_tokens=150,
            temperature=0.7
        )
        print("Texto generado:", result["text"])
        
        # Chat completion
        print("\n=== Chat completion ===")
        messages = [
            {"role": "system", "content": "Eres un asistente útil que responde en español."},
            {"role": "user", "content": "¿Cuáles son los beneficios de usar Python para machine learning?"}
        ]
        
        chat_result = client.chat_completion(
            messages=messages,
            max_tokens=200,
            temperature=0.7
        )
        print("Respuesta del chat:", chat_result["message"]["content"])
        
        # Streaming example
        print("\n=== Streaming ===")
        stream_response = client.generate_stream(
            prompt="Cuenta una historia corta sobre un robot:",
            max_tokens=100
        )
        
        print("Texto en streaming:")
        for line in stream_response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data_str = line_str[6:]  # Remover 'data: '
                    if data_str == '[DONE]':
                        break
                    try:
                        data = json.loads(data_str)
                        if 'choices' in data and data['choices']:
                            text = data['choices'][0].get('text', '')
                            print(text, end='', flush=True)
                    except json.JSONDecodeError:
                        continue
        print("\n")
        
    except requests.exceptions.RequestException as e:
        print(f"Error conectando con la API: {e}")
        print("Asegúrate de que el servidor esté ejecutándose en http://localhost:8000")

# Ejemplo asíncrono
async def async_main():
    client = VLLMClient()
    
    try:
        # Generar texto de forma asíncrona
        result = await client.async_generate_text(
            prompt="¿Qué es vLLM?",
            max_tokens=100
        )
        print("Resultado asíncrono:", result["text"])
        
    except Exception as e:
        print(f"Error en operación asíncrona: {e}")

if __name__ == "__main__":
    print("=== Ejemplos síncronos ===")
    main()
    
    print("\n=== Ejemplos asíncronos ===")
    asyncio.run(async_main())