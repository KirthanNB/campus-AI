@echo off
echo ===================================================
echo 🎓 Starting CampusMind AI (Full-Stack Setup)
echo ===================================================

:: Check if .env exists
if not exist .env (
    echo [1/4] Creating .env from .env.example...
    copy .env.example .env
    echo IMPORTANT: Please edit .env and paste your GOOGLE_API_KEY if not added yet.
)

:: Setup Python virtual environment
if not exist backend\venv (
    echo [2/4] Setting up Python virtual environment...
    python -m venv backend\venv
    call backend\venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
    python seed_data.py
    python ingest_data.py
    python -m backend.seed_users
) else (
    echo [2/4] Python virtual environment detected.
)

:: Install Frontend dependencies
if not exist frontend\node_modules (
    echo [3/4] Installing Frontend npm dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [3/4] Frontend node_modules detected.
)

echo [4/4] Launching Backend and Frontend servers...
start "CampusMind AI - Backend Server" cmd /k "backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 >nul

cd frontend
start "CampusMind AI - Frontend UI" cmd /k "npm run dev"
cd ..

echo.
echo ===================================================
echo ✅ CampusMind AI is running!
echo 🌐 Web UI:  http://localhost:5173
echo ⚙️ Backend: http://127.0.0.1:8000/docs
echo ===================================================
echo.
pause
