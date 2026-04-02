#!/bin/bash

echo "🚀 Starting SecureHire Frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
fi

# Start development server
echo "✅ Starting Vite dev server on port 5173..."
npm run dev
