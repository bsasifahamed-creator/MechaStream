'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Terminal as TerminalIcon, Play, Folder, File, Trash2, Download, Upload } from 'lucide-react'

interface TerminalCommand {
  id: string
  command: string
  output: string
  timestamp: Date
  status: 'success' | 'error' | 'running'
}

interface FileSystemItem {
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: FileSystemItem[]
}

const Terminal: React.FC = () => {
  const [commands, setCommands] = useState<TerminalCommand[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [currentPath, setCurrentPath] = useState('/project')
  const [isRunning, setIsRunning] = useState(false)
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      name: 'src',
      type: 'directory',
      children: [
        { name: 'App.jsx', type: 'file', content: 'export default function App() {\n  return <div>Hello World</div>\n}' },
        { name: 'index.js', type: 'file', content: 'import React from "react"\nimport App from "./App"\n\nReactDOM.render(<App />, document.getElementById("root"))' }
      ]
    },
    { name: 'package.json', type: 'file', content: '{\n  "name": "my-project",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}' },
    { name: 'README.md', type: 'file', content: '# My Project\n\nThis is a sample project.' }
  ])
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commands])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeCommand = async (command: string) => {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) return

    const commandId = Date.now().toString()
    const newCommand: TerminalCommand = {
      id: commandId,
      command: trimmedCommand,
      output: '',
      timestamp: new Date(),
      status: 'running'
    }

    setCommands(prev => [...prev, newCommand])
    setIsRunning(true)

    // Simulate command execution
    setTimeout(() => {
      const output = processCommand(trimmedCommand)
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, output, status: output.includes('error') ? 'error' : 'success' }
            : cmd
        )
      )
      setIsRunning(false)
    }, 500)
  }

  const processCommand = (command: string): string => {
    const [cmd, ...args] = command.split(' ')

    switch (cmd) {
      case 'ls':
        return listFiles()
      case 'cat':
        return readFile(args[0])
      case 'mkdir':
        return createDirectory(args[0])
      case 'touch':
        return createFile(args[0])
      case 'cd':
        return changeDirectory(args[0])
      case 'pwd':
        return currentPath
      case 'npm':
        return handleNpmCommand(args)
      case 'node':
        return executeNodeScript(args[0])
      case 'clear':
        setCommands([])
        return ''
      case 'help':
        return getHelpText()
      default:
        return `Command not found: ${cmd}. Type 'help' for available commands.`
    }
  }

  const listFiles = (): string => {
    const items = fileSystem.map(item => {
      const icon = item.type === 'directory' ? '📁' : '📄'
      return `${icon} ${item.name}`
    }).join('\n')
    return items || 'No files found'
  }

  const readFile = (filename: string): string => {
    const file = findFile(filename)
    if (!file) return `File not found: ${filename}`
    return file.content || 'Empty file'
  }

  const createDirectory = (dirname: string): string => {
    if (!dirname) return 'Error: Directory name required'
    
    const newDir: FileSystemItem = {
      name: dirname,
      type: 'directory',
      children: []
    }
    
    setFileSystem(prev => [...prev, newDir])
    return `Directory created: ${dirname}`
  }

  const createFile = (filename: string): string => {
    if (!filename) return 'Error: File name required'
    
    const newFile: FileSystemItem = {
      name: filename,
      type: 'file',
      content: ''
    }
    
    setFileSystem(prev => [...prev, newFile])
    return `File created: ${filename}`
  }

  const changeDirectory = (path: string): string => {
    if (!path) return 'Error: Path required'
    if (path === '..') {
      setCurrentPath(prev => prev.split('/').slice(0, -1).join('/') || '/')
      return `Changed to: ${currentPath}`
    }
    setCurrentPath(prev => `${prev}/${path}`)
    return `Changed to: ${currentPath}/${path}`
  }

  const handleNpmCommand = (args: string[]): string => {
    const [subcommand, ...packages] = args
    
    switch (subcommand) {
      case 'install':
        return `Installing packages: ${packages.join(', ')}\n✅ Installation completed`
      case 'run':
        return `Running script: ${packages[0]}\n🚀 Development server started on http://localhost:3000`
      case 'start':
        return `🚀 Starting development server...\n✅ Server running on http://localhost:3000`
      default:
        return `npm ${subcommand}: command not implemented`
    }
  }

  const executeNodeScript = (filename: string): string => {
    const file = findFile(filename)
    if (!file) return `File not found: ${filename}`
    return `Executing ${filename}...\n✅ Script completed successfully`
  }

  const findFile = (filename: string): FileSystemItem | null => {
    return fileSystem.find(item => item.name === filename) || null
  }

  const getHelpText = (): string => {
    return `Available commands:
  ls              - List files and directories
  cat <file>      - Display file contents
  mkdir <dir>     - Create directory
  touch <file>    - Create file
  cd <path>       - Change directory
  pwd             - Show current path
  npm install     - Install packages
  npm run <script> - Run npm script
  node <file>     - Execute Node.js script
  clear           - Clear terminal
  help            - Show this help`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim() || isRunning) return
    
    executeCommand(currentCommand)
    setCurrentCommand('')
  }

  const quickCommands = [
    { label: 'npm install', command: 'npm install react react-dom' },
    { label: 'npm start', command: 'npm start' },
    { label: 'List files', command: 'ls' },
    { label: 'Show path', command: 'pwd' }
  ]

  return (
    <div className="flex flex-col h-full bg-gray-900 text-green-400 font-mono">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-5 h-5" />
          <span className="text-sm font-medium">WebContainer Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => setCurrentCommand(cmd.command)}
              className="px-2 py-1 text-xs bg-gray-700 text-green-400 rounded hover:bg-gray-600 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ height: '400px' }}
      >
        {commands.map((cmd) => (
          <div key={cmd.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">$</span>
              <span className="text-white">{cmd.command}</span>
              {cmd.status === 'running' && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </div>
            {cmd.output && (
              <pre className="text-sm text-gray-300 ml-4 whitespace-pre-wrap">
                {cmd.output}
              </pre>
            )}
          </div>
        ))}

        {/* Current Command Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Enter command..."
            disabled={isRunning}
          />
        </form>
      </div>

      {/* File System Panel */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300">File System</h4>
          <div className="flex space-x-2">
            <button className="p-1 text-gray-400 hover:text-white">
              <Folder className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white">
              <File className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          {fileSystem.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span>{item.type === 'directory' ? '📁' : '📄'}</span>
              <span className="text-gray-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Terminal 