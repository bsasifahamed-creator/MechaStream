import requests

# Test health endpoint
try:
    response = requests.get('http://localhost:5000/health')
    print("Health check:", response.json())
except Exception as e:
    print("Health check failed:", e)

# Test code execution
try:
    response = requests.post('http://localhost:5000/execute', json={'code': 'print("Hello World")'})
    print("Code execution:", response.json())
except Exception as e:
    print("Code execution failed:", e)
