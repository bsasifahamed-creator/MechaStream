# MechaStream

> Prompt. Generate. Ship.

AI web builder for agencies and freelancers.
Schema-first generation → controlled React output →
one-click deploy.

## Stack
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Python Flask
- AI: Qwen3 via Ollama
- Database: PostgreSQL

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Environment
```bash
cp .env.example .env
# Fill in your values
```

## Structure
- **frontend/** — Next.js app (Studio, docs, dashboard, auth)
- **backend/** — Flask API (generate, export, deploy, auth, billing)

## Status
V1 in development. Target launch: October 2025.
