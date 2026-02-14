import requests
import json

def test_flask_service():
    """Test the Flask execution service"""
    print("🧪 Testing Flask Execution Service...")
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        print(f"✅ Health check: {response.status_code}")
        print(f"📊 Response: {json.dumps(response.json(), indent=2)}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Flask service")
        print("💡 Make sure the service is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Simple Python execution
    print("\n2️⃣ Testing Python execution...")
    test_code = 'print("Hello from Flask execution service!")'
    data = {
        'code': test_code
    }
    
    try:
        response = requests.post(
            'http://localhost:5000/execute',
            json=data,
            timeout=10
        )
        print(f"✅ Execution test: {response.status_code}")
        result = response.json()
        print(f"📊 Response: {json.dumps(result, indent=2)}")
        
        if result.get('success'):
            print("🎉 Python execution successful!")
            return True
        else:
            print(f"⚠️ Execution failed: {result.get('error')}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to execution endpoint")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    success = test_flask_service()
    if success:
        print("\n🎯 Flask service is working correctly!")
    else:
        print("\n❌ Flask service has issues") 