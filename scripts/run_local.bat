@echo off
echo 🚀 Starting FlashBet Local Development Environment...

REM Check if .env files exist
if not exist ".env" (
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
)

if not exist "frontend\.env" (
    echo 📝 Creating frontend\.env from .env.example...
    copy frontend\.env.example frontend\.env
)

REM Start AI Engine
echo 🧠 Starting AI Engine (Python FastAPI)...
cd ai-engine
start "AI Engine" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
cd ..

REM Wait for AI Engine to start
timeout /t 3 /nobreak > nul

REM Start Backend
echo 🔧 Starting Backend (Node.js)...
cd backend
start "Backend" cmd /k "npm start"
cd ..

REM Wait for Backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend
echo 🎨 Starting Frontend (React + Vite)...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ All services started successfully!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    AI Engine: http://localhost:8001
echo.
echo Press any key to exit...
pause > nul