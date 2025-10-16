@echo off
echo ========================================
echo   CBL TSO - RESTART SERVERS
echo ========================================
echo.

echo Stopping all running servers...
call stop-windows.bat

echo.
echo Waiting 3 seconds before restarting...
timeout /t 3 /nobreak >nul

echo.
echo Starting servers...
call start-windows.bat

echo.
echo ========================================
echo   RESTART COMPLETED
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo Servers are running in background. Close this window when done.
echo.
pause
