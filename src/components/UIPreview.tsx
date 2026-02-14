'use client'

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion'
import { Bug, Play, Square, RefreshCw, ExternalLink, Terminal, AlertTriangle } from 'lucide-react'

interface UIPreviewProps {
  code: string
}

interface Log {
  type: 'log' | 'error' | 'warn' | 'info' | 'success';
  message: string;
  timestamp: string;
}

export default function UIPreview({ code }: UIPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeKey, setIframeKey] = useState(0)
  const [debugMode, setDebugMode] = useState(false)
  const [debugLogs, setDebugLogs] = useState<Log[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const generatePreviewHTML = (code: string) => {
    if (!code.trim()) {
      return `
        <html>
          <body style="margin: 0;">
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-family: sans-serif; color: #666; background-color: #f9fafb;">
              <p>UI Preview will appear here.</p>
            </div>
          </body>
        </html>
      `;
    }

    // This script will be safely executed inside the iframe
    const executionScript = `
      const log = (type, ...args) => {
        const message = args.map(arg => {
          if (arg instanceof Error) return arg.stack;
          try {
            // Use a replacer to handle circular references
            const cache = new Set();
            return JSON.stringify(arg, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[Circular]';
                cache.add(value);
              }
              return value;
            }, 2);
          } catch (e) {
            return String(arg);
          }
        }).join(' ');

        window.parent.postMessage({
          source: 'preview-console',
          type: type,
          message: message,
          timestamp: new Date().toLocaleTimeString()
        }, '*');
      };

      // Override console methods and catch global errors
      window.console.log = (...args) => log('log', ...args);
      window.console.error = (...args) => log('error', ...args);
      window.console.warn = (...args) => log('warn', ...args);
      window.console.info = (...args) => log('info', ...args);
      window.addEventListener('error', (event) => log('error', event.message, event.error));
      window.addEventListener('unhandledrejection', (event) => log('error', 'Unhandled Promise Rejection:', event.reason));

      try {
        log('info', 'Initializing preview...');
        
        const getAppComponent = new Function('React', \`
          // The AI-generated code is placed here.
          // It's expected to have a "export default YourComponent" structure.
          ${code
            .replace(/import[\s\S]*?from[\s\S]*?;/g, '') // Remove import statements (with ;)
            .replace(/import[\s\S]*?from[^\n]*/g, '') // Remove import statements (no ;)
            .replace(/export default/g, 'return ')}
        \`);
        
        const App = getAppComponent(window.React);

        if (typeof App === 'undefined') {
          throw new Error('Generated code did not return a component. Make sure to use "export default".');
        }

        if (typeof App !== 'function' && (typeof App !== 'object' || App === null)) {
          throw new Error('Generated code does not produce a valid React component. It should be a function or class.');
        }

        const rootElement = document.getElementById('root');
        const root = window.ReactDOM.createRoot(rootElement);
        root.render(window.React.createElement(App));
        log('success', 'Component rendered successfully!');
      } catch (e) {
        log('error', e);
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.innerHTML = \`<div style="color: #ef4444; padding: 2rem; font-family: monospace; white-space: pre-wrap;"><h3>Render Error</h3><p>\${e.stack || e.message}</p></div>\`;
        }
      }
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Preview</title>
          <!-- Using React 18 for modern features like createRoot -->
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <style>
            body { margin: 0; font-family: sans-serif; background-color: #fff; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            ${executionScript}
          </script>
        </body>
      </html>
    `;
  }

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1)
    setDebugLogs([]);
  }

  const handleOpenInNewTab = () => {
    const html = generatePreviewHTML(code);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  const handleRunCode = () => {
    setIsRunning(true);
    handleRefresh();
    setTimeout(() => setIsRunning(false), 1000);
  }

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      // Security: check the source of the message
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      if (event.data.source === 'preview-console') {
        setDebugLogs(prev => [...prev, {
          type: event.data.type,
          message: event.data.message,
          timestamp: event.data.timestamp
        }]);
      }
    }

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-sm font-medium text-gray-700">UI Preview</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`p-2 rounded-lg transition-colors ${
              debugMode 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle Debug Mode"
          >
            <Bug size={16} />
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
            title="Run Code"
          >
            {isRunning ? <Square size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          srcDoc={generatePreviewHTML(code)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="Code Preview"
        />
        {debugMode && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white p-2 max-h-48 overflow-y-auto text-xs font-mono">
            {debugLogs.length > 0 ? (
              debugLogs.map((log, index) => (
                <div key={index} className={`flex items-start space-x-2 py-1 border-b border-gray-700/50 last:border-b-0 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  {log.type === 'error' && <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                  {log.type !== 'error' && <Terminal className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                  <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                  <pre className="whitespace-pre-wrap break-words flex-1">{log.message}</pre>
                </div>
              ))
            ) : (
              <div className="text-gray-400 p-2">No debug logs yet. Run code to see output.</div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}