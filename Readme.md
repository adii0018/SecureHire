# SecureHire - AI-Powered Interview Security Platform

SecureHire is a full-stack web application that combines WebRTC-based peer-to-peer video communication with a modular AI proctoring engine for detecting cheating behavior during online interviews.

## Features

- **Interview Mode (1:1)** - Secure one-on-one interviews with AI proctoring
- **Meeting Mode (1:Many)** - Scalable group video conferencing
- **AI Proctoring** - Real-time detection of:
  - Eye tracking and gaze deviation
  - Multi-face detection
  - Voice analysis
  - Tab switch detection
  - Copy-paste monitoring
- **Risk Analytics** - Aggregated risk scores with full timeline
- **WebRTC** - Peer-to-peer encrypted video with sub-100ms latency

## Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Axios for API calls
- face-api.js for browser-based face detection
- Inline styles (no Tailwind/CSS modules)

### Backend
- Django 4.x + Django REST Framework
- Django Channels for WebSocket support
- Redis as channel layer
- MongoDB for data storage
- JWT authentication

## Project Structure

```
securehire/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Login, Register, Dashboard, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── webrtc/         # WebRTC hooks (to be implemented)
│   │   ├── proctoring/     # AI proctoring hooks (to be implemented)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth context
│   │   └── api/            # Axios configuration
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/
    ├── securehire/         # Django project settings
    ├── apps/
    │   ├── auth_app/       # Authentication
    │   ├── sessions/       # Session management
    │   └── alerts/         # Alert logging
    ├── signaling/          # WebSocket consumers
    ├── requirements.txt
    └── manage.py
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud)
- Redis (local or cloud)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file from example:
```bash
cp .env.example .env
```

5. Update .env with your configuration:
```
SECRET_KEY=your_django_secret_key
DEBUG=True
MONGODB_URI=mongodb://localhost:27017/securehire
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Start the development server:
```bash
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Update .env:
```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Start development server:
```bash
npm run dev
```

6. Open browser to http://localhost:5173

## Environment Variables

### Backend (.env)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `ALLOWED_HOSTS` - Comma-separated allowed hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated CORS origins

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Create account
- `POST /api/auth/login/` - JWT login
- `POST /api/auth/google/` - Google OAuth
- `POST /api/auth/token/refresh/` - Refresh JWT
- `GET /api/auth/me/` - Get current user

### Sessions
- `POST /api/sessions/create/` - Create session
- `GET /api/sessions/` - List user's sessions
- `GET /api/sessions/:code/` - Get session details
- `PATCH /api/sessions/:code/update/` - Update config
- `DELETE /api/sessions/:code/delete/` - Delete session

### Alerts
- `POST /api/alerts/` - Log proctoring alert
- `GET /api/alerts/:sessionCode/` - Get session alerts

### WebSocket
- `ws://localhost:8000/ws/session/:code/` - Session signaling

## WebSocket Events

### Client → Server
- `join` - Join session with name and role
- `offer` - WebRTC offer SDP
- `answer` - WebRTC answer SDP
- `ice` - ICE candidate
- `alert` - Proctoring alert
- `leave` - Leave session

### Server → Client
- `peer_joined` - Peer joined notification
- `peer_left` - Peer left notification
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `ice` - ICE candidate from peer
- `alert_update` - Alert update notification

## Development Status

### ✅ Completed
- Landing page with starfield animation
- Auth pages (Login/Register)
- Dashboard with session management
- Create session flow (3-step)
- Join session page
- Room page with WebRTC setup
- Monitor dashboard
- Backend API (Auth, Sessions, Alerts)
- WebSocket signaling
- MongoDB integration

### 🚧 To Be Implemented
- WebRTC hooks (usePeerConnection, useSignaling)
- Proctoring hooks (useEyeTracking, useFaceDetection, etc.)
- face-api.js integration
- Risk score calculation algorithm
- Google OAuth integration
- Production deployment configuration

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
