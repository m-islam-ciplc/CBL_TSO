# CBL Sales Order - Docker Deployment Guide

This comprehensive guide explains how to deploy and manage the CBL Sales Order system using Docker containers.

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
- Ports 80, 3002, and 3307 available on your system

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

> **Note:** Ports have been configured to avoid conflicts with existing services:
> - MySQL: 3307 (external) to avoid conflict with system MySQL on 3306
> - Backend: 3002 (external) to avoid conflict with existing backend on 3001

### 1. MySQL Database (`mysql`)
- **Port:** 3307 (external), 3306 (internal)
- **Database:** cbl_ordres
- **User:** cbl_user
- **Password:** cbl_password
- **Root Password:** cbl_root_password

### 2. Backend API (`backend`)
- **Port:** 3002 (external), 3001 (internal)
- **Health Check:** http://localhost:3002/health
- **Environment:** Production Node.js

### 3. Frontend Web App (`frontend`)
- **Port:** 80
- **URL:** http://localhost
- **Serves:** React build with Nginx

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `env.example`):

```bash
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=cbl_user
DB_PASSWORD=cbl_password
DB_NAME=cbl_ordres

# Application Configuration
NODE_ENV=production
PORT=3001

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3002
```

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
# Stop all services (keeps data)
docker-compose down

# Stop and remove everything (KEEPS DATA)
docker-compose down

# Stop and remove everything INCLUDING DATA
docker-compose down -v
```

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
# Pull latest code from Git
git pull origin main

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
docker-compose exec mysql mysql -u cbl_user -p cbl_ordres

# Access MySQL shell as root
docker-compose exec mysql mysql -u root -p

# Create database backup
docker-compose exec mysql mysqldump -u cbl_user -p cbl_ordres > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u cbl_user -p cbl_ordres < backup.sql

# Reset database (WARNING: Deletes all data)
docker-compose down
docker volume rm cbl_tso_mysql_data
docker-compose up -d --build
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
```

### **Quick Health Check**
```bash
# 1. Check containers are running
docker-compose ps

# 2. Test backend health
curl http://localhost:3002/health

# 3. Test frontend
curl http://localhost

# 4. Test API through proxy
curl http://localhost/api/dealers

# 5. Check logs for errors
docker-compose logs --tail=50
```

### **Emergency Commands**
```bash
# Force restart everything
docker-compose down
docker-compose up -d --build

# Reset everything (WARNING: Deletes data)
docker-compose down -v
docker-compose up -d --build

# View detailed container info
docker inspect cbl_tso_backend_1
docker inspect cbl_tso_frontend_1
docker inspect cbl_tso_mysql_1
```

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

- Change default passwords in `docker-compose.yml`
- Use environment variables for sensitive data
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
docker-compose exec mysql mysqldump -u cbl_user -p cbl_ordres > backup_${DATE}.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3002
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
   curl http://localhost:3002/health
   ```

5. **API proxy not working (404 errors):**
   ```bash
   # Test API through proxy
   curl http://localhost/api/dealers
   
   # Test API directly
   curl http://localhost:3002/api/dealers
   
   # Rebuild frontend if nginx config changed
   docker-compose up -d --build frontend
   ```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Monitoring

### Resource Usage
```bash
# View resource usage
docker stats

# View specific service stats
docker stats cbl-mysql cbl-backend cbl-frontend
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
