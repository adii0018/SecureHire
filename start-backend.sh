#!/bin/bash

echo "🚀 Starting SecureHire Backend..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd backend
    python -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
cd backend
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
fi

# Run migrations
echo "🗄️  Running migrations..."
python manage.py makemigrations auth_app
python manage.py migrate

# Start server
echo "✅ Starting Daphne server on port 8000..."
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
