@echo off
echo Starting SecureHire Backend...

REM Check if virtual environment exists
if not exist "backend\venv" (
    echo Creating virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Activate virtual environment
echo Activating virtual environment...
call backend\venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
cd backend
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env with your configuration!
)

REM Run migrations
echo Running migrations...
python manage.py makemigrations auth_app
python manage.py migrate

REM Start server
echo Starting Daphne server on port 8000...
daphne -b 0.0.0.0 -p 8000 securehire.asgi:application
