#!/bin/bash

# =====================================
# YWC API Quick Start Script
# =====================================

set -e

echo "🚀 YWC API Quick Start"
echo "======================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check if running from correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start services
echo "🚀 Starting YWC API services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."

if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

# Health check
echo "🏥 Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "❌ Health check failed. Application may not be ready."
        echo "Check logs: docker-compose logs ywc-api"
        exit 1
    fi
    
    echo "⏳ Waiting for application... ($i/30)"
    sleep 2
done

# Display information
echo ""
echo "🎉 YWC API is now running!"
echo "=========================="
echo ""
echo "📊 Services:"
echo "  • API: http://localhost:3000"
echo "  • Database: localhost:5432"
echo "  • pgAdmin: http://localhost:5050 (admin@ywc.com / admin123)"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose restart"
echo ""
echo "📖 API Documentation:"
echo "  • Health: http://localhost:3000/health"
echo "  • Auth: http://localhost:3000/api/auth/*"
echo "  • Forms: http://localhost:3000/api/form-configurations/*"
echo ""
echo "Happy coding! 🚀" 