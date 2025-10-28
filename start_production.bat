@echo off
echo 🚀 Starting FlashBet Production Deployment...
echo.

echo 📡 Starting Linera Network...
docker exec -d synapsenet-linera sh -c "cd /tmp && linera net up"
timeout /t 5 /nobreak > nul

echo 🔧 Starting Backend Server...
start "FlashBet Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo 🤖 Starting AI Engine...
start "FlashBet AI Engine" cmd /k "cd ai-engine && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak > nul

echo 🎨 Starting Frontend...
start "FlashBet Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ✅ FlashBet Production Deployment Started!
echo.
echo 🌐 Services Running:
echo   - Backend API: http://localhost:8000
echo   - Frontend UI: http://localhost:3000
echo   - AI Engine: http://localhost:8001
echo   - Linera Network: Docker Container
echo.
echo 🎯 Your prediction market is now live on blockchain!
echo.
pause
