@echo off
setlocal enabledelayedexpansion

echo 🚀 CBL Sales Order Docker Deployment Script
echo ==========================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are available

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env >nul
    echo ⚠️  Please review and update the .env file with your configuration
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up -d --build

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose ps

REM Check health endpoints
echo 🔍 Checking health endpoints...

REM Check backend health
curl -f http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
) else (
    echo ✅ Backend is healthy
)

REM Check frontend
curl -f http://localhost >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend is not accessible
) else (
    echo ✅ Frontend is accessible
)

REM Check database
docker-compose exec mysql mysqladmin ping -h localhost >nul 2>&1
if errorlevel 1 (
    echo ❌ Database health check failed
) else (
    echo ✅ Database is healthy
)

echo.
echo 🎉 Deployment completed!
echo.
echo 📋 Service URLs:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:3001
echo    Database: localhost:3306
echo.
echo 📚 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
echo 📖 For more information, see DOCKER_README.md
echo.
pause
