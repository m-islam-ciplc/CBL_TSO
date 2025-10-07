@echo off
echo Starting CBL Sales Order Application...
echo.
echo Installing dependencies...
call npm install
call npm install concurrently --save-dev

echo.
echo Starting Backend and Frontend...
call npm run start:all

pause
