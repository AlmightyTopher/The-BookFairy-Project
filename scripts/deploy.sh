#!/bin/bash
# Book Fairy Deployment Script

set -e

echo "🧚‍♀️ Book Fairy Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "🐳 Please start Docker and try again"
    exit 1
fi

echo "✅ Docker is running"

# Build the application
echo "🔨 Building Book Fairy Docker image..."
docker-compose build

# Start the services
echo "🚀 Starting Book Fairy services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if docker-compose ps | grep -q "Up (healthy)"; then
    echo "✅ Book Fairy is running successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  - Health Check: http://localhost:3000/healthz"
    echo "  - qBittorrent: http://localhost:8080"
    echo "  - Prowlarr: http://localhost:9696"
    echo "  - Readarr: http://localhost:8787"
    echo ""
    echo "📝 Check logs with: docker-compose logs -f"
else
    echo "⚠️ Some services may not be healthy yet"
    echo "📋 Check status with: docker-compose ps"
    echo "📝 Check logs with: docker-compose logs"
fi

echo ""
echo "🎉 Deployment complete!"
