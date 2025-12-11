@echo off
setlocal enabledelayedexpansion

echo CBL Sales Orders Docker Deployment Script
echo ==========================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are available

REM Stop any existing containers (if any)
echo [INFO] Stopping any existing containers...
docker-compose down 2>nul

REM Build and start services
echo [INFO] Building and starting services...
docker-compose up -d --build

REM Wait for services to be healthy
echo [INFO] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo [INFO] Checking service status...
docker-compose ps

REM Check health endpoints
echo [INFO] Checking health endpoints...

REM Check backend health
curl -f http://localhost:5001/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend health check failed
) else (
    echo [OK] Backend is healthy
)

REM Check frontend
curl -f http://localhost >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend is not accessible
) else (
    echo [OK] Frontend is accessible
)

REM Check database
docker-compose exec mysql mysqladmin ping -h localhost >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database health check failed
) else (
    echo [OK] Database is healthy
)

echo.
echo [SUCCESS] Deployment completed!
echo.
echo Service URLs:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:5001
echo    Database: localhost:3307
echo.
echo Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Clean build cache: docker builder prune -a
echo    Remove all unused: docker system prune -a --volumes
echo.
echo For more information, see DOCKER_README.md
echo.
pause
