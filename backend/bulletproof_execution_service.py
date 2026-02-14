from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import psutil
import threading
import os
import signal
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Check if Python is available
        result = subprocess.run(['python', '--version'], 
                              capture_output=True, text=True, timeout=5)
        python_available = result.returncode == 0
    except:
        python_available = False
    
    return jsonify({
        "status": "ok", 
        "message": "Flask execution service running",
        "python_available": python_available,
        "platform": os.name,
        "port": 5000
    }), 200

@app.route('/execute', methods=['POST'])
def execute_code():
    """Execute Python code with proper error handling"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        code = data.get("code", "")
        language = data.get("language", "python")

        if not code:
            return jsonify({"error": "No code provided"}), 400

        logger.info(f"Executing {language} code (length: {len(code)})")

        if language == "python":
            # Create temporary file for execution
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                result = subprocess.run(
                    ["python", temp_file],
                    capture_output=True, 
                    text=True, 
                    timeout=10  # 10 second timeout
                )
                
                # Clean up temp file
                try:
                    os.unlink(temp_file)
                except:
                    pass
                
                return jsonify({
                    "success": result.returncode == 0,
                    "output": result.stdout,
                    "error": result.stderr,
                    "status": "completed",
                    "return_code": result.returncode
                })
                
            except subprocess.TimeoutExpired:
                return jsonify({"error": "Execution timed out after 10 seconds"}), 500
            except Exception as e:
                return jsonify({"error": f"Execution failed: {str(e)}"}), 500
        else:
            return jsonify({"error": f"Language {language} not supported yet"}), 400

    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({"error": f"API error: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
def test():
    """Simple test endpoint"""
    return jsonify({"message": "Flask service is working!", "status": "success"})

if __name__ == "__main__":
    logger.info("Starting Bulletproof Flask Execution Service...")
    logger.info("Binding to 0.0.0.0:5000 for cross-platform compatibility")
    
    try:
        # ✅ Bind to 0.0.0.0 so it's accessible from Next.js
        app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
    except OSError as e:
        logger.error(f"Port 5000 in use, trying 5001: {e}")
        try:
            app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
        except OSError as e2:
            logger.error(f"Port 5001 also in use: {e2}")
            logger.error("Please free up ports 5000 or 5001 and try again")
            exit(1) 