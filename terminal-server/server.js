/**
 * WebSocket server for browser-based terminal.
 * Each connection gets an isolated Alpine Linux container; PTY is attached via docker exec.
 * Requires: Docker Desktop (WSL2 on Windows), Node.js.
 */
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const pty = require('node-pty');
const { spawn } = require('child_process');

const PORT = process.env.TERMINAL_SERVER_PORT || 3002;
const MEMORY_MB = 256;
const CPU_LIMIT = 0.5;
const IMAGE = process.env.TERMINAL_IMAGE || 'alpine:latest';

const app = express();
const server = http.createServer(app);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'terminal-ws' });
});

const wss = new WebSocketServer({ server });

function runDocker(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout?.on('data', (d) => { out += d.toString(); });
    proc.stderr?.on('data', (d) => { err += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || out || `docker exit ${code}`));
    });
    proc.on('error', reject);
  });
}

async function startContainer(sessionId) {
  const name = `session_${sessionId.replace(/-/g, '')}`;
  await runDocker([
    'run', '-dit', '--rm',
    '--name', name,
    '--memory', `${MEMORY_MB}m`,
    '--cpus', String(CPU_LIMIT),
    '--network', 'none',
    IMAGE,
    'sh'
  ]);
  return name;
}

function killContainer(containerName) {
  return runDocker(['kill', containerName]).catch(() => {});
}

wss.on('connection', async (ws, req) => {
  const sessionId = uuidv4();
  let containerName = null;
  let ptyProcess = null;

  function send(data) {
    try {
      if (ws.readyState === ws.OPEN) ws.send(data);
    } catch (e) {}
  }

  try {
    containerName = await startContainer(sessionId);
  } catch (e) {
    send(JSON.stringify({ type: 'error', message: 'Failed to start container: ' + (e.message || e) }));
    ws.close();
    return;
  }

  try {
    ptyProcess = pty.spawn('docker', ['exec', '-it', containerName, '/bin/sh'], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
    });

    ptyProcess.onData((data) => send(data));
    ptyProcess.onExit(() => {});

    ws.on('message', (raw) => {
      try {
        const msg = raw.toString();
        if (msg.startsWith('{"type":"resize"')) {
          const { cols, rows } = JSON.parse(msg);
          if (ptyProcess && typeof cols === 'number' && typeof rows === 'number') {
            ptyProcess.resize(cols, rows);
          }
          return;
        }
        if (ptyProcess) ptyProcess.write(msg);
      } catch (_) {}
    });
  } catch (e) {
    send(JSON.stringify({ type: 'error', message: 'PTY failed: ' + (e.message || e) }));
    if (containerName) await killContainer(containerName);
    ws.close();
    return;
  }

  ws.on('close', async () => {
    if (ptyProcess) {
      try { ptyProcess.kill(); } catch (_) {}
    }
    if (containerName) await killContainer(containerName);
  });
});

server.listen(PORT, () => {
  console.log(`Terminal WebSocket server on ws://localhost:${PORT}`);
});
