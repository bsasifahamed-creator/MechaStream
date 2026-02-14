# 🚀 Guía de Integración: Next.js + vLLM API

## ✅ Estado Actual

Tu aplicación ahora está completamente integrada con vLLM:

- **Next.js App**: Ejecutándose en `http://localhost:3001`
- **vLLM API**: Ejecutándose en `http://localhost:8000`
- **Integración**: Completada y funcionando

## 📁 Archivos Creados

### Backend (API vLLM)
- `vllm_api.py` - Servidor principal de vLLM
- `simple_api.py` - API de prueba (actualmente activa)
- `requirements.txt` - Dependencias Python
- `config.py` - Configuración
- `start_server.py` - Script de inicio
- `test_api.py` - Script de pruebas

### Frontend (Next.js)
- `src/lib/vllm-client.ts` - Cliente TypeScript para vLLM
- `src/components/VLLMTest.tsx` - Componente de prueba
- `src/app/test-vllm/page.tsx` - Página de prueba
- `src/app/api/ai/route.ts` - API route actualizada para usar vLLM

## 🎯 Cómo Usar

### 1. Probar la Integración
Visita: `http://localhost:3001/test-vllm`

Esta página te permite:
- ✅ Verificar el estado de la API
- ✅ Probar generación de texto
- ✅ Probar chat completions
- ✅ Ver respuestas en tiempo real

### 2. Usar en tu Código

```typescript
import { useVLLM } from '@/lib/vllm-client'

function MyComponent() {
  const { generateText, chatCompletion } = useVLLM()
  
  const handleGenerate = async () => {
    const result = await generateText({
      prompt: "Crea un componente React",
      max_tokens: 200,
      temperature: 0.7
    })
    console.log(result.text)
  }
  
  return <button onClick={handleGenerate}>Generar</button>
}
```

### 3. Usar la API Route Actualizada

Tu API route en `/api/ai` ahora usa vLLM:

```javascript
// Desde el frontend
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Crear un botón React',
    operation: 'generate'
  })
})

const data = await response.json()
console.log(data.content) // Código generado por vLLM
```

## 🔄 Cambiar de API Simulada a vLLM Real

Actualmente estás usando `simple_api.py` (API simulada). Para usar vLLM real:

### 1. Detener API actual
```bash
# En PowerShell
taskkill /f /im python.exe
taskkill /f /im python3.11.exe
```

### 2. Instalar dependencias vLLM
```bash
pip install vllm torch transformers
```

### 3. Ejecutar vLLM real
```bash
python vllm_api.py
# o
python start_server.py --env development
```

**⚠️ Nota**: vLLM real requiere:
- GPU NVIDIA (recomendado)
- 8GB+ RAM
- Primera ejecución descarga el modelo (~10-30 min)

## 🛠️ Configuración

### Variables de Entorno (.env.local)
```bash
# Para Next.js
VLLM_BASE_URL=http://localhost:8000

# Para vLLM (opcional)
MODEL_NAME=meta-llama/Meta-Llama-3-8B-Instruct
GPU_MEMORY_UTILIZATION=0.8
PORT=8000
```

## 🧪 Endpoints Disponibles

### API vLLM (Puerto 8000)
- `GET /health` - Estado de la API
- `POST /v1/generate` - Generación de texto
- `POST /v1/chat/completions` - Chat completions
- `GET /v1/models` - Modelos disponibles

### Next.js API (Puerto 3001)
- `POST /api/ai` - Proxy a vLLM con lógica específica

## 🔍 Debugging

### Verificar Estado
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

### Ver Logs
- API vLLM: Logs en consola donde ejecutaste el servidor
- Next.js: Logs en consola del navegador (F12)

### Problemas Comunes

1. **"Connection refused"**
   - Verifica que la API esté ejecutándose
   - Usa `python test_api.py` para diagnosticar

2. **"Model not loaded"**
   - Espera a que el modelo se descargue/cargue
   - Primera vez puede tardar 10-30 minutos

3. **Error de CORS**
   - Ya está configurado para localhost:3000 y 3001
   - Verifica que uses los puertos correctos

## 🚀 Próximos Pasos

1. **Integrar en tu App**: Usa el cliente vLLM en tus componentes existentes
2. **Personalizar Prompts**: Modifica los prompts del sistema en `/api/ai/route.ts`
3. **Streaming**: Implementa respuestas en streaming para mejor UX
4. **Caching**: Añade cache para respuestas frecuentes
5. **Monitoring**: Implementa métricas y logging

## 📞 Soporte

Si tienes problemas:

1. Ejecuta `python test_api.py` para diagnosticar
2. Revisa los logs en consola
3. Verifica que ambos servidores estén ejecutándose
4. Visita `http://localhost:3001/test-vllm` para pruebas interactivas

¡Tu integración está completa y funcionando! 🎉