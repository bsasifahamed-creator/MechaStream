'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, FolderTree } from 'lucide-react';

interface IDETerminalProps {
  projectId: string;
  onRefreshTree?: () => void;
  className?: string;
}

type Line = { type: 'prompt' | 'output'; text: string };

const TERMINAL_WS_URL =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TERMINAL_WS_URL
    ? process.env.NEXT_PUBLIC_TERMINAL_WS_URL
    : 'ws://localhost:3002';

function ProjectShellTerminal({
  projectId,
  onRefreshTree,
  className = '',
}: {
  projectId: string;
  onRefreshTree?: () => void;
  className: string;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentDir, setCurrentDir] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const run = async (cmd: string) => {
    if (!cmd.trim()) return;
    setHistory((h) => [...h, cmd].slice(-100));
    setHistoryIndex(-1);
    setInput('');
    setLines((l) => [...l, { type: 'prompt', text: `$ ${cmd}` }]);
    setLoading(true);
    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, command: cmd, currentDir }),
      });
      const data = await res.json();
      const out = data.output ?? '';
      const newDir = data.newDir ?? null;
      if (out) setLines((l) => [...l, { type: 'output', text: out }]);
      if (newDir !== null) setCurrentDir(newDir);
      const lower = cmd.trim().toLowerCase();
      if (
        (lower.startsWith('mkdir ') || lower.startsWith('touch ') || lower.startsWith('rm ')) &&
        onRefreshTree
      ) {
        onRefreshTree();
      }
    } catch (e) {
      setLines((l) => [
        ...l,
        { type: 'output', text: `Error: ${e instanceof Error ? e.message : 'Command failed'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const i = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setInput(history[i]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < 0) return;
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(i);
        setInput(history[i]);
      }
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 text-gray-300 whitespace-pre-wrap break-all">
        {lines.map((line, i) => (
          <div key={i} className={line.type === 'prompt' ? 'text-green-400' : ''}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700">
        <span className="text-green-400">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !projectId}
          placeholder={projectId ? 'pwd, ls, cd, cat, mkdir, touch, rm…' : 'No project'}
          className="flex-1 bg-transparent text-gray-200 outline-none placeholder-gray-600"
        />
      </div>
    </>
  );
}

function DockerShellTerminal({ className = '' }: { className: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'closed' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const termRef = useRef<{ terminal: any; fitAddon: any; ws: WebSocket } | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let mounted = true;

    async function init() {
      const container = containerRef.current;
      if (!container) return;
      try {
        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');
        const term = new Terminal({
          theme: { background: '#0F0F0F', foreground: '#d4d4d4' },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          cursorStyle: 'block',
          cursorBlink: true,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(container);
        fitAddon.fit();

        ws = new WebSocket(TERMINAL_WS_URL);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          if (!mounted) return;
          setStatus('connected');
          termRef.current = { terminal: term, fitAddon, ws: ws! };
        };
        ws.onmessage = (ev) => {
          const data = typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data);
          if (typeof data === 'string' && data.trim().startsWith('{')) {
            try {
              const obj = JSON.parse(data);
              if (obj && obj.type === 'error') {
                term.writeln('\r\n\x1b[31m' + (obj.message || 'Error') + '\x1b[0m');
                return;
              }
            } catch (_) {}
          }
          term.write(data);
        };
        ws.onclose = () => {
          if (!mounted) return;
          setStatus('closed');
          term.writeln('\r\n\x1b[33m[Session closed. Container removed.]\x1b[0m');
        };
        ws.onerror = () => {
          if (!mounted) return;
          setStatus('error');
          setErrorMessage('WebSocket error. Is the terminal server running on port 3002?');
        };

        term.onData((data) => {
          if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
        });
        term.onResize(({ cols, rows }) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          }
        });

        const resizeObs = new ResizeObserver(() => fitAddon.fit());
        resizeObs.observe(container);
        return () => resizeObs.disconnect();
      } catch (e) {
        if (mounted) {
          setStatus('error');
          setErrorMessage(e instanceof Error ? e.message : 'Failed to load terminal');
        }
      }
    }

    init();
    return () => {
      mounted = false;
      if (termRef.current?.ws) termRef.current.ws.close();
      termRef.current = null;
    };
  }, []);

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${className}`}>
      <div ref={containerRef} className="flex-1 min-h-[120px] w-full" />
      {status === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F0F]/90 text-gray-400 text-sm">
          Connecting to Docker shell…
        </div>
      )}
      {status === 'error' && (
        <div className="px-3 py-2 bg-red-900/20 border-t border-red-800 text-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      {status === 'closed' && (
        <div className="px-3 py-2 border-t border-gray-700 text-gray-500 text-sm">
          Session closed. Refresh to start a new Docker shell.
        </div>
      )}
    </div>
  );
}

export default function IDETerminal({ projectId, onRefreshTree, className = '' }: IDETerminalProps) {
  const [mode, setMode] = useState<'project' | 'docker'>('project');

  return (
    <div
      className={`flex flex-col h-full bg-[#0F0F0F] border-t border-gray-700 font-mono text-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gray-700 text-gray-400">
        <div className="flex items-center gap-2">
          <span>Terminal</span>
          <span className="text-xs">/projects/{projectId || '…'}</span>
        </div>
        <div className="flex rounded bg-gray-800 p-0.5">
          <button
            type="button"
            onClick={() => setMode('project')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'project' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Project shell (ls, cd, cat, etc. in project folder)"
          >
            <FolderTree size={12} />
            Project
          </button>
          <button
            type="button"
            onClick={() => setMode('docker')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'docker' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Docker shell (isolated Alpine container per session)"
          >
            <Terminal size={12} />
            Docker
          </button>
        </div>
      </div>
      {mode === 'project' ? (
        <ProjectShellTerminal
          projectId={projectId}
          onRefreshTree={onRefreshTree}
          className={className}
        />
      ) : (
        <DockerShellTerminal className={className} />
      )}
    </div>
  );
}
