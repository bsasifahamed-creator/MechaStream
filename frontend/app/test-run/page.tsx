'use client'

import React, { useState } from 'react';

export default function TestRunPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test App!</h1>
        <p>This is a test application</p>
    </div>
</body>
</html>`;

  const handleTestRun = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Run button with code:', testCode);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testCode,
          language: 'html'
        }),
      });

      const data = await response.json();
      console.log('Execute API response:', data);
      
      setResult(data);
      
      if (data.success) {
        console.log('✅ Test successful!');
        console.log('Server URL:', data.serverUrl);
        
        // Try to redirect to simulation
        const simulationUrl = `/simulation?frontend=${encodeURIComponent(data.serverUrl || 'http://localhost:3002')}&backend=${encodeURIComponent('http://localhost:5000')}&project=${encodeURIComponent('Test Project')}`;
        console.log('Redirecting to:', simulationUrl);
        
        // Wait a moment then redirect
        setTimeout(() => {
          window.location.href = simulationUrl;
        }, 2000);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Test Run Button</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Code</h2>
          <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto">
            {testCode}
          </pre>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleTestRun}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Run Button'}
          </button>
        </div>

        {isLoading && (
          <div className="bg-blue-900 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-white">Testing Run button...</span>
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
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <ol className="text-gray-300 space-y-2">
            <li>1. Click "Test Run Button" to test the execute API</li>
            <li>2. Check the console for detailed logs</li>
            <li>3. If successful, you'll be redirected to simulation page</li>
            <li>4. If there's an error, it will be displayed above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
