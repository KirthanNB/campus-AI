#!/bin/bash
echo "==================================================="
echo "🎓 Starting CampusMind AI (Full-Stack Setup)"
echo "==================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "[1/4] Creating .env from .env.example..."
    cp .env.example .env
    echo "IMPORTANT: Please edit .env and paste your GOOGLE_API_KEY if not added yet."
fi

# Setup Python virtual environment
if [ ! -d "backend/venv" ]; then
    echo "[2/4] Setting up Python virtual environment..."
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
    python seed_data.py
    python ingest_data.py
    python -m backend.seed_users
else
    echo "[2/4] Python virtual environment detected."
    source backend/venv/bin/activate
fi

# Install Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "[3/4] Installing Frontend npm dependencies..."
    cd frontend && npm install && cd ..
else
    echo "[3/4] Frontend node_modules detected."
fi

echo "[4/4] Launching Backend and Frontend servers..."
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==================================================="
echo "✅ CampusMind AI is running!"
echo "🌐 Web UI:  http://localhost:5173"
echo "⚙️ Backend: http://127.0.0.1:8000/docs"
echo "==================================================="
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
