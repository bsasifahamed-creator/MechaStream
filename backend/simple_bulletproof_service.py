from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Flask service is running!", "status": "success"})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "message": "Flask execution service running",
        "platform": os.name
    })

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        data = request.json
        code = data.get("code", "")
        
        if not code:
            return jsonify({"error": "No code provided"}), 400

        print(f"Executing code: {code[:100]}...")

        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute the code
            result = subprocess.run(
                ["python", temp_file],
                capture_output=True, 
                text=True, 
                timeout=10
            )
            
            # Clean up
            try:
                os.unlink(temp_file)
            except:
                pass
            
            return jsonify({
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr,
                "status": "completed"
            })
            
        except subprocess.TimeoutExpired:
            return jsonify({"error": "Execution timed out"}), 500
        except Exception as e:
            return jsonify({"error": f"Execution failed: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"API error: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting Simple Bulletproof Flask Service...")
    print("Access at: http://localhost:5000")
    
    # Use localhost instead of 0.0.0.0 for Windows compatibility
    app.run(host="localhost", port=5000, debug=False) 