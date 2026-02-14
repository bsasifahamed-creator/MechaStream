from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
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
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://localhost:5000"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://localhost:5000"])

# Security configuration
DANGEROUS_IMPORTS = ['os', 'subprocess', 'sys', 'importlib', 'eval', 'exec', 'builtins', 'pickle', 'shelve', 'sqlite3', 'socket', 'urllib', 'http', 'ftplib', 'poplib', 'imaplib', 'smtplib', 'telnetlib', 'xmlrpc', 'ssl', 'hashlib', 'hmac', 'secrets', 'cryptography', 'paramiko', 'fabric', 'requests', 'urllib3', 'aiohttp']
MAX_CODE_LENGTH = 10000
EXECUTION_TIMEOUT = 30

def validate_code(code):
    """Validate and sanitize user input code"""
    if not code or not isinstance(code, str):
        raise ValueError("Code must be a non-empty string")

    if len(code) > MAX_CODE_LENGTH:
        raise ValueError(f"Code too long (max {MAX_CODE_LENGTH} characters)")

    # Convert to lowercase for case-insensitive checks
    code_lower = code.lower()

    # Check for dangerous imports (direct and from imports)
    for dangerous in DANGEROUS_IMPORTS:
        if re.search(rf'\bimport\s+{dangerous}\b', code_lower):
            raise ValueError(f"Import of '{dangerous}' is not allowed for security reasons")
        if re.search(rf'\bfrom\s+{dangerous}\b', code_lower):
            raise ValueError(f"Import from '{dangerous}' is not allowed for security reasons")

    # Check for dangerous functions and methods (function calls)
    dangerous_functions = ['eval', 'exec', 'open', '__import__', 'getattr', 'setattr', 'delattr', 'hasattr', 'globals', 'locals', 'vars', 'dir', 'compile', 'reload', 'raw_input', 'file', 'open', 'execfile', 'reload', 'imp.load_module', 'importlib.util.spec_from_file_location', 'importlib.util.module_from_spec', 'runpy.run_path', 'runpy.run_module']
    for func in dangerous_functions:
        # Check for function calls: word boundary + optional spaces + (
        if re.search(rf'\b{re.escape(func)}\s*\(', code_lower):
            raise ValueError(f"Use of '{func}' is not allowed for security reasons")

    # Check for dangerous patterns
    dangerous_patterns = [
        r'importlib\.import_module',
        r'importlib\.reload',
        r'__builtins__',
        r'getattr\(.*,\s*[\'"](?:__|import|eval|exec|open|globals|locals)',
        r'setattr\(.*,\s*[\'"](?:__|import|eval|exec|open|globals|locals)',
        r'delattr\(.*,\s*[\'"](?:__|import|eval|exec|open|globals|locals)',
        r'hasattr\(.*,\s*[\'"](?:__|import|eval|exec|open|globals|locals)',
        r'\.__(?:import__|getattr__|setattr__|delattr__|globals__|locals__|builtins__)',
        r'builtins\.',
        r'pickle\.',
        r'shelve\.',
        r'sqlite3\.',
        r'socket\.',
        r'urllib\.',
        r'http\.',
        r'ftplib\.',
        r'poplib\.',
        r'imaplib\.',
        r'smtplib\.',
        r'telnetlib\.',
        r'xmlrpc\.',
        r'ssl\.',
        r'hashlib\.',
        r'hmac\.',
        r'secrets\.',
        r'cryptography\.',
        r'paramiko\.',
        r'fabric\.',
        r'requests\.',
        r'urllib3\.',
        r'aiohttp\.',
    ]

    for pattern in dangerous_patterns:
        if re.search(pattern, code_lower):
            raise ValueError(f"Dangerous code pattern detected: {pattern}")

    # Check for file operations
    if re.search(r'\b(open|file|read|write|append|close)\s*\(', code_lower):
        raise ValueError("File operations are not allowed for security reasons")

    # Check for network operations
    if re.search(r'\b(connect|bind|listen|accept|send|recv|socket)\s*\(', code_lower):
        raise ValueError("Network operations are not allowed for security reasons")



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
                ['python', temp_file],  # Use 'python' for Windows compatibility
                capture_output=True,
                text=True,
                timeout=EXECUTION_TIMEOUT,
                cwd='./tmp/execution' if os.path.exists('./tmp/execution') else None
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

@socketio.on('execute_code')
def handle_execution(data):
    """Handle real-time code execution via WebSocket"""
    temp_file = None
    try:
        code = data.get('code')
        language = data.get('language', 'python')

        if not code:
            emit('execution_error', {'error': 'No code provided'})
            return

        # Validate code
        try:
            validate_code(code)
        except ValueError as e:
            emit('execution_error', {'error': str(e)})
            return

        # Create temporary file for execution (safer than -c)
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name

        # Stream execution progress
        emit('execution_start', {'status': 'Starting execution...'})

        # Execute and stream results using temp file
        process = subprocess.Popen(
            ['python', temp_file],  # Use 'python' for Windows compatibility
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        # Stream output in real-time
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                emit('execution_output', {'output': output.strip()})

        # Get final result
        return_code = process.poll()
        if return_code == 0:
            emit('execution_complete', {'status': 'Execution finished successfully'})
        else:
            stderr_output = process.stderr.read()
            emit('execution_error', {'error': stderr_output})

    except Exception as e:
        logger.error(f"WebSocket execution error: {str(e)}")
        emit('execution_error', {'error': f'Execution error: {str(e)}'})
    finally:
        # Clean up temporary file
        if temp_file:
            try:
                os.unlink(temp_file)
            except:
                pass

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'python-execution-service',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    # Create execution directory if it doesn't exist
    try:
        os.makedirs('/tmp/execution', exist_ok=True)
    except:
        # Windows fallback
        os.makedirs('./tmp/execution', exist_ok=True)
    
    logger.info("Starting Python Execution Service...")
    try:
        socketio.run(app, host='127.0.0.1', port=5000, debug=False)
    except OSError as e:
        logger.error(f"Port 5000 is in use, trying 5001: {e}")
        socketio.run(app, host='127.0.0.1', port=5001, debug=False) 