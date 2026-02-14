#!/usr/bin/env python3
"""
Script para iniciar el servidor vLLM API con configuración personalizada
"""

import argparse
import sys
import os
import logging
import uvicorn
from config import get_config

def setup_logging(log_level: str):
    """Configurar logging"""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('vllm_api.log')
        ]
    )

def check_gpu_availability():
    """Verificar disponibilidad de GPU"""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_count = torch.cuda.device_count()
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ GPU disponible: {gpu_name} (Total: {gpu_count} GPUs)")
            return True
        else:
            print("⚠️  No se detectó GPU. El modelo se ejecutará en CPU (será más lento)")
            return False
    except ImportError:
        print("⚠️  PyTorch no está instalado. Instala torch para verificar GPU")
        return False

def main():
    parser = argparse.ArgumentParser(description="Servidor vLLM API")
    parser.add_argument("--host", default=None, help="Host para el servidor")
    parser.add_argument("--port", type=int, default=None, help="Puerto para el servidor")
    parser.add_argument("--workers", type=int, default=None, help="Número de workers")
    parser.add_argument("--model", default=None, help="Nombre del modelo a usar")
    parser.add_argument("--env", choices=['development', 'production', 'testing'], 
                       default='development', help="Entorno de ejecución")
    parser.add_argument("--reload", action="store_true", help="Activar auto-reload")
    parser.add_argument("--log-level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], 
                       default=None, help="Nivel de logging")
    
    args = parser.parse_args()
    
    # Configurar entorno
    os.environ['ENVIRONMENT'] = args.env
    if args.model:
        os.environ['MODEL_NAME'] = args.model
    
    # Obtener configuración
    config = get_config()
    
    # Configurar logging
    log_level = args.log_level or config.LOG_LEVEL
    setup_logging(log_level)
    
    logger = logging.getLogger(__name__)
    
    # Verificar GPU
    check_gpu_availability()
    
    # Configuración del servidor
    host = args.host or config.HOST
    port = args.port or config.PORT
    workers = args.workers or config.WORKERS
    
    logger.info(f"Iniciando servidor vLLM API")
    logger.info(f"Modelo: {config.MODEL_NAME}")
    logger.info(f"Host: {host}:{port}")
    logger.info(f"Workers: {workers}")
    logger.info(f"Entorno: {args.env}")
    
    try:
        uvicorn.run(
            "vllm_api:app",
            host=host,
            port=port,
            workers=workers if not args.reload else 1,  # Solo 1 worker con reload
            reload=args.reload,
            log_level=log_level.lower(),
            access_log=True,
            loop="asyncio"
        )
    except KeyboardInterrupt:
        logger.info("Servidor detenido por el usuario")
    except Exception as e:
        logger.error(f"Error iniciando servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()