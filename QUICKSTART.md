# SecureHire - Quick Start Guide

Get SecureHire up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Python 3.9+ (`python --version`)
- ✅ MongoDB running (`mongod`)
- ✅ Redis running (`redis-server`)

## Option 1: Using Start Scripts (Recommended)

### Windows

1. **Start Backend** (in one terminal):
```cmd
start-backend.bat
```

2. **Start Frontend** (in another terminal):
```cmd
start-frontend.bat
```

### Mac/Linux

1. **Make scripts executable**:
```bash
chmod +x start-backend.sh start-frontend.sh
```

2. **Start Backend** (in one terminal):
```bash
./start-backend.sh
```

3. **Start Frontend** (in another terminal):
```bash
./start-frontend.sh
```

## Option 2: Manual Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Edit .env file with your settings

python manage.py makemigrations auth_app
python manage.py migrate
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env

# Edit .env file with backend URLs

npm run dev
```

## Access the Application

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:8000/api
- 🔧 **Admin Panel**: http://localhost:8000/admin

## First Steps

### 1. Create an Account
1. Open http://localhost:5173
2. Click "Get Started Free"
3. Fill in your details
4. Click "Sign Up"

### 2. Create Your First Session
1. After login, you'll see the Dashboard
2. Click "Create" on the "Create Session" card
3. Choose "Interview Mode (1:1)"
4. Configure proctoring settings (all enabled by default)
5. Click "Create Session"
6. Copy the 6-character session code

### 3. Test the Interview Flow
1. **As Host**: You're now in the session creation success screen
2. Click "Start Session" to enter the room
3. Allow camera/microphone permissions
4. **As Candidate**: Open a new browser window (or incognito mode)
5. Navigate to http://localhost:5173/join/[YOUR-CODE]
6. Enter your name
7. Click "Join Session"
8. Allow camera/microphone permissions

### 4. Observe the Connection
- Both windows should show video feeds
- Host window shows the proctoring panel on the right
- Risk score gauge is visible
- Alert feed is ready to display violations

## Common Issues & Solutions

### "MongoDB connection refused"
```bash
# Start MongoDB
mongod --dbpath /path/to/data
```

### "Redis connection refused"
```bash
# Start Redis
redis-server
```

### "WebSocket connection failed"
- Make sure you're using Daphne, not `python manage.py runserver`
- Check that backend is running on port 8000
- Verify CORS settings in backend/.env

### "Camera/Microphone not working"
- Use `localhost` not `127.0.0.1` in browser
- Check browser permissions
- For production, HTTPS is required

### "Module not found" errors
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
MONGODB_URI=mongodb://localhost:27017/securehire
REDIS_URL=redis://localhost:6379
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Generate SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## What's Working

✅ User registration and login
✅ Session creation with unique codes
✅ Join session via code or link
✅ WebRTC video/audio connection
✅ Real-time WebSocket signaling
✅ Dashboard with session management
✅ Beautiful UI with animated starfield
✅ Responsive design

## What's Next

The foundation is complete! To add AI proctoring:

1. **Download face-api.js models**:
   - Get from: https://github.com/justadudewhohacks/face-api.js-models
   - Place in `frontend/public/models/`

2. **Implement proctoring hooks**:
   - `frontend/src/proctoring/useFaceDetection.js`
   - `frontend/src/proctoring/useEyeTracking.js`
   - `frontend/src/proctoring/useVoiceDetection.js`
   - `frontend/src/proctoring/useTabVisibility.js`
   - `frontend/src/proctoring/useCopyPaste.js`

3. **Integrate with Room component**:
   - Import proctoring hooks
   - Send alerts via WebSocket
   - Update risk score in real-time

## Need Help?

- 📖 Check `README.md` for project overview
- 🔧 See `SETUP.md` for detailed setup
- 📊 Review `PROJECT_STATUS.md` for implementation status
- 💬 Open an issue on GitHub

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Daphne reloads on Python file changes

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Check terminal output for errors
- WebSocket: Use browser Network tab → WS filter

### Database Inspection
```bash
# MongoDB
mongosh
use securehire
db.sessions.find()
db.alerts.find()

# Redis
redis-cli
KEYS *
```

### Creating Test Users
```bash
cd backend
python manage.py createsuperuser
```

## Next Steps

1. ✅ Get the app running
2. ✅ Create a test account
3. ✅ Create and join a session
4. 🔄 Implement proctoring features
5. 🔄 Add Google OAuth
6. 🔄 Deploy to production

Happy coding! 🚀
