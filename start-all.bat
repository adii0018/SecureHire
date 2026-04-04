@echo off
echo Starting SecureHire Backend...
start "SecureHire Backend" cmd /k "cd backend && ..\backend\venv\Scripts\activate && daphne -p 8000 securehire.asgi:application"

timeout /t 3 /nobreak >nul

echo Starting SecureHire Frontend...
start "SecureHire Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
