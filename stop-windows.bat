@echo off
echo Stopping CBL Sales Order servers...
echo.

echo Finding and stopping Node.js processes...
echo.

REM Find all node.exe processes and kill them
for /f "tokens=2" %%i in ('tasklist ^| findstr node.exe') do (
    echo Stopping process: %%i
    taskkill /f /pid %%i >nul 2>&1
)

echo.
echo Finding and stopping React development servers...
echo.

REM Also kill any processes on ports 3001 and 3002
netstat -ano | findstr :3001 | findstr LISTENING >nul && (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
        echo Stopping process on port 3001: %%i
        taskkill /f /pid %%i >nul 2>&1
    )
)

netstat -ano | findstr :3002 | findstr LISTENING >nul && (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3002 ^| findstr LISTENING') do (
        echo Stopping process on port 3002: %%i
        taskkill /f /pid %%i >nul 2>&1
    )
)

echo.
echo All servers stopped successfully!
echo.
pause
