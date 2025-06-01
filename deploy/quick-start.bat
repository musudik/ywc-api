@echo off
REM =====================================
REM YWC API Quick Start Script (Windows)
REM =====================================

echo 🚀 YWC API Quick Start
echo ======================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose not found. Please install Docker Desktop with Compose.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose found

REM Check if running from correct directory
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down >nul 2>&1

REM Start services
echo 🚀 Starting YWC API services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

echo 🔍 Checking service status...

REM Simple health check
echo 🏥 Performing health check...
set /a counter=0
:healthcheck
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is healthy!
    goto :success
)

set /a counter+=1
if %counter% lss 30 (
    echo ⏳ Waiting for application... (%counter%/30)
    timeout /t 2 /nobreak >nul
    goto :healthcheck
) else (
    echo ❌ Health check failed. Application may not be ready.
    echo Check logs: docker-compose logs ywc-api
    pause
    exit /b 1
)

:success
echo.
echo 🎉 YWC API is now running!
echo ==========================
echo.
echo 📊 Services:
echo   • API: http://localhost:3000
echo   • Database: localhost:5432
echo   • pgAdmin: http://localhost:5050 (admin@ywc.com / admin123)
echo.
echo 🔧 Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop services: docker-compose down
echo   • Restart: docker-compose restart
echo.
echo 📖 API Documentation:
echo   • Health: http://localhost:3000/health
echo   • Auth: http://localhost:3000/api/auth/*
echo   • Forms: http://localhost:3000/api/form-configurations/*
echo.
echo Happy coding! 🚀
pause 