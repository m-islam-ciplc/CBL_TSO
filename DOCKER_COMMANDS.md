# Docker Commands Reference

Quick reference for managing the CBL TSO Docker application.

## 🚀 **Initial Setup (First Time)**

```bash
# Navigate to project folder
cd /path/to/CBL_TSO

# Ensure Docker Desktop is running
# Then build and start all containers
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

## 📊 **Status & Monitoring**

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

## 🔄 **Updates & Rebuilds**

```bash
# Pull latest code from Git
git pull origin main

# Rebuild and restart (after code changes)
docker-compose up -d --build

# Restart without rebuild (env changes only)
docker-compose up -d

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql
```

## 🛑 **Stop & Start**

```bash
# Stop all containers (keeps data)
docker-compose down

# Start stopped containers
docker-compose up -d

# Stop and remove everything (KEEPS DATA)
docker-compose down

# Stop and remove everything INCLUDING DATA
docker-compose down -v
```

## 🔧 **Troubleshooting**

```bash
# Check if ports are in use
netstat -tulpn | grep :80
netstat -tulpn | grep :3002
netstat -tulpn | grep :3307

# Test API endpoints
curl http://localhost:3002/health
curl http://localhost/api/dealers

# Access container shell
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p

# View container details
docker-compose config
```

## 🗄️ **Database Management**

```bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Create database backup
docker-compose exec mysql mysqldump -u root -p cbl_ordres > backup.sql

# Restore database
docker-compose exec -i mysql mysql -u root -p cbl_ordres < backup.sql

# Reset database (WARNING: Deletes all data)
docker-compose down
docker volume rm cbl_tso_mysql_data
docker-compose up -d --build
```

## 🧹 **Cleanup**

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

## 📋 **Quick Health Check**

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

## 🚨 **Emergency Commands**

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

## 📝 **Notes**

- **Data persists** between restarts (stored in Docker volumes)
- **Use `--build`** when code changes
- **Use without `--build`** for config changes only
- **Never use `-v`** unless you want to delete data
- **Access from tablets:** `http://SERVER_IP/`
- **Backend API:** `http://SERVER_IP:3002/`
- **MySQL:** `SERVER_IP:3307`

## 🔗 **Useful URLs**

- **Frontend:** http://localhost (or http://SERVER_IP)
- **Backend Health:** http://localhost:3002/health
- **Backend API:** http://localhost:3002/api/
- **MySQL:** localhost:3307 (or SERVER_IP:3307)
