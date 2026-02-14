'use client'

import React, { useState } from 'react';

export default function TestFlaskPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // This simulates the AI-generated chatbot code
  const testFlaskCode = `# File: app.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    response = f"Echo: {message}"
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

# File: templates/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="chat-container">
        <h1>AI Chatbot</h1>
        <div id="messages" class="messages"></div>
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="Type your message...">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>
    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>

# File: static/style.css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 100vh;
}

.chat-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    overflow: hidden;
}

h1 {
    text-align: center;
    color: #333;
    padding: 20px;
    margin: 0;
    background: #f8f9fa;
}

.messages {
    height: 400px;
    overflow-y: auto;
    padding: 20px;
}

.message {
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 80%;
}

.user-message {
    background: #007bff;
    color: white;
    margin-left: auto;
}

.bot-message {
    background: #f0f0f0;
    color: #333;
}

.input-container {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
}

button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

button:hover {
    background: #0056b3;
}

# File: static/script.js
function sendMessage() {
    const input = document.getElementById('messageInput');
    const messages = document.getElementById('messages');
    const message = input.value.trim();

    if (message) {
        // Add user message
        addMessage(message, true);
        input.value = '';

        // Send to backend
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.response, false);
        })
        .catch(error => {
            addMessage('Sorry, there was an error processing your message.', false);
        });
    }
}

function addMessage(text, isUser = false) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = \`message \${isUser ? 'user-message' : 'bot-message'}\`;
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Allow Enter key to send message
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

# File: requirements.txt
flask==2.3.3
flask-cors==4.0.0`;

  const handleTestFlask = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Flask project parsing with code:', testFlaskCode);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testFlaskCode,
          language: 'python'
        }),
      });

      const data = await response.json();
      console.log('Execute API response:', data);
      
      setResult(data);
      
      if (data.success) {
        console.log('✅ Flask test successful!');
        console.log('Server URL:', data.serverUrl);
        
        // Try to redirect to simulation
        const simulationUrl = `/simulation?frontend=${encodeURIComponent(data.serverUrl || 'http://localhost:5000')}&backend=${encodeURIComponent('http://localhost:5000')}&project=${encodeURIComponent('Flask Chatbot')}`;
        console.log('Redirecting to:', simulationUrl);
        
        // Wait a moment then redirect
        setTimeout(() => {
          window.location.href = simulationUrl;
        }, 2000);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Flask test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Test Flask Project Parsing</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Flask Chatbot Code</h2>
          <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto max-h-96">
            {testFlaskCode}
          </pre>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleTestFlask}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing Flask...' : 'Test Flask Project'}
          </button>
        </div>

        {isLoading && (
          <div className="bg-green-900 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-white">Testing Flask project parsing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 p-4 rounded-lg mb-6">
            <h3 className="text-red-200 font-semibold mb-2">Error:</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-900 p-4 rounded-lg mb-6">
            <h3 className="text-green-200 font-semibold mb-2">Result:</h3>
            <pre className="text-green-300 text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">What This Tests</h2>
          <ol className="text-gray-300 space-y-2">
            <li>1. <strong>Multi-file parsing</strong>: Tests if the AI-generated Flask project is correctly parsed</li>
            <li>2. <strong>Language detection</strong>: Verifies Python/Flask is detected instead of HTML</li>
            <li>3. <strong>Flask execution</strong>: Tests if the Flask server starts properly</li>
            <li>4. <strong>Live preview</strong>: Should redirect to simulation with working Flask app</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
