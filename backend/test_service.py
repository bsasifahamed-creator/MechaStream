import requests
import json

def test_execution_service():
    """Test the execution service"""
    try:
        # Test health endpoint
        print("Testing health endpoint...")
        response = requests.get('http://127.0.0.1:5000/health', timeout=5)
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test execution endpoint
        print("\nTesting execution endpoint...")
        test_code = 'print("Hello from Python execution service!")'
        data = {
            'code': test_code,
            'language': 'python'
        }
        
        response = requests.post(
            'http://127.0.0.1:5000/execute',
            json=data,
            timeout=10
        )
        
        print(f"Execution test: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to execution service")
        print("Make sure the service is running on http://127.0.0.1:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_execution_service() 