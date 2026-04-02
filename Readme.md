# 🔐 SecureHire

AI-powered real-time interview and meeting platform with intelligent proctoring.

## Features

- **Interview Mode (1:1)** — Secure one-on-one interviews with optional AI proctoring
- **Meeting Mode (1:Many)** — Scalable group video conferencing
- **AI Proctoring Engine** — 6 detection modules for interview security
- **WebRTC P2P** — Low-latency encrypted video communication
- **Real-time Monitoring** — Live risk scoring and alert dashboard

## Tech Stack

**Frontend:** React + Vite, React Router, face-api.js, WebRTC  
**Backend:** Django 4.x, Django REST Framework, Django Channels, Redis, MongoDB  
**Auth:** JWT + Google OAuth

## Setup Instructions

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in values
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB running on localhost:27017
- Redis running on localhost:6379

## Environment Variables

See `.env.example` files in both frontend and backend directories.

## Project Structure

```
securehire/
├── frontend/          # React + Vite application
└── backend/           # Django REST API + WebSocket server
```

## License

MIT
