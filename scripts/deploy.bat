@echo off
REM Book Fairy Deployment Script for Windows

echo 🧚‍♀️ Book Fairy Deployment Script
echo ==================================

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo 📝 Please copy .env.example to .env and configure your settings
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Docker is not running!
    echo 🐳 Please start Docker Desktop and try again
    exit /b 1
)

echo ✅ Docker is running

REM Build the application
echo 🔨 Building Book Fairy Docker image...
docker-compose build

REM Start the services
echo 🚀 Starting Book Fairy services...
docker-compose up -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak

REM Check status
echo 🏥 Checking service health...
docker-compose ps

echo.
echo 📊 Service URLs:
echo   - Health Check: http://localhost:3000/healthz
echo   - qBittorrent: http://localhost:8080
echo   - Prowlarr: http://localhost:9696
echo   - Readarr: http://localhost:8787
echo.
echo 📝 Check logs with: docker-compose logs -f
echo.
echo 🎉 Deployment complete!
