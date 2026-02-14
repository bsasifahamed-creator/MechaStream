#!/usr/bin/env python3
"""
Script simple para probar la API vLLM sin el modelo completo
"""

import requests
import json
import time
import sys

def test_health():
    """Probar endpoint de salud"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_basic_info():
    """Probar endpoint básico"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Basic info: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Basic info failed: {e}")
        return False

def wait_for_server(max_attempts=30):
    """Esperar a que el servidor esté listo"""
    print("🔄 Esperando a que el servidor vLLM esté listo...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                data = response.json()
                if data.get("model_loaded", False):
                    print("✅ Servidor listo y modelo cargado!")
                    return True
                else:
                    print(f"⏳ Intento {attempt + 1}/{max_attempts}: Servidor activo, cargando modelo...")
            else:
                print(f"⏳ Intento {attempt + 1}/{max_attempts}: Servidor iniciando...")
        except requests.exceptions.RequestException:
            print(f"⏳ Intento {attempt + 1}/{max_attempts}: Esperando conexión...")
        
        time.sleep(10)  # Esperar 10 segundos entre intentos
    
    print("❌ Timeout esperando al servidor")
    return False

def test_generate():
    """Probar generación de texto"""
    try:
        payload = {
            "prompt": "Hola, ¿cómo estás?",
            "max_tokens": 50,
            "temperature": 0.7
        }
        
        response = requests.post(
            "http://localhost:8000/v1/generate", 
            json=payload, 
            timeout=30
        )
        
        print(f"✅ Generate test: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Generated text: {data.get('text', 'No text')}")
        else:
            print(f"Error response: {response.text}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Generate test failed: {e}")
        return False

def main():
    print("🚀 Probando API vLLM...")
    print("=" * 50)
    
    # Probar conexión básica primero
    if not test_basic_info():
        print("❌ No se puede conectar al servidor. ¿Está ejecutándose?")
        return
    
    # Esperar a que el modelo esté cargado
    if not wait_for_server():
        print("❌ El servidor no está listo después de esperar")
        print("💡 Esto puede ser normal si es la primera vez que ejecutas vLLM")
        print("💡 El modelo puede tardar 10-30 minutos en descargarse la primera vez")
        return
    
    # Probar generación
    print("\n🧪 Probando generación de texto...")
    test_generate()
    
    print("\n✅ Pruebas completadas!")
    print(f"🌐 Tu aplicación Next.js: http://localhost:3001")
    print(f"🤖 API vLLM: http://localhost:8000")
    print(f"📊 Health check: http://localhost:8000/health")

if __name__ == "__main__":
    main()