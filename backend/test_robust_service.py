import requests
import json
import time

def test_robust_service():
    """Test the robust execution service"""
    print("🧪 Testing Robust Python Execution Service...")
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get('http://127.0.0.1:5000/health', timeout=5)
        print(f"✅ Health check: {response.status_code}")
        print(f"📊 Response: {json.dumps(response.json(), indent=2)}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to service on port 5000")
        print("💡 Trying port 5001...")
        try:
            response = requests.get('http://127.0.0.1:5001/health', timeout=5)
            print(f"✅ Health check: {response.status_code}")
            print(f"📊 Response: {json.dumps(response.json(), indent=2)}")
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to service on port 5001 either")
            print("💡 Service may not be running or there's a binding issue")
            return False
    
    # Test 2: Simple Python execution
    print("\n2️⃣ Testing simple Python execution...")
    test_code = 'print("Hello from Python execution service!")'
    data = {
        'code': test_code,
        'language': 'python'
    }
    
    try:
        response = requests.post(
            'http://127.0.0.1:5000/execute',
            json=data,
            timeout=10
        )
        print(f"✅ Execution test: {response.status_code}")
        result = response.json()
        print(f"📊 Response: {json.dumps(result, indent=2)}")
        
        if result.get('success'):
            print("🎉 Python execution successful!")
        else:
            print(f"⚠️ Execution failed: {result.get('error')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to execution endpoint")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 3: Service status
    print("\n3️⃣ Testing service status...")
    try:
        response = requests.get('http://127.0.0.1:5000/status', timeout=5)
        print(f"✅ Status check: {response.status_code}")
        print(f"📊 Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Status check failed: {e}")
    
    print("\n🎯 Test completed!")
    return True

if __name__ == '__main__':
    test_robust_service() 