# Book Fairy Deployment Scripts

This directory contains deployment scripts for the Book Fairy bot.

## Scripts

### `deploy.sh` (Linux/macOS/WSL)

Bash script for deploying the Book Fairy application using Docker Compose.

```bash
./scripts/deploy.sh
```

### `deploy.bat` (Windows)

Windows batch script for deploying the Book Fairy application using Docker Compose.

```cmd
scripts\deploy.bat
```

## What These Scripts Do

1. **Environment Check**: Verify that `.env` file exists and Docker is running
2. **Build**: Build the Book Fairy Docker image
3. **Deploy**: Start all services using Docker Compose
4. **Health Check**: Verify services are running and display access URLs

## Prerequisites

1. Docker Desktop installed and running
2. `.env` file configured (copy from `.env.example`)
3. All required environment variables set in `.env`

## Service URLs (Default Ports)

- **Book Fairy Health**: <http://localhost:3000/healthz>
- **qBittorrent**: <http://localhost:8080>
- **Prowlarr**: <http://localhost:9696>
- **Readarr**: <http://localhost:8787>

## Troubleshooting

- Check logs: `docker-compose logs -f`
- Stop services: `docker-compose down`
- Rebuild: `docker-compose build --no-cache`
- View running containers: `docker-compose ps`
