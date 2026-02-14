from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import re
import logging
import threading
import time
import sys
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Security configuration
DANGEROUS_IMPORTS = ['os', 'subprocess', 'sys', 'importlib', 'eval', 'exec']
MAX_CODE_LENGTH = 10000
EXECUTION_TIMEOUT = 30

class HealthMonitor:
    def __init__(self):
        self.is_healthy = True
        self.last_check = time.time()
        self.start_time = time.time()
    
    def check_health(self):
        """Monitor system health"""
        try:
            # Check if Python is available
            result = subprocess.run([sys.executable, '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode != 0:
                logger.warning("Python not available")
                self.is_healthy = False
                return
            
            # Check system resources
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            
            if cpu_percent > 90 or memory.percent > 90:
                logger.warning(f"High resource usage: CPU {cpu_percent}%, Memory {memory.percent}%")
                self.is_healthy = False
            else:
                self.is_healthy = True
                
            self.last_check = time.time()
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            self.is_healthy = False

def validate_code_security(code):
    """Enhanced security validation"""
    if not code or not isinstance(code, str):
        return False
    
    if len(code) > MAX_CODE_LENGTH:
        return False
    
    # Check for dangerous imports
    for dangerous in DANGEROUS_IMPORTS:
        if re.search(rf'\bimport\s+{dangerous}\b', code, re.IGNORECASE):
            return False
        if re.search(rf'\bfrom\s+{dangerous}\b', code, re.IGNORECASE):
            return False
    
    # Check for dangerous functions
    dangerous_functions = ['eval', 'exec', 'open', '__import__', 'globals', 'locals']
    for func in dangerous_functions:
        if func in code:
            return False
    
    # Check for file system access
    if any(pattern in code.lower() for pattern in ['/etc/', '/var/', 'c:\\', 'd:\\']):
        return False
    
    return True

def execute_python_safely(code):
    """Execute Python code with enhanced safety"""
    start_time = time.time()
    
    try:
        # Create temporary file with unique name
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        # Execute with strict limits
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT,
            cwd=tempfile.gettempdir()  # Use temp directory for safety
        )
        
        execution_time = time.time() - start_time
        
        return {
            'success': result.returncode == 0,
            'output': result.stdout,
            'error': result.stderr,
            'execution_time': f"{execution_time:.2f}s",
            'return_code': result.returncode,
            'memory_used': 'N/A'  # Could be enhanced with psutil
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'output': '',
            'error': f'Execution timed out after {EXECUTION_TIMEOUT} seconds',
            'execution_time': f"{EXECUTION_TIMEOUT}s",
            'return_code': -1,
            'memory_used': 'N/A'
        }
    except Exception as e:
        return {
            'success': False,
            'output': '',
            'error': f'Execution failed: {str(e)}',
            'execution_time': f"{time.time() - start_time:.2f}s",
            'return_code': -1,
            'memory_used': 'N/A'
        }
    finally:
        # Clean up temporary file
        try:
            if 'temp_file' in locals():
                os.unlink(temp_file)
        except:
            pass

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint"""
    try:
        # Basic health check
        health_status = {
            'status': 'healthy' if monitor.is_healthy else 'degraded',
            'service': 'python-execution-service',
            'version': '2.0.0',
            'uptime': f"{time.time() - monitor.start_time:.0f}s",
            'last_check': f"{time.time() - monitor.last_check:.0f}s ago",
            'python_version': sys.version.split()[0],
            'platform': sys.platform
        }
        
        # Add system info
        try:
            health_status['cpu_percent'] = psutil.cpu_percent()
            health_status['memory_percent'] = psutil.virtual_memory().percent
        except:
            health_status['system_info'] = 'unavailable'
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/execute', methods=['POST'])
def execute_code():
    """Execute Python code with enhanced error handling"""
    try:
        # 1. Validate request
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        code = data.get('code')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'success': False, 'error': 'No code provided'}), 400
        
        # 2. Security validation
        if not validate_code_security(code):
            return jsonify({
                'success': False, 
                'error': 'Code contains unsafe operations and cannot be executed'
            }), 400
        
        # 3. Check service health
        if not monitor.is_healthy:
            return jsonify({
                'success': False,
                'error': 'Service is currently unavailable. Please try again later.'
            }), 503
        
        # 4. Execute code
        logger.info(f"Executing code (length: {len(code)})")
        result = execute_python_safely(code)
        
        # 5. Log execution
        if result['success']:
            logger.info(f"Code executed successfully in {result['execution_time']}")
        else:
            logger.warning(f"Code execution failed: {result['error']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API error: {str(e)}',
            'output': '',
            'execution_time': 'error'
        }), 500

@app.route('/status', methods=['GET'])
def service_status():
    """Detailed service status"""
    return jsonify({
        'service': 'python-execution-service',
        'version': '2.0.0',
        'status': 'running',
        'health': monitor.is_healthy,
        'uptime': f"{time.time() - monitor.start_time:.0f}s",
        'python_version': sys.version,
        'platform': sys.platform
    })

# Initialize health monitor
monitor = HealthMonitor()

if __name__ == '__main__':
    logger.info("Starting Robust Python Execution Service...")
    
    # Start health monitor in background
    def health_monitor_loop():
        while True:
            monitor.check_health()
            time.sleep(30)  # Check every 30 seconds
    
    health_thread = threading.Thread(target=health_monitor_loop, daemon=True)
    health_thread.start()
    
    # Start service with proper error handling
    try:
        logger.info("Attempting to start on port 5000...")
        app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)
    except OSError as e:
        logger.error(f"Port 5000 in use, trying 5001: {e}")
        try:
            app.run(host='127.0.0.1', port=5001, debug=False, threaded=True)
        except OSError as e2:
            logger.error(f"Port 5001 also in use: {e2}")
            logger.error("Please free up ports 5000 or 5001 and try again")
            sys.exit(1) 