# 🔧 **Hybrid Execution System Configuration**

## **📁 Environment Variables (.env.local)**

Create a `.env.local` file in your project root with the following configuration:

```env
# Hybrid Execution System Configuration
NEXT_PUBLIC_EXECUTION_API=/api/execute
NEXT_PUBLIC_PISTON_API_URL=https://emkc.org/api/v2/piston/execute
NEXT_PUBLIC_EXECUTION_TIMEOUT=5000

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## **🎯 Configuration Details**

### **Execution System**
- **Primary**: Piston API (https://emkc.org/api/v2/piston/execute)
- **Fallback**: Local Node.js execution
- **Timeout**: 5 seconds per execution
- **Languages**: Python, JavaScript, TypeScript, Java, C++

### **API Endpoints**
- **Health Check**: `GET /api/execute`
- **Code Execution**: `POST /api/execute`
- **Request Body**: `{ "code": "...", "language": "python" }`

### **Response Format**
```json
{
  "success": true,
  "output": "Hello World!",
  "error": "",
  "status": "completed",
  "source": "piston",
  "language": "python"
}
```

## **🔍 Testing Configuration**

### **Test Commands**
```bash
# Health Check
curl http://localhost:3000/api/execute

# Python Execution
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello from Python!\")", "language": "python"}'

# JavaScript Execution
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(\"Hello from JavaScript!\")", "language": "javascript"}'
```

### **Expected Results**
- **Piston API**: Fast, reliable, sandboxed execution
- **Local Fallback**: Works when Piston is unavailable
- **Error Handling**: Clear error messages and fallback responses 