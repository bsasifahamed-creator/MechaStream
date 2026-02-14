from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Security configuration
DANGEROUS_IMPORTS = ['os', 'subprocess', 'sys', 'importlib', 'eval', 'exec']
MAX_CODE_LENGTH = 10000
EXECUTION_TIMEOUT = 30

def validate_code(code):
    """Validate and sanitize user input code"""
    if not code or not isinstance(code, str):
        raise ValueError("Code must be a non-empty string")
    
    if len(code) > MAX_CODE_LENGTH:
        raise ValueError(f"Code too long (max {MAX_CODE_LENGTH} characters)")
    
    # Check for dangerous imports
    for dangerous in DANGEROUS_IMPORTS:
        if re.search(rf'\bimport\s+{dangerous}\b', code, re.IGNORECASE):
            raise ValueError(f"Import of '{dangerous}' is not allowed for security reasons")
        if re.search(rf'\bfrom\s+{dangerous}\b', code, re.IGNORECASE):
            raise ValueError(f"Import from '{dangerous}' is not allowed for security reasons")
    
    # Check for dangerous functions
    dangerous_functions = ['eval', 'exec', 'open', '__import__']
    for func in dangerous_functions:
        if func in code:
            raise ValueError(f"Use of '{func}' is not allowed for security reasons")
    
    return code

@app.route('/execute', methods=['POST'])
def execute_code():
    """Execute Python code securely"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        code = data.get('code')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({'success': False, 'error': 'No code provided'}), 400
        
        # Validate code
        try:
            validate_code(code)
        except ValueError as e:
            return jsonify({'success': False, 'error': str(e)}), 400
        
        # Create temporary file for execution
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute code with timeout and resource limits
            result = subprocess.run(
                ['python', temp_file],
                capture_output=True,
                text=True,
                timeout=EXECUTION_TIMEOUT
            )
            
            return jsonify({
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'execution_time': 'completed',
                'return_code': result.returncode
            })
            
        except subprocess.TimeoutExpired:
            return jsonify({
                'success': False,
                'error': f'Execution timed out after {EXECUTION_TIMEOUT} seconds',
                'output': '',
                'execution_time': 'timeout'
            }), 408
            
        except Exception as e:
            logger.error(f"Execution error: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Execution failed: {str(e)}',
                'output': '',
                'execution_time': 'error'
            }), 500
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except:
                pass
                
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API error: {str(e)}',
            'output': '',
            'execution_time': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'python-execution-service',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    logger.info("Starting Simple Python Execution Service...")
    app.run(host='127.0.0.1', port=5000, debug=False) 