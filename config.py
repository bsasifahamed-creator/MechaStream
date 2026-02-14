"""
Configuración para el servidor vLLM API
"""

import os
from typing import Optional

class Config:
    # Configuración del modelo
    MODEL_NAME: str = os.getenv("MODEL_NAME", "meta-llama/Meta-Llama-3-8B-Instruct")
    MODEL_PATH: Optional[str] = os.getenv("MODEL_PATH")  # Ruta local del modelo si existe
    
    # Configuración de vLLM
    TENSOR_PARALLEL_SIZE: int = int(os.getenv("TENSOR_PARALLEL_SIZE", "1"))
    GPU_MEMORY_UTILIZATION: float = float(os.getenv("GPU_MEMORY_UTILIZATION", "0.8"))
    MAX_MODEL_LEN: int = int(os.getenv("MAX_MODEL_LEN", "2048"))
    MAX_NUM_SEQS: int = int(os.getenv("MAX_NUM_SEQS", "256"))
    
    # Configuración del servidor
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    WORKERS: int = int(os.getenv("WORKERS", "1"))
    
    # Configuración de CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Configuración de logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Límites de la API
    MAX_TOKENS_LIMIT: int = int(os.getenv("MAX_TOKENS_LIMIT", "2048"))
    DEFAULT_MAX_TOKENS: int = int(os.getenv("DEFAULT_MAX_TOKENS", "100"))
    
    # Configuración de streaming
    STREAM_CHUNK_SIZE: int = int(os.getenv("STREAM_CHUNK_SIZE", "1"))
    STREAM_DELAY: float = float(os.getenv("STREAM_DELAY", "0.05"))

# Configuración para diferentes entornos
class DevelopmentConfig(Config):
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

class ProductionConfig(Config):
    DEBUG: bool = False
    WORKERS: int = int(os.getenv("WORKERS", "4"))
    
class TestingConfig(Config):
    TESTING: bool = True
    MODEL_NAME: str = "microsoft/DialoGPT-small"  # Modelo más pequeño para tests

# Seleccionar configuración basada en variable de entorno
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config() -> Config:
    env = os.getenv('ENVIRONMENT', 'default')
    return config_map.get(env, DevelopmentConfig)()