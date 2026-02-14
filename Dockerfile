# Dockerfile para vLLM API Server
FROM nvidia/cuda:11.8-devel-ubuntu20.04

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de requisitos
COPY requirements.txt .

# Instalar dependencias Python
RUN pip3 install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY vllm_api.py .
COPY config.py .
COPY start_server.py .
COPY vllm_client.py .

# Crear directorio para logs
RUN mkdir -p /app/logs

# Exponer puerto
EXPOSE 8000

# Variables de entorno por defecto
ENV MODEL_NAME=meta-llama/Meta-Llama-3-8B-Instruct
ENV HOST=0.0.0.0
ENV PORT=8000
ENV WORKERS=1
ENV GPU_MEMORY_UTILIZATION=0.8
ENV LOG_LEVEL=INFO

# Comando por defecto
CMD ["python3", "start_server.py", "--env", "production"]

# Etiquetas
LABEL maintainer="Tu Nombre <tu@email.com>"
LABEL description="vLLM API Server with FastAPI"
LABEL version="1.0.0"