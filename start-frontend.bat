@echo off
echo Starting SecureHire Frontend...

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env with your configuration!
)

REM Start development server
echo Starting Vite dev server on port 5173...
npm run dev
