# SecureHire - Complete Setup Guide

## Quick Start

### 1. Install Prerequisites

#### MongoDB
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow official MongoDB installation guide

Start MongoDB:
```bash
mongod --dbpath /path/to/data/directory
```

#### Redis
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **Mac**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

Start Redis:
```bash
redis-server
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Generate SECRET_KEY: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Run migrations
python manage.py makemigrations auth_app
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with backend URLs

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## Testing the Application

### 1. Create an Account
- Navigate to http://localhost:5173
- Click "Get Started Free"
- Fill in registration form

### 2. Create a Session
- After login, click "Create Session"
- Choose "Interview Mode"
- Configure proctoring settings
- Copy the session code

### 3. Join as Candidate
- Open a new browser window (or incognito)
- Navigate to http://localhost:5173/join/[CODE]
- Enter your name
- Allow camera/microphone permissions

### 4. Monitor the Session
- In the host window, view the proctoring panel
- See real-time video feed
- Monitor risk score and alerts

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running on port 27017

### Redis Connection Error
```
Error: Error connecting to Redis
```
**Solution**: Ensure Redis is running on port 6379

### WebSocket Connection Failed
```
WebSocket connection to 'ws://localhost:8000/ws/session/...' failed
```
**Solution**: 
- Ensure Daphne is running (not `python manage.py runserver`)
- Check CORS settings in backend/.env

### Camera/Microphone Permission Denied
**Solution**: 
- Check browser permissions
- Use HTTPS in production (required for getUserMedia)
- For local development, use localhost (not 127.0.0.1)

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: 
- Verify CORS_ALLOWED_ORIGINS in backend/.env includes frontend URL
- Restart backend server after changing .env

## Production Deployment

### Backend

1. Set environment variables:
```bash
DEBUG=False
SECRET_KEY=<strong-secret-key>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

2. Use production ASGI server:
```bash
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
```

3. Use production databases:
- MongoDB Atlas for database
- Redis Cloud or AWS ElastiCache for Redis

4. Set up reverse proxy (Nginx):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Frontend

1. Build for production:
```bash
npm run build
```

2. Deploy dist/ folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Your own server with Nginx

3. Update environment variables:
```
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com/ws
```

## Next Steps

### Implement Proctoring Features

The project structure is ready for proctoring implementation. Create these files:

1. `frontend/src/proctoring/useEyeTracking.js`
2. `frontend/src/proctoring/useFaceDetection.js`
3. `frontend/src/proctoring/useVoiceDetection.js`
4. `frontend/src/proctoring/useTabVisibility.js`
5. `frontend/src/proctoring/useCopyPaste.js`
6. `frontend/src/proctoring/useRiskScore.js`

### Add face-api.js Models

Download face-api.js models and place in `frontend/public/models/`:
- tiny_face_detector_model
- face_landmark_68_model

### Implement Google OAuth

1. Get credentials from Google Cloud Console
2. Update .env files with client ID and secret
3. Implement OAuth flow in backend

## Support

For issues or questions:
- Check the README.md
- Review the code comments
- Open an issue on GitHub
