@echo off
set "ROOT=%~dp0"

REM ── BACKEND ──────────────────────────────────────────────
start "SecureHire Backend" cmd /k ^
  "cd /d \"%ROOT%backend\" && ^
   if not exist venv (python -m venv venv) && ^
   call venv\Scripts\activate && ^
   pip install -r requirements.txt && ^
   python manage.py makemigrations auth_app && ^
   python manage.py migrate && ^
   daphne -b 0.0.0.0 -p 8000 securehire.asgi:application"

timeout /t 3 /nobreak >nul

REM ── FRONTEND ─────────────────────────────────────────────
start "SecureHire Frontend" cmd /k ^
  "cd /d \"%ROOT%frontend\" && ^
   if not exist node_modules (npm install) && ^
   npm run dev"

echo.
echo  Backend  -^>  http://localhost:8000
echo  Frontend -^>  http://localhost:5173
echo.
pause
