# API vLLM Server

Una API completa para servir modelos de lenguaje usando vLLM con FastAPI, diseñada para integrarse con aplicaciones Next.js.

## 🚀 Características

- **API REST completa** con endpoints para generación de texto y chat
- **Streaming de respuestas** en tiempo real
- **Compatible con OpenAI API** (formato similar)
- **CORS configurado** para Next.js
- **Validación de datos** con Pydantic
- **Logging completo** y monitoreo de salud
- **Configuración flexible** por variables de entorno
- **Cliente Python** incluido para pruebas

## 📋 Requisitos

### Sistema
- Python 3.8+
- GPU NVIDIA con CUDA (recomendado) o CPU
- Al menos 8GB de RAM (16GB+ recomendado)

### Dependencias
```bash
pip install -r requirements.txt
```

## 🛠️ Instalación

1. **Clonar o descargar los archivos**
```bash
# Los archivos principales son:
# - vllm_api.py (servidor principal)
# - requirements.txt (dependencias)
# - config.py (configuración)
# - start_server.py (script de inicio)
# - vllm_client.py (cliente de ejemplo)
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Verificar instalación de vLLM**
```bash
python -c "import vllm; print('vLLM instalado correctamente')"
```

## 🚀 Uso Rápido

### Iniciar el servidor

**Opción 1: Script básico**
```bash
python vllm_api.py
```

**Opción 2: Script avanzado con configuración**
```bash
python start_server.py --env development --reload
```

**Opción 3: Con uvicorn directamente**
```bash
uvicorn vllm_api:app --host 0.0.0.0 --port 8000 --reload
```

### Verificar que funciona
```bash
curl http://localhost:8000/health
```

## 📡 Endpoints de la API

### 1. Información básica
```bash
GET /                 # Información de la API
GET /health          # Estado de salud
GET /v1/models       # Modelos disponibles
```

### 2. Generación de texto
```bash
POST /v1/generate
```

**Ejemplo de request:**
```json
{
  "prompt": "Explica qué es la inteligencia artificial:",
  "max_tokens": 150,
  "temperature": 0.7,
  "top_p": 0.9,
  "stream": false
}
```

### 3. Chat completions
```bash
POST /v1/chat/completions
```

**Ejemplo de request:**
```json
{
  "messages": [
    {"role": "system", "content": "Eres un asistente útil."},
    {"role": "user", "content": "¿Cómo funciona vLLM?"}
  ],
  "max_tokens": 200,
  "temperature": 0.7,
  "stream": false
}
```

## 🔧 Configuración

### Variables de entorno

```bash
# Modelo
MODEL_NAME=meta-llama/Meta-Llama-3-8B-Instruct
MODEL_PATH=/path/to/local/model  # Opcional

# vLLM
TENSOR_PARALLEL_SIZE=1
GPU_MEMORY_UTILIZATION=0.8
MAX_MODEL_LEN=2048

# Servidor
HOST=0.0.0.0
PORT=8000
WORKERS=1
LOG_LEVEL=INFO

# Entorno
ENVIRONMENT=development  # development, production, testing
```

### Archivo .env (opcional)
```bash
# Crear archivo .env con tus configuraciones
echo "MODEL_NAME=meta-llama/Meta-Llama-3-8B-Instruct" > .env
echo "GPU_MEMORY_UTILIZATION=0.9" >> .env
echo "PORT=8001" >> .env
```

## 💻 Integración con Next.js

### 1. Desde el frontend (JavaScript/TypeScript)

```javascript
// lib/vllm-client.js
export class VLLMClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async generateText(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens: options.maxTokens || 100,
        temperature: options.temperature || 0.7,
        stream: false,
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  }

  async chatCompletion(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: options.maxTokens || 100,
        temperature: options.temperature || 0.7,
        stream: false,
        ...options
      })
    });
    
    return await response.json();
  }
}
```

### 2. Desde una API route de Next.js

```javascript
// pages/api/chat.js o app/api/chat/route.js
export async function POST(request) {
  const { message } = await request.json();
  
  const response = await fetch('http://localhost:8000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return Response.json(data);
}
```

## 🧪 Pruebas

### Usando el cliente Python incluido
```bash
python vllm_client.py
```

### Usando curl
```bash
# Test básico
curl -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hola, ¿cómo estás?", "max_tokens": 50}'

# Test de chat
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "¿Qué es Python?"}
    ],
    "max_tokens": 100
  }'
```

## 🔍 Monitoreo y Debugging

### Logs
Los logs se guardan en `vllm_api.log` y también se muestran en consola.

### Health check
```bash
curl http://localhost:8000/health
```

### Métricas básicas
El endpoint `/health` devuelve información sobre:
- Estado del modelo
- Timestamp
- Memoria GPU (si está disponible)

## ⚡ Optimización

### Para GPU
```bash
# Usar más memoria GPU
export GPU_MEMORY_UTILIZATION=0.95

# Paralelismo tensor (múltiples GPUs)
export TENSOR_PARALLEL_SIZE=2
```

### Para producción
```bash
# Más workers
python start_server.py --env production --workers 4

# Sin auto-reload
uvicorn vllm_api:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🐛 Solución de problemas

### Error: "CUDA out of memory"
```bash
# Reducir uso de memoria GPU
export GPU_MEMORY_UTILIZATION=0.6
export MAX_MODEL_LEN=1024
```

### Error: "Model not found"
```bash
# Verificar que el modelo existe
python -c "from transformers import AutoTokenizer; AutoTokenizer.from_pretrained('meta-llama/Meta-Llama-3-8B-Instruct')"
```

### Puerto ocupado
```bash
# Usar otro puerto
python start_server.py --port 8001
```

### Modelo muy lento
```bash
# Verificar GPU
python -c "import torch; print(f'CUDA disponible: {torch.cuda.is_available()}')"

# Usar modelo más pequeño para pruebas
export MODEL_NAME=microsoft/DialoGPT-small
```

## 📚 Modelos compatibles

- **Llama 2/3**: meta-llama/Llama-2-7b-chat-hf, meta-llama/Meta-Llama-3-8B-Instruct
- **Mistral**: mistralai/Mistral-7B-Instruct-v0.1
- **CodeLlama**: codellama/CodeLlama-7b-Python-hf
- **Vicuna**: lmsys/vicuna-7b-v1.5
- Y muchos más modelos de Hugging Face

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en `vllm_api.log`
2. Verifica que vLLM esté instalado correctamente
3. Comprueba que tienes suficiente memoria GPU/RAM
4. Prueba con un modelo más pequeño primero

¡Disfruta usando tu API de vLLM! 🚀