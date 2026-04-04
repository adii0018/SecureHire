@echo off
setlocal
set "ROOT=%~dp0"

echo ============================================
echo   SecureHire - Starting All Services
echo ============================================
echo.

REM ── BACKEND ──────────────────────────────────────────────
echo [1/2] Starting Backend (Django + Daphne)...
start "SecureHire Backend" cmd /k ^
  "cd /d "%ROOT%backend" && ^
   if not exist venv ( python -m venv venv ) && ^
   call venv\Scripts\activate && ^
   pip install -r requirements.txt -q && ^
   echo. && echo  Backend deps ready. Starting Daphne... && echo. && ^
   daphne -b 0.0.0.0 -p 8000 securehire.asgi:application"

timeout /t 4 /nobreak >nul

REM ── FRONTEND ─────────────────────────────────────────────
echo [2/2] Starting Frontend (Vite + React)...
start "SecureHire Frontend" cmd /k ^
  "cd /d "%ROOT%frontend" && ^
   if not exist node_modules ( npm install ) && ^
   npm run dev"

echo.
echo ============================================
echo  Backend   ->  http://localhost:8000
echo  Frontend  ->  http://localhost:5173
echo ============================================
echo.
echo  Both servers are starting in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
