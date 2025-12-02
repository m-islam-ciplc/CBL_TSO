@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo CBL TSO Cleanup Script
echo ==========================================
echo.

REM Check what user wants to clean
echo What would you like to clean?
echo.
echo 1. Temporary test/debug files
echo 2. Docker resources (containers, images, volumes)
echo 3. Both
echo 4. Cancel
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto clean_files
if "%choice%"=="2" goto clean_docker
if "%choice%"=="3" goto clean_both
if "%choice%"=="4" goto end
goto invalid_choice

:clean_files
echo.
echo ==========================================
echo Cleaning temporary test/debug files...
echo ==========================================
echo.

REM List of temporary files to remove
set files_removed=0

REM Remove temporary test files
if exist "check_power_battery_orders.js" (
    echo Removing check_power_battery_orders.js...
    del /f /q "check_power_battery_orders.js" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed check_power_battery_orders.js
        set /a files_removed+=1
    ) else (
        echo   [SKIP] Could not remove check_power_battery_orders.js
    )
)

REM Remove temporary analysis reports
if exist "FINAL_COLUMN_ANALYSIS_REPORT.md" (
    echo Removing FINAL_COLUMN_ANALYSIS_REPORT.md...
    del /f /q "FINAL_COLUMN_ANALYSIS_REPORT.md" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed FINAL_COLUMN_ANALYSIS_REPORT.md
        set /a files_removed+=1
    ) else (
        echo   [SKIP] Could not remove FINAL_COLUMN_ANALYSIS_REPORT.md
    )
)

REM Remove backend temporary test files
if exist "backend\check_power_battery_orders.js" (
    echo Removing backend\check_power_battery_orders.js...
    del /f /q "backend\check_power_battery_orders.js" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed backend\check_power_battery_orders.js
        set /a files_removed+=1
    )
)

if exist "backend\check_dealer_orders.js" (
    echo Removing backend\check_dealer_orders.js...
    del /f /q "backend\check_dealer_orders.js" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed backend\check_dealer_orders.js
        set /a files_removed+=1
    )
)

if exist "backend\check_dealer_db.js" (
    echo Removing backend\check_dealer_db.js...
    del /f /q "backend\check_dealer_db.js" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed backend\check_dealer_db.js
        set /a files_removed+=1
    )
)

REM Remove temporary SQL files
if exist "check_power_battery_orders.sql" (
    echo Removing check_power_battery_orders.sql...
    del /f /q "check_power_battery_orders.sql" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed check_power_battery_orders.sql
        set /a files_removed+=1
    )
)

REM Remove temporary analysis markdown files
for %%f in (*ANALYSIS*.md) do (
    echo Removing %%f...
    del /f /q "%%f" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Removed %%f
        set /a files_removed+=1
    )
)

echo.
echo ==========================================
echo Cleanup Summary: !files_removed! file(s) removed
echo ==========================================
goto end

:clean_docker
echo.
echo ==========================================
echo Cleaning Docker resources...
echo ==========================================
echo.
echo WARNING: This will remove Docker containers, images, and volumes.
echo.
set /p confirm="Are you sure? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Cleanup cancelled.
    goto end
)

echo.
echo Stopping containers...
docker-compose down 2>nul

echo.
echo Removing unused containers...
docker container prune -f

echo.
echo Removing unused images...
docker image prune -f

echo.
echo Removing unused volumes...
docker volume prune -f

echo.
echo Cleaning build cache...
docker builder prune -f

echo.
echo ==========================================
echo Docker cleanup completed!
echo ==========================================
goto end

:clean_both
call :clean_files
call :clean_docker
goto end

:invalid_choice
echo.
echo Invalid choice. Please run the script again.
goto end

:end
echo.
pause

