# CBL Sales Orders - Docker Deployment Guide

This comprehensive guide explains how to deploy and manage the CBL Sales Orders system using Docker containers.

## 📋 **Table of Contents**

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services Overview](#services)
- [Configuration](#configuration)
- [🚀 Quick Commands Reference](#-quick-commands-reference)
- [Health Checks](#health-checks)
- [File Uploads](#file-uploads)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Monitoring](#monitoring)
- [Updates and Maintenance](#updates-and-maintenance)
- [Support](#support)

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- At least 2GB RAM available for containers
- Ports 5001 (backend, or custom BACKEND_PORT), 5002 (frontend, or custom FRONTEND_PORT), and 3307 available on your system

## Quick Start

1. **Clone and navigate to the project directory:**
   ```bash
   cd CBL_TSO
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Services

The application consists of three services:

> **Note:** Ports have been configured to use non-default ports to avoid conflicts:
> - MySQL: 3307 (external) to avoid conflict with system MySQL on 3306
> - Backend: 5001 (external and internal) - non-default port
> - Frontend: 5002 (external) - non-default port

### 1. MySQL Database (`mysql`)
- **Port:** 3307 (external), 3306 (internal)
- **Database:** cbl_so
- **User:** cbl_so_user
- **Password:** cbl_so_password
- **Root Password:** cbl_so_root_password

### 2. Backend API (`backend`)
- **Port:** 5001 (external and internal - non-default port)
- **Health Check:** http://localhost:5001/health
- **Environment:** Production Node.js

### 3. Frontend Web App (`frontend`)
- **Port:** 5002 (default, non-default port, configurable via FRONTEND_PORT environment variable)
- **URL:** http://localhost:5002 (or http://localhost:${FRONTEND_PORT} if custom)
- **Serves:** React build with Nginx
- **Note:** Uses non-default port (5002) to avoid conflicts. Can be customized via FRONTEND_PORT env var if needed.

## Configuration

### Database Initialization

The database is automatically initialized with the schema from `database.sql` when the MySQL container starts for the first time.

## 🚀 **Quick Commands Reference**

### **Initial Setup (First Time)**
```bash
# Navigate to project folder
cd /path/to/CBL_TSO

# Ensure Docker Desktop is running
# Then build and start all containers
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

### **Start Services**
```bash
# Start all services in background
docker-compose up -d

# ⚠️ IMPORTANT: Stop running containers first before rebuilding
docker-compose down
docker-compose up -d --build
```

### **Stop Services**
```bash
# Stop all services (keeps data, networks, and images)
docker-compose down

# Stop and remove everything INCLUDING DATA (WARNING: Deletes database)
docker-compose down -v
# or
docker-compose down --volumes

# Stop, remove images, and volumes (COMPLETE CLEANUP)
docker-compose down --rmi all --volumes
# This removes:
#   ✅ Containers
#   ✅ Networks  
#   ✅ All images used by services (--rmi all)
#   ✅ All volumes including database data (--volumes)
#   ⚠️  WARNING: This deletes ALL data permanently!
```

**What Each Command Does:**

| Command | Containers | Networks | Images | Volumes | Use Case |
|---------|-----------|----------|--------|---------|----------|
| `docker-compose down` | ✅ Removed | ✅ Removed | ❌ Kept | ❌ Kept | Normal shutdown, keep data |
| `docker-compose down -v` | ✅ Removed | ✅ Removed | ❌ Kept | ✅ Removed | Fresh database, keep images |
| `docker-compose down --rmi all` | ✅ Removed | ✅ Removed | ✅ Removed | ❌ Kept | Remove images, keep data |
| `docker-compose down --rmi all --volumes` | ✅ Removed | ✅ Removed | ✅ Removed | ✅ Removed | **Complete cleanup** |

> **⚠️ Important:** `--volumes` flag deletes database data, uploaded files, and all persisted data. Always backup before using `--volumes` in production!

### **Status & Monitoring**
```bash
# Check container status
docker-compose ps

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Check resource usage
docker stats
```

### **Updates & Rebuilds**
```bash
# Pull latest code from Git (if using Git)
git pull

# ⚠️ IMPORTANT: Always stop running containers first!
docker-compose down

# Rebuild and restart (after code changes)
docker-compose up -d --build

# Restart without rebuild (env changes only)
docker-compose up -d

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
```

### **Database Management**
```bash
# Connect to MySQL container
docker-compose exec mysql mysql -u cbl_so_user -p cbl_so

# Access MySQL shell as root
docker-compose exec mysql mysql -u root -p

# Create database backup
docker-compose exec mysql mysqldump -u cbl_so_user -p cbl_so > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u cbl_so_user -p cbl_so < backup.sql

# Reset database (WARNING: Deletes all data)
docker-compose down
docker volume rm cbl-so-mysql-data
docker-compose up -d --build

# Note: Check actual volume name with: docker volume ls
```

### **Cleanup Commands**
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (CAREFUL: May delete data)
docker volume prune

# Full cleanup (CAREFUL: Removes everything)
docker system prune -a

# Clean Docker build cache (frees up disk space)
docker builder prune -a

# Remove all unused data, images, containers, and volumes (nuclear option)
docker system prune -a --volumes
```

### **Quick Health Check**
```bash
# 1. Check containers are running
docker-compose ps

# 2. Test backend health
curl http://localhost:5001/health

# 3. Test frontend
curl http://localhost

# 4. Test API through proxy
curl http://localhost/api/dealers

# 5. Check logs for errors
docker-compose logs --tail=50
```

### **Emergency Commands**
```bash
# Force restart everything (keeps data)
docker-compose down
docker-compose up -d --build

# Reset everything - fresh database (WARNING: Deletes data)
docker-compose down -v
docker-compose up -d --build

# Complete cleanup - remove everything including images (WARNING: Deletes ALL data)
docker-compose down --rmi all --volumes
docker-compose up -d --build

# View detailed container info
docker inspect cbl-so-backend
docker inspect cbl-so-frontend
docker inspect cbl-so-mysql
```

**Complete Cleanup Explained:**
```bash
docker-compose down --rmi all --volumes
```
This command removes:
- ✅ All containers
- ✅ All networks
- ✅ All images built by this project (`--rmi all`)
- ✅ All volumes including database data (`--volumes`)

**Result:** Complete fresh start. Database will be recreated from `database.sql` on next `docker-compose up`.

> **💡 Use Case:** When you need to:
> - Fix schema issues (reapply `database.sql`)
> - Start completely fresh
> - Free up disk space
> - Resolve persistent Docker issues

## Health Checks

Each service includes health checks:

- **MySQL:** `mysqladmin ping`
- **Backend:** `GET /health` endpoint
- **Frontend:** Nginx default health check

Check health status:
```bash
docker-compose ps
```

## File Uploads

Uploaded files are stored in the `uploads/` directory and are persisted across container restarts.

## Production Deployment

### 1. Security Considerations

- Change default passwords in `docker-compose.yml` (line 8-11)
- Configure proper firewall rules
- Use HTTPS in production (configure reverse proxy)

### 2. Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
  
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'
  
  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.1'
```

### 3. Backup Strategy

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mysql mysqldump -u cbl_so_user -p cbl_so > backup_${DATE}.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using ports (Windows)
   netstat -ano | findstr :80
   netstat -ano | findstr :5002
   netstat -ano | findstr :3307
   
   # Check what's using ports (Linux/Mac)
   netstat -tulpn | grep :80
   netstat -tulpn | grep :5002
   netstat -tulpn | grep :3307
   ```

2. **Database connection issues:**
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   
   # Test database connection
   docker-compose exec backend node -e "console.log('Testing DB connection...')"
   ```

3. **Frontend not loading:**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose up -d --build frontend
   ```

4. **Backend health check failing:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Restart backend
   docker-compose restart backend
   
   # Test health endpoint directly
   curl http://localhost:5001/health
   ```

5. **API proxy not working (404 errors):**
   ```bash
   # Test API through proxy
   curl http://localhost/api/dealers
   
   # Test API directly
   curl http://localhost:5001/api/dealers
   
   # Rebuild frontend if nginx config changed
   docker-compose up -d --build frontend
   ```

### Reset Everything

```bash
# Option 1: Reset database but keep images
docker-compose down -v
docker-compose up -d --build

# Option 2: Complete cleanup (removes images and volumes)
docker-compose down --rmi all --volumes
docker-compose up -d --build

# Option 3: Step-by-step (if you need more control)
docker-compose down          # Stop containers
docker-compose down --rmi all --volumes  # Remove images and volumes
docker-compose up -d --build  # Rebuild and start fresh
```

**What Happens:**
- All containers, networks, images, and volumes are removed
- On next `docker-compose up`, everything is rebuilt from scratch
- Database is recreated from `database.sql` (fresh schema)
- All data is permanently deleted

> **⚠️ WARNING:** Always backup your database before using `--volumes` flag!

## Monitoring

### Resource Usage
```bash
# View resource usage
docker stats

# View specific service stats
docker stats cbl-so-mysql cbl-so-backend cbl-so-frontend
```

### Application Logs
```bash
# Real-time logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > application.log
```

## Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Update Dependencies
```bash
# Rebuild with no cache
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review this documentation

---

**Note:** This Docker setup is configured for development and testing. For production deployment, consider additional security measures, monitoring, and backup strategies.
