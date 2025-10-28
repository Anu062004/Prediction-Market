#!/bin/bash

echo "🚀 Starting FlashBet Local Development Environment..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env from .env.example..."
    cp frontend/.env.example frontend/.env
fi

# Start AI Engine
echo "🧠 Starting AI Engine (Python FastAPI)..."
cd ai-engine
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
AI_PID=$!
cd ..

# Wait for AI Engine to start
sleep 3

# Start Backend
echo "🔧 Starting Backend (Node.js)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for Backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend (React + Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   AI Engine: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait