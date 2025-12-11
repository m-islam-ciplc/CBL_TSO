@echo off
setlocal enabledelayedexpansion

:MENU
cls
echo ========================================
echo    CBL Sales Orders - SERVER MANAGEMENT
echo ========================================
echo.
echo Choose an option:
echo.
echo  [1] Start Servers
echo  [2] Stop Servers
echo  [3] Restart Servers
echo  [4] Check Status
echo  [5] View Logs
echo  [0] Exit
echo.
echo ========================================
set /p choice="Enter your choice (0-5): "

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto LOGS
if "%choice%"=="0" goto END
goto MENU

:START
cls
echo ========================================
echo   STARTING CBL SALES ORDERS SERVERS
echo ========================================
echo.

REM Check if already running
netstat -ano | findstr :5001 | findstr LISTENING >nul
if not errorlevel 1 (
    echo ⚠️  Backend server is already running on port 5001
    echo.
) else (
    echo Installing/Updating backend dependencies...
    if exist backend\node_modules (
        echo Backend dependencies already installed
    ) else (
        cd backend
        call npm install
        cd ..
    )
    
    echo.
    echo Starting Backend server...
    start "Backend Server (Port 5001)" cmd /k "cd /d %~dp0backend && npm run dev"
    echo ✅ Backend started in new window
    timeout /t 2 /nobreak >nul
)

echo.
netstat -ano | findstr :5002 | findstr LISTENING >nul
if not errorlevel 1 (
    echo ⚠️  Frontend server is already running on port 5002
    echo.
) else (
    echo Installing/Updating frontend dependencies...
    if exist frontend\node_modules (
        echo Frontend dependencies already installed
    ) else (
        cd frontend
        call npm install
        cd ..
    )
    
    echo.
    echo Starting Frontend server...
    start "Frontend Server (Port 5002)" cmd /k "cd /d %~dp0frontend && set PORT=5002 && npm start"
    echo ✅ Frontend started in new window
)

echo.
echo ========================================
echo   SERVERS STARTED
echo ========================================
echo.
echo 📍 Access URLs:
echo    Frontend: http://localhost:5002
echo    Backend API: http://localhost:5001
echo.
timeout /t 3 /nobreak >nul
goto MENU

:STOP
cls
echo ========================================
echo   STOPPING CBL SALES ORDERS SERVERS
echo ========================================
echo.

echo Finding and stopping Node.js processes...
set /a count=0

REM Kill processes on port 5001
netstat -ano | findstr :5001 | findstr LISTENING >nul
if not errorlevel 1 (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
        echo Stopping Backend on port 5001: PID %%i
        taskkill /f /pid %%i >nul 2>&1
        set /a count+=1
    )
) else (
    echo ℹ️  No process found on port 5001
)

REM Kill processes on port 5002
netstat -ano | findstr :5002 | findstr LISTENING >nul
if not errorlevel 1 (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5002 ^| findstr LISTENING') do (
        echo Stopping Frontend on port 5002: PID %%i
        taskkill /f /pid %%i >nul 2>&1
        set /a count+=1
    )
) else (
    echo ℹ️  No process found on port 5002
)

echo.
if %count% gtr 0 (
    echo ✅ Stopped %count% server process(es)
) else (
    echo ℹ️  No servers were running
)

echo.
timeout /t 2 /nobreak >nul
goto MENU

:RESTART
cls
echo ========================================
echo   RESTARTING CBL SALES ORDERS SERVERS
echo ========================================
echo.

echo Stopping all running servers...
call :STOP_INTERNAL

echo.
echo Waiting 3 seconds before restarting...
timeout /t 3 /nobreak >nul

echo.
echo Starting servers...
call :START_INTERNAL

echo.
echo ========================================
echo   RESTART COMPLETED
echo ========================================
echo.
timeout /t 3 /nobreak >nul
goto MENU

:STATUS
cls
echo ========================================
echo   SERVER STATUS CHECK
echo ========================================
echo.

echo Checking Backend (Port 5001)...
netstat -ano | findstr :5001 | findstr LISTENING >nul
if not errorlevel 1 (
    echo ✅ Backend is RUNNING
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
        echo    PID: %%i
    )
) else (
    echo ❌ Backend is NOT RUNNING
)

echo.
echo Checking Frontend (Port 5002)...
netstat -ano | findstr :5002 | findstr LISTENING >nul
if not errorlevel 1 (
    echo ✅ Frontend is RUNNING
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5002 ^| findstr LISTENING') do (
        echo    PID: %%i
    )
) else (
    echo ❌ Frontend is NOT RUNNING
)

echo.
echo ========================================
echo.
pause
goto MENU

:LOGS
cls
echo ========================================
echo   VIEW SERVER LOGS
echo ========================================
echo.
echo This will open the server windows to view logs.
echo The logs will be shown in the server windows that appear.
echo.
pause

REM Check if backend is running and open its window
netstat -ano | findstr :5001 | findstr LISTENING >nul
if not errorlevel 1 (
    echo Opening Backend logs...
    start "Backend Logs" cmd /k "echo Backend logs are shown in the Backend Server window"
)

REM Check if frontend is running and open its window
netstat -ano | findstr :5002 | findstr LISTENING >nul
if not errorlevel 1 (
    echo Opening Frontend logs...
    start "Frontend Logs" cmd /k "echo Frontend logs are shown in the Frontend Server window"
)

echo.
echo ℹ️  Check the server windows for detailed logs
echo.
timeout /t 2 /nobreak >nul
goto MENU

:STOP_INTERNAL
REM Internal function to stop servers (used by restart)
netstat -ano | findstr :5001 | findstr LISTENING >nul
if not errorlevel 1 (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
        taskkill /f /pid %%i >nul 2>&1
    )
)
netstat -ano | findstr :5002 | findstr LISTENING >nul
if not errorlevel 1 (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5002 ^| findstr LISTENING') do (
        taskkill /f /pid %%i >nul 2>&1
    )
)
exit /b

:START_INTERNAL
REM Internal function to start servers (used by restart)
REM Check and start backend
netstat -ano | findstr :5001 | findstr LISTENING >nul
if errorlevel 1 (
    if not exist backend\node_modules (
        cd backend
        call npm install
        cd ..
    )
    start "Backend Server (Port 5001)" cmd /k "cd /d %~dp0backend && npm run dev"
    timeout /t 2 /nobreak >nul
)

REM Check and start frontend
netstat -ano | findstr :5002 | findstr LISTENING >nul
if errorlevel 1 (
    start "Frontend Server (Port 5002)" cmd /k "cd /d %~dp0frontend && set PORT=5002 && npm start"
)
exit /b

:END
cls
echo.
echo ========================================
echo   CBL Sales Orders - SERVER MANAGEMENT
echo ========================================
echo.
echo Thanks for using CBL Sales Orders Server Manager
echo.
timeout /t 2 /nobreak >nul
exit /b

