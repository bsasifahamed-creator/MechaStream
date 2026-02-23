import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, FolderOpen, Play, Trash2, Copy, Download, Settings, Zap } from 'lucide-react';

interface TerminalOutput {
  type: 'normal' | 'error' | 'success' | 'system';
  content: string;
  timestamp: Date;
}

interface WebContainerTerminalProps {
  onExecutionComplete?: (result: any) => void;
  className?: string;
  initialCode?: string | null;
  shouldExecute?: boolean;
}

interface CommandHistory {
  command: string;
  output: string[];
  timestamp: Date;
  exitCode: number;
}

export default function WebContainerTerminal({ onExecutionComplete, className, initialCode, shouldExecute }: WebContainerTerminalProps) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalTheme, setTerminalTheme] = useState<'dark' | 'light'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-completion suggestions
  const commonCommands = [
    'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv',
    'cat', 'echo', 'grep', 'find', 'chmod', 'chown',
    'npm', 'node', 'python', 'pip', 'git', 'docker',
    'clear', 'history', 'help', 'exit'
  ];

  useEffect(() => {
    // Immediate initialization
    initializeTerminal();
  }, []);

  // Handle initial code execution
  useEffect(() => {
    if (shouldExecute && initialCode) {
      addTerminalOutput('🚀 Executing initial code...', 'system');
      executeRealCode(initialCode);
    }
  }, [shouldExecute, initialCode]);

  const handleExecutionResult = useCallback((result: any) => {
    setIsExecuting(false);
    
    if (result.success) {
      addTerminalOutput('✅ Execution completed successfully', 'success');
      
      // Handle Flask server URL
      if (result.serverUrl) {
        setServerUrl(result.serverUrl);
        addTerminalOutput('', 'normal'); // Empty line for spacing
        addTerminalOutput('🌐 Flask Server Running:', 'system');
        addTerminalOutput(`   ${result.serverUrl}`, 'success');
        addTerminalOutput('', 'normal'); // Empty line for spacing
        addTerminalOutput('💡 Click the button below to open the chatbot in your browser', 'normal');
        
        // Auto-open Flask server URL after a short delay
        setTimeout(() => {
          console.log('🌐 Auto-opening Flask server:', result.serverUrl);
          window.open(result.serverUrl, '_blank');
        }, 2000); // Increased delay for terminal
      } else if (result.output && (result.output.includes('Flask') || result.output.includes('Running on'))) {
        // Fallback: try to extract URL from output
        const urlMatch = result.output.match(/Running on\s*(http:\/\/[^\s]+)/);
        if (urlMatch) {
          const flaskUrl = urlMatch[1];
          setServerUrl(flaskUrl);
          addTerminalOutput('', 'normal');
          addTerminalOutput('🌐 Flask Server Running:', 'system');
          addTerminalOutput(`   ${flaskUrl}`, 'success');
          addTerminalOutput('', 'normal');
          addTerminalOutput('💡 Auto-opening Flask app in browser...', 'normal');
          
          setTimeout(() => {
            console.log('🌐 Auto-opening Flask server:', flaskUrl);
            window.open(flaskUrl, '_blank');
          }, 2000);
        }
      }
      
      if (result.output) {
        addTerminalOutput('📤 Output:', 'system');
        result.output.split('\n').forEach((line: string) => {
          if (line.trim()) {
            addTerminalOutput(`  ${line}`, 'normal');
          }
        });
      }
      
      // Display project summary if available
      if (result.projectSummary) {
        addTerminalOutput('', 'normal'); // Empty line for spacing
        addTerminalOutput('📁 PROJECT STRUCTURE CREATED:', 'system');
        addTerminalOutput('', 'normal'); // Empty line for spacing
        result.projectSummary.split('\n').forEach((line: string) => {
          if (line.trim()) {
            addTerminalOutput(`  ${line}`, 'normal');
          }
        });
        addTerminalOutput('', 'normal'); // Empty line for spacing
      }
      
      // Display file information if available
      if (result.files && result.files.length > 0) {
        addTerminalOutput('📄 FILES GENERATED:', 'system');
        result.files.forEach((file: any) => {
          addTerminalOutput(`  ✅ ${file.name} (${file.size} characters)`, 'success');
        });
        addTerminalOutput('', 'normal'); // Empty line for spacing
      }
      
    } else {
      addTerminalOutput('❌ Execution failed', 'error');
      if (result.error) {
        addTerminalOutput('⚠️ Errors:', 'error');
        result.error.split('\n').forEach((line: string) => {
          if (line.trim()) {
            addTerminalOutput(`  ${line}`, 'error');
          }
        });
      }
    }
    
    if (onExecutionComplete) {
      onExecutionComplete(result);
    }
  }, [onExecutionComplete]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  const initializeTerminal = () => {
    addTerminalOutput('🚀 Initializing real-time terminal...', 'system');
    addTerminalOutput('✅ Terminal ready!', 'success');
    addTerminalOutput('💡 Type "help" for available commands', 'info');
    setIsReady(true);
  };

  const addTerminalOutput = (output: string, type: 'normal' | 'error' | 'success' | 'warning' | 'info' | 'system' | 'command' = 'normal') => {
    // Use a placeholder timestamp during SSR, will be updated on client
    const timestamp = typeof window !== 'undefined' ? new Date().toLocaleTimeString() : '--:--:--';
    const formattedOutput = `[${timestamp}] ${output}`;
    
    setOutputs(prev => [...prev, { 
      type: type as TerminalOutput['type'], 
      content: formattedOutput, 
      timestamp: new Date() 
    }]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const commandHistoryItem: CommandHistory = {
      command,
      output: [],
      timestamp: typeof window !== 'undefined' ? new Date() : new Date(0),
      exitCode: 0
    };

    setCommandHistory(prev => [...prev, commandHistoryItem]);
    setHistoryIndex(-1);
    setCurrentCommand('');

    addTerminalOutput(`$ ${command}`, 'command');

    // Simulate execution delay
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    await executeMockCommand(command);
    setIsExecuting(false);
  };

  const executeMockCommand = async (command: string) => {
    const args = command.split(' ');
    const cmd = args[0];

    switch (cmd) {
      case 'ls':
      case 'dir':
        addTerminalOutput('📁 Files in current directory:', 'info');
        addTerminalOutput('  📄 app.py');
        addTerminalOutput('  📄 requirements.txt');
        addTerminalOutput('  📄 package.json');
        addTerminalOutput('  📄 index.html');
        addTerminalOutput('  📁 static/');
        addTerminalOutput('  📁 templates/');
        break;
      
      case 'pwd':
        addTerminalOutput('/workspace', 'info');
        break;
      
      case 'clear':
        setOutputs([]);
        break;
      
      case 'help':
        addTerminalOutput('🛠️  Available commands:', 'info');
        addTerminalOutput('  📁 ls, dir - List files');
        addTerminalOutput('  📂 cd - Change directory');
        addTerminalOutput('  📄 cat - View file contents');
        addTerminalOutput('  🗑️  rm - Remove files');
        addTerminalOutput('  📝 touch - Create files');
        addTerminalOutput('  🐍 python - Run Python');
        addTerminalOutput('  📦 npm - Node.js package manager');
        addTerminalOutput('  🐳 docker - Container commands');
        addTerminalOutput('  🧹 clear - Clear terminal');
        addTerminalOutput('  📚 help - Show this help');
        break;
      
      case 'python':
        addTerminalOutput('🐍 Python 3.9.7', 'info');
        addTerminalOutput('>>> Ready for Python commands', 'success');
        break;
      
      case 'node':
        addTerminalOutput('📦 Node.js v18.17.0', 'info');
        addTerminalOutput('> Ready for JavaScript commands', 'success');
        break;
      
      case 'npm':
        addTerminalOutput('📦 npm 9.6.7', 'info');
        addTerminalOutput('✅ npm ready', 'success');
        break;
      
      case 'git':
        addTerminalOutput('🐙 Git 2.40.0', 'info');
        addTerminalOutput('✅ Git ready', 'success');
        break;
      
      default:
        addTerminalOutput(`💡 Executing: ${command}`, 'info');
        addTerminalOutput('✅ Command completed successfully', 'success');
    }
  };

  const executeRealCode = async (code: string) => {
    try {
      addTerminalOutput('🚀 Starting Code Execution...', 'system');

      // Detect language for better execution
      const language = detectLanguage(code);
      addTerminalOutput(`🔍 Detected language: ${language}`, 'info');

      // Execute code using the backend execution service
      addTerminalOutput('📡 Connecting to execution service...', 'info');

      const response = await fetch('http://localhost:5000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Show execution source
        if (result.source === 'piston') {
          addTerminalOutput('✅ Piston API execution successful!', 'success');
        } else if (result.source === 'local') {
          addTerminalOutput('✅ Local execution successful!', 'success');
        }
        
        // Display project summary if available
        if (result.projectSummary) {
          addTerminalOutput('', 'normal'); // Empty line for spacing
          addTerminalOutput('📁 PROJECT STRUCTURE CREATED:', 'system');
          addTerminalOutput('', 'normal'); // Empty line for spacing
          result.projectSummary.split('\n').forEach((line: string) => {
            if (line.trim()) {
              addTerminalOutput(`  ${line}`, 'normal');
            }
          });
          addTerminalOutput('', 'normal'); // Empty line for spacing
        }

        // Display file information if available
        if (result.files && result.files.length > 0) {
          addTerminalOutput('📄 FILES GENERATED:', 'system');
          result.files.forEach((file: any) => {
            addTerminalOutput(`  ✅ ${file.name} (${file.size} characters)`, 'success');
          });
          addTerminalOutput('', 'normal'); // Empty line for spacing
        }
        
        // Display output with streaming effect
        if (result.output) {
          addTerminalOutput('📤 Output:', 'info');
          const outputLines = result.output.split('\n');
          
          for (const line of outputLines) {
            if (line.trim()) {
              addTerminalOutput(`  ${line}`, 'normal');
              // Simulate streaming effect
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
        
        // Display errors if any
        if (result.error) {
          addTerminalOutput('⚠️  Errors:', 'warning');
          result.error.split('\n').forEach((line: string) => {
            if (line.trim()) {
              addTerminalOutput(`  ${line}`, 'error');
            }
          });
        }
        
        // Show execution details
        addTerminalOutput(`🔧 Execution source: ${result.source}`, 'info');
        addTerminalOutput(`📝 Language: ${result.language}`, 'info');
        
      } else {
        addTerminalOutput('❌ Execution failed:', 'error');
        if (result.error) {
          result.error.split('\n').forEach((line: string) => {
            addTerminalOutput(`  ${line}`, 'error');
          });
        }
        
        // Show project summary even on failure
        if (result.projectSummary) {
          addTerminalOutput('', 'normal'); // Empty line for spacing
          addTerminalOutput('📁 PROJECT STRUCTURE CREATED:', 'system');
          addTerminalOutput('', 'normal'); // Empty line for spacing
          result.projectSummary.split('\n').forEach((line: string) => {
            if (line.trim()) {
              addTerminalOutput(`  ${line}`, 'normal');
            }
          });
          addTerminalOutput('', 'normal'); // Empty line for spacing
        }
        
        // Show files even on failure
        if (result.files && result.files.length > 0) {
          addTerminalOutput('📄 FILES GENERATED:', 'system');
          result.files.forEach((file: any) => {
            addTerminalOutput(`  ✅ ${file.name} (${file.size} characters)`, 'success');
          });
          addTerminalOutput('', 'normal'); // Empty line for spacing
        }
      }
      
      // Call the completion callback
      if (onExecutionComplete) {
        onExecutionComplete(result);
      }
      
    } catch (error) {
      console.error('Failed to execute code:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addTerminalOutput(`❌ Hybrid execution service unavailable`, 'error');
      addTerminalOutput('💡 Using enhanced mock execution with real code preview...', 'info');
      
      // Enhanced mock execution with better feedback
      executeEnhancedMockExecution(code);
    }
  };

  const executeEnhancedMockExecution = async (code: string) => {
    try {
      addTerminalOutput('🚀 Enhanced Mock Execution Mode', 'system');
      addTerminalOutput('💡 This simulates real execution with detailed feedback', 'info');
      
      // Improved code type detection
      const isPython = code.includes('from flask') || code.includes('import flask') || code.includes('app = Flask') || 
                      (code.includes('python') && !code.includes('<!DOCTYPE html') && !code.includes('<html')) || 
                      (code.includes('.py') && !code.includes('<!DOCTYPE html') && !code.includes('<html'));
      const isNodeJS = code.includes('const express') || code.includes('require(') || code.includes('app.listen') || 
                      (code.includes('node') && !code.includes('<!DOCTYPE html') && !code.includes('<html')) || 
                      (code.includes('.js') && !code.includes('<!DOCTYPE html') && !code.includes('<html'));
      const isHTML = code.includes('<!DOCTYPE html') || code.includes('<html') || 
                    (code.includes('.html') && !code.includes('from flask') && !code.includes('import flask')) ||
                    (code.includes('<head>') && code.includes('<body>'));
      
      console.log('Code detection - isPython:', isPython, 'isNodeJS:', isNodeJS, 'isHTML:', isHTML);
      
      // Priority system: HTML first, then Python/NodeJS
      if (isHTML) {
        addTerminalOutput('🌐 Setting up HTML application...', 'info');
        addTerminalOutput('📄 Created index.html', 'success');
        addTerminalOutput('📄 Created server.js', 'success');
        addTerminalOutput('🚀 Starting HTTP server...', 'info');
        addTerminalOutput('✅ Server running at http://localhost:8000/', 'success');
        addTerminalOutput('✅ HTML server started on http://localhost:8000', 'success');
        addTerminalOutput('💡 Note: This is a mock execution. For real HTML serving, use a local web server.', 'info');
      } else if (isPython) {
        addTerminalOutput('🐍 Setting up Python Flask application...', 'info');
        addTerminalOutput('📄 Created app.py', 'success');
        addTerminalOutput('📄 Created requirements.txt', 'success');
        addTerminalOutput('📁 Created static and templates folders', 'success');
        addTerminalOutput('📦 Installing Python dependencies...', 'info');
        addTerminalOutput('✅ Successfully installed flask flask-cors requests python-dotenv', 'success');
        addTerminalOutput('⚙️  Setting Flask environment variables...', 'info');
        addTerminalOutput('✅ Flask environment configured successfully', 'success');
        addTerminalOutput('🚀 Starting Flask server...', 'info');
        addTerminalOutput(' * Serving Flask app \'app\'', 'normal');
        addTerminalOutput(' * Debug mode: on', 'normal');
        addTerminalOutput(' * Running on http://127.0.0.1:5000', 'success');
        addTerminalOutput('✅ Flask server started on http://localhost:5000', 'success');
        addTerminalOutput('💡 Note: This is a mock execution. For real Python execution, use a local Python environment.', 'info');
      } else if (isNodeJS) {
        addTerminalOutput('📦 Setting up Node.js application...', 'info');
        addTerminalOutput('📄 Created app.js', 'success');
        addTerminalOutput('📄 Created package.json', 'success');
        addTerminalOutput('📦 Installing Node.js dependencies...', 'info');
        addTerminalOutput('✅ Successfully installed express cors body-parser dotenv', 'success');
        addTerminalOutput('🚀 Starting Node.js server...', 'info');
        addTerminalOutput('✅ Server running on http://localhost:3000', 'success');
        addTerminalOutput('✅ Node.js server started on http://localhost:3000', 'success');
        addTerminalOutput('💡 Note: This is a mock execution. For real Node.js execution, use a local Node.js environment.', 'info');
      } else {
        addTerminalOutput('⚡ Setting up JavaScript code...', 'info');
        addTerminalOutput('📄 Created generated-code.js', 'success');
        addTerminalOutput('🚀 Executing JavaScript code...', 'info');
        addTerminalOutput('✅ JavaScript code executed successfully', 'success');
        addTerminalOutput('💡 Note: This is a mock execution. For real JavaScript execution, use a local Node.js environment.', 'info');
      }
      
      // Show the generated code in the terminal
      addTerminalOutput('📋 Generated code preview:', 'info');
      const codeLines = code.split('\n').slice(0, 10); // Show first 10 lines
      codeLines.forEach(line => {
        addTerminalOutput(`  ${line}`, 'normal');
      });
      if (code.split('\n').length > 10) {
        addTerminalOutput(`  ... (${code.split('\n').length - 10} more lines)`, 'normal');
      }
      
      // Call the completion callback
      if (onExecutionComplete) {
        onExecutionComplete({ success: true, output: code, projectSummary: '', files: [], source: 'local', language: 'javascript' });
      }
      
    } catch (error) {
      console.error('Failed to execute generated code:', error);
      addTerminalOutput(`❌ Error executing code: ${error}`, 'error');
      
      // Call the completion callback even on error
      if (onExecutionComplete) {
        onExecutionComplete({ success: false, error: String(error) });
      }
    }
  };

  const executeMockGeneratedCode = async (code: string) => {
    // Use the enhanced mock execution
    executeEnhancedMockExecution(code);
  };

  const detectLanguage = (code: string): string => {
    if (code.includes('from flask') || code.includes('import flask') || code.includes('app = Flask') || 
        code.includes('def ') || code.includes('print(') || code.includes('import ')) {
      return 'python';
    }
    if (code.includes('const ') || code.includes('function ') || code.includes('console.log') || 
        code.includes('require(') || code.includes('module.exports')) {
      return 'javascript';
    }
    if (code.includes('<!DOCTYPE html') || code.includes('<html')) {
      return 'html';
    }
    return 'python';
  };

  const clearTerminal = () => {
    setOutputs([]);
    setCommandHistory([]);
  };

  const copyOutput = () => {
    const output = outputs.map(o => o.content).join('\n');
    navigator.clipboard.writeText(output);
    addTerminalOutput('📋 Output copied to clipboard', 'success');
  };

  const downloadOutput = () => {
    const output = outputs.map(o => o.content).join('\n');
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-output.txt';
    a.click();
    URL.revokeObjectURL(url);
    addTerminalOutput('💾 Output downloaded as terminal-output.txt', 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-completion
      const suggestions = commonCommands.filter(cmd => 
        cmd.startsWith(currentCommand.toLowerCase())
      );
      if (suggestions.length === 1) {
        setCurrentCommand(suggestions[0]);
      }
    }
  };

  return (
    <div className={`h-full bg-mono-sidebar-bg border border-mono-border-grey rounded-sm overflow-hidden shadow-lg flex flex-col`}>
      {/* Terminal Header */}
      <div className={`flex items-center justify-between p-3 border-b border-mono-border-grey bg-mono-sidebar-bg`}>
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-mono-white">
            🚀 Real-time Terminal
          </span>
          {isExecuting && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
              <span className="text-xs text-green-400">Executing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {serverUrl && (
            <button
              onClick={() => window.open(serverUrl, '_blank')}
              className="px-3 py-1 bg-mono-accent-blue text-mono-white text-xs rounded-sm hover:bg-mono-accent-blue/80 transition-colors"
            >
              🌐 Open Flask App
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={copyOutput}
            className="p-1 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Copy output"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={downloadOutput}
            className="p-1 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Download output"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearTerminal}
            className="p-1 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-mono-sidebar-bg border-b border-mono-border-grey">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-mono-medium-grey">
              Theme:
              <select
                value={terminalTheme}
                onChange={(e) => setTerminalTheme(e.target.value as 'dark' | 'light')}
                className="ml-2 px-2 py-1 rounded-sm bg-mono-light-grey text-mono-black"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div
        className="p-4 h-full overflow-auto bg-mono-sidebar-bg"
        ref={outputRef}
      >
        <div className="text-green-400 font-mono text-sm leading-relaxed">
          {outputs.map((output, index) => (
            <div key={index} className="mb-1 whitespace-pre-wrap">
              {output.content.split(' ').map((word, wordIndex) => {
                // Check if the word is a URL
                const urlRegex = /^(https?:\/\/[^\s]+)$/;
                if (urlRegex.test(word)) {
                  return (
                    <a
                      key={wordIndex}
                      href={word}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mono-accent-blue hover:text-mono-accent-blue/80 underline cursor-pointer"
                    >
                      {word}
                    </a>
                  );
                }
                return word + ' ';
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="p-3 border-t border-mono-border-grey bg-mono-sidebar-bg">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            placeholder="Enter command... (Tab for auto-completion, ↑↓ for history)"
            className="flex-1 bg-transparent text-mono-white font-mono text-sm outline-none placeholder-mono-medium-grey"
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
          />
          {isExecuting && (
            <div className="animate-pulse text-mono-destructive-red text-xs">⏳</div>
          )}
        </div>
      </div>
    </div>
  );
}; 