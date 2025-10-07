@echo off
echo Starting CBL Sales Order Application...
echo.

echo Installing backend dependencies...
call npm install

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Starting Backend and Frontend...
echo Backend will run on port 3001
echo Frontend will run on port 3002
echo.

start "Backend Server" cmd /k "npm run start:backend"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && set PORT=3002 && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
pause
