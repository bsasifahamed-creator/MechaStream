# 🔧 Flask Auto-Open Troubleshooting Guide

## 🎯 **Current Status**

The Flask auto-opening functionality has been implemented with multiple detection methods and debug logging.

### **✅ What's Working**
- Flask project detection ✅
- Local Flask execution ✅
- Server URL extraction ✅
- Browser opening logic ✅

### **🔍 Debug Information**

When you run a Flask project, check the browser console for these debug messages:

```
🔍 Checking for Flask server URL in output: [output content]
✅ Found Flask URL (Format 1): http://localhost:5000
🌐 Auto-opening Flask server: http://localhost:5000
🚀 Opening browser to: http://localhost:5000
✅ Browser window opened successfully
```

## 🚀 **How to Test**

### **Step 1: Test the API**
```bash
Invoke-WebRequest -Uri "http://localhost:3001/api/execute" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"prompt":"create me a flask chatbot"}'
```

**Expected Response:**
```json
{
  "success": true,
  "serverUrl": "http://localhost:5000",
  "output": "Flask server logs...",
  "files": [...]
}
```

### **Step 2: Test in IDE**
1. Go to: `http://localhost:3001/ide`
2. Type: `"create me a flask chatbot"`
3. Click: Run button
4. Check: Browser console for debug messages
5. Wait: 2 seconds for auto-opening

### **Step 3: Manual Test**
1. Open: `test_browser_open.html` in browser
2. Click: "Test Open Flask" button
3. Verify: New tab opens to `http://localhost:5000`

## 🔧 **Troubleshooting Steps**

### **Issue 1: Browser Not Opening**

**Check:**
1. Browser console for debug messages
2. Popup blocker settings
3. Network connectivity to localhost:5000

**Solutions:**
```javascript
// Test manual opening
window.open('http://localhost:5000', '_blank');

// Check if popup is blocked
const newWindow = window.open('http://localhost:5000', '_blank');
if (newWindow) {
  console.log('✅ Popup allowed');
} else {
  console.log('❌ Popup blocked');
}
```

### **Issue 2: Flask Server Not Running**

**Check:**
1. Terminal logs for Flask startup
2. Port 5000 availability
3. Python/Flask installation

**Solutions:**
```bash
# Check if port 5000 is in use
netstat -an | findstr :5000

# Kill process on port 5000 if needed
taskkill /F /PID [PID_NUMBER]
```

### **Issue 3: URL Detection Failing**

**Check:**
1. API response format
2. Output content structure
3. Regex pattern matching

**Debug:**
```javascript
// Check output content
console.log('Output:', result.output);

// Test regex patterns
const testOutput = "Running on http://127.0.0.1:5000";
const match = testOutput.match(/Running on\s*(http:\/\/[^\s]+)/);
console.log('Match:', match);
```

## 🎯 **Expected Behavior**

### **Successful Flow:**
1. User types: `"create me a flask chatbot"`
2. System detects: Flask project
3. Generates: 5 files (app.py, templates, static, requirements.txt)
4. Installs: Dependencies with pip
5. Starts: Flask server at http://localhost:5000
6. Extracts: Server URL from output
7. Opens: Browser to Flask app after 2 seconds
8. Shows: Fully functional chatbot

### **Debug Output:**
```
🎯 Project type detected: flask
📁 Generated project structure: 5 files, main: app.py
🌐 Flask project detected, using local execution...
🚀 Starting local Flask execution...
📄 Created: app.py
📄 Created: templates/index.html
📄 Created: static/style.css
📄 Created: static/script.js
📄 Created: requirements.txt
📦 Installing Flask dependencies...
✅ Dependencies installed successfully
🌐 Starting Flask server...
Flask: * Serving Flask app 'app'
Flask: * Debug mode: on
Flask: * Running on http://127.0.0.1:5000
✅ Flask server started successfully
🔍 Checking for Flask server URL in output: [output]
✅ Found Flask URL (Format 2): http://127.0.0.1:5000
🌐 Auto-opening Flask server: http://127.0.0.1:5000
🚀 Opening browser to: http://127.0.0.1:5000
✅ Browser window opened successfully
```

## 🚀 **Quick Fix Commands**

### **If Auto-Open Not Working:**
1. **Check Console**: Open browser dev tools and look for debug messages
2. **Allow Popups**: Ensure popup blocker allows localhost
3. **Manual Test**: Try `test_browser_open.html`
4. **Restart Server**: Restart the Next.js development server

### **If Flask Server Issues:**
1. **Check Port**: Ensure port 5000 is free
2. **Install Dependencies**: Ensure Flask is installed
3. **Test API**: Use the PowerShell command above
4. **Check Logs**: Look for Flask startup messages

## 🎉 **Success Indicators**

✅ **API Response**: Contains `serverUrl: "http://localhost:5000"`
✅ **Console Logs**: Show "Found Flask URL" and "Opening browser"
✅ **Browser Tab**: New tab opens to Flask app
✅ **Flask App**: Chatbot interface loads and works
✅ **Network**: Requests to `/api/chat` work

If all these indicators are present, the auto-opening functionality is working correctly! 