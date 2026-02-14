# Terminal WebSocket Server (Docker Shell)

This server provides **isolated Alpine Linux containers** for the Code IDE terminal. Each browser session gets its own container; closing the tab removes the container.

## Requirements

- **Docker Desktop** (with WSL2 on Windows)
- **Node.js** (LTS)
- On Windows: run this server **inside WSL2** for best compatibility with `node-pty` and Docker.

## Quick start

```bash
cd terminal-server
npm install
npm start
```

Then in the Code IDE, open the terminal, switch to **Docker** mode, and use the shell. Default URL: `ws://localhost:3002`.

## Options

- `TERMINAL_SERVER_PORT` – port (default `3002`)
- `TERMINAL_IMAGE` – image (default `alpine:latest`)

## Main app

From the project root you can run:

```bash
npm run terminal-server
```

Frontend uses `NEXT_PUBLIC_TERMINAL_WS_URL` (e.g. `ws://localhost:3002`) or falls back to `ws://localhost:3002`.
