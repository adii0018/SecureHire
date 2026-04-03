@echo off
set "ROOT=%~dp0"

echo ============================================
echo   SecureHire - Starting All Services
echo ============================================
echo.

REM ── CHECK MONGODB ─────────────────────────────────────────
echo [1/3] Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  WARNING: mongod not found in PATH.
    echo  Make sure MongoDB is installed and running on localhost:27017
    echo  Download: https://www.mongodb.com/try/download/community
    echo.
    pause
)

REM ── BACKEND ──────────────────────────────────────────────
echo [2/3] Starting Backend (Django + Daphne)...
start "SecureHire Backend" cmd /k ^
  "cd /d \"%ROOT%backend\" && ^
   if not exist venv (python -m venv venv) && ^
   call venv\Scripts\activate && ^
   pip install -r requirements.txt -q && ^
   echo Backend deps installed. Starting server... && ^
   daphne -b 0.0.0.0 -p 8000 securehire.asgi:application"

timeout /t 5 /nobreak >nul

REM ── FRONTEND ─────────────────────────────────────────────
echo [3/3] Starting Frontend (Vite + React)...
start "SecureHire Frontend" cmd /k ^
  "cd /d \"%ROOT%frontend\" && ^
   if not exist node_modules (npm install) && ^
   npm run dev"

echo.
echo ============================================
echo  Backend   ->  http://localhost:8000
echo  Frontend  ->  http://localhost:5173
echo  API Docs  ->  http://localhost:8000/api/
echo ============================================
echo.
echo  Both servers are starting in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
