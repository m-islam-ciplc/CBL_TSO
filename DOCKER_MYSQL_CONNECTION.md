# How to Connect to Docker MySQL Database

This guide explains how to connect to the MySQL database running in Docker containers.

## 🔗 **Connection Methods**

### **1. MySQL Workbench (Recommended)**

#### **Step 1: Open MySQL Workbench**
- Launch MySQL Workbench on your local machine

#### **Step 2: Create New Connection**
- Click the "+" button next to "MySQL Connections"
- Or go to **Database** → **Manage Connections** → **New**

#### **Step 3: Configure Connection**
```
Connection Name: CBL Docker MySQL
Hostname: localhost (or SERVER_IP if remote)
Port: 3307
Username: root
Password: cbl_so_root_password
```

#### **Step 4: Test Connection**
- Click **Test Connection** to verify
- Click **OK** to save

#### **Step 5: Connect**
- Double-click the connection to connect
- You should see the `cbl_so` database

---

### **2. Command Line (Terminal)**

#### **From Host Machine:**
```bash
# Connect to MySQL container
mysql -h localhost -P 3307 -u root -p

# Enter password: cbl_so_root_password
```

#### **From Inside Docker Container:**
```bash
# Access the MySQL container
docker-compose exec mysql mysql -u root -p

# Enter password: cbl_so_root_password
```

---

### **3. Other Database Tools**

#### **DBeaver, phpMyAdmin, etc.**
Use the same connection details:
- **Host:** localhost (or SERVER_IP)
- **Port:** 3307
- **Username:** root
- **Password:** cbl_so_root_password
- **Database:** cbl_so

---

## 📊 **Database Information**

### **Connection Details:**
- **Host:** localhost (or SERVER_IP if remote)
- **Port:** 3307 (external), 3306 (internal)
- **Database:** cbl_so
- **Root User:** root
- **Root Password:** cbl_so_root_password
- **App User:** cbl_so_user
- **App Password:** cbl_so_password

### **Available Databases:**
- `cbl_so` - Main application database
- `information_schema` - MySQL system database
- `mysql` - MySQL system database
- `performance_schema` - MySQL system database

---

## 🔧 **Common Operations**

### **View All Tables:**
```sql
USE cbl_so;
SHOW TABLES;
```

### **View Table Structure:**
```sql
DESCRIBE table_name;
```

### **View All Data:**
```sql
SELECT * FROM table_name;
```

### **Create Backup:**
```bash
# From host machine
docker-compose exec mysql mysqldump -u root -p cbl_so > backup.sql
```

### **Restore Backup:**
```bash
# From host machine
docker-compose exec -i mysql mysql -u root -p cbl_so < backup.sql
```

---

## 🚨 **Troubleshooting**

### **Connection Refused:**
```bash
# Check if MySQL container is running
docker-compose ps

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL if needed
docker-compose restart mysql
```

### **Wrong Password:**
```bash
# Reset root password
docker-compose exec mysql mysql -u root -p
# Enter current password, then:
ALTER USER 'root'@'%' IDENTIFIED BY 'cbl_so_root_password';
FLUSH PRIVILEGES;
```

### **Port Already in Use:**
```bash
# Check what's using port 3307
netstat -tulpn | grep :3307

# Change port in docker-compose.yml if needed
```

### **Can't Find Database:**
```bash
# Check if database exists
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Create database if missing
docker-compose exec mysql mysql -u root -p -e "CREATE DATABASE cbl_so;"
```

---

## 📝 **Important Notes**

### **Security:**
- **Root password** is set in `docker-compose.yml`
- **Change passwords** for production use
- **Use app user** (`cbl_so_user`) for application connections
- **Don't expose** MySQL port externally in production

### **Data Persistence:**
- **Data is stored** in Docker volumes
- **Data persists** between container restarts
- **Data is lost** only if you remove volumes with `-v` flag

### **Network Access:**
- **From host:** Use `localhost:3307`
- **From other containers:** Use `mysql:3306`
- **From remote machines:** Use `SERVER_IP:3307`

---

## 🎯 **Quick Reference**

| Method | Host | Port | Username | Password |
|--------|------|------|----------|----------|
| MySQL Workbench | localhost | 3307 | root | cbl_so_root_password |
| Command Line | localhost | 3307 | root | cbl_so_root_password |
| Application | mysql | 3306 | cbl_so_user | cbl_so_password |

---

## 🔗 **Useful Commands**

```bash
# Check container status
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Create database backup
docker-compose exec mysql mysqldump -u root -p cbl_so > backup.sql

# Restore database
docker-compose exec -i mysql mysql -u root -p cbl_so < backup.sql

# Check database size
docker-compose exec mysql mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'cbl_so';"
```
