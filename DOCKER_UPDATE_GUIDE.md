# Docker Update & Rebuild Guide

Keep the database volume unless you want to lose MySQL data.

---

## 1. First-time setup
```powershell
# build and start everything; MySQL schema loads automatically on a fresh volume
docker-compose up -d --build
```

---

## 2. Full project reset (containers, images, volumes)
```powershell
# remove project containers, images, and named volumes
docker-compose down --rmi all --volumes

# rebuild the full stack from local Dockerfiles
docker-compose up -d --build
```

---

## 3. Update code but keep MySQL data
```powershell
# optional: write backup to current directory as cbl_so_db_backup.sql
docker exec -it cbl-so-mysql mysqldump -u root -pcbl_so_root_password cbl_so > cbl_so_db_backup.sql

# stop the app services; MySQL keeps running on the existing volume
docker-compose stop frontend backend

# rebuild images locally with updated code
docker-compose build frontend backend

# bring updated services back online
docker-compose up -d frontend backend
```

---

## 4. Scheduled MySQL backups and restore

### 4.1 Create the backup script
`./scripts/cbl_so_mysql_daily_backup.ps1`:
```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "D:\Backups\cbl_so"
$backupFile = Join-Path $backupDir "cbl_so_$timestamp.sql"

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$dumpCommand = "mysqldump -u root -pcbl_so_root_password cbl_so"
docker exec cbl-so-mysql powershell -Command "& { $dumpCommand }" > $backupFile

Get-ChildItem $backupDir -Filter "cbl_so_*.sql" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip 7 |
  Remove-Item -Force
```
```powershell
# run manually when needed
powershell -ExecutionPolicy Bypass -File .\scripts\cbl_so_mysql_daily_backup.ps1
```

### 4.2 Automate with Windows Task Scheduler
1. Open **Task Scheduler** → **Create Task…**
2. **General** tab → set name, run whether logged on, highest privileges
3. **Triggers** → **New…** → daily schedule (pick a time when Docker is running)
4. **Actions** → **New…** → program `powershell.exe`
   - Arguments: `-NoProfile -ExecutionPolicy Bypass -File "D:\GitHub_m-islam-ciplc\CBL_TSO\scripts\cbl_so_mysql_daily_backup.ps1"`
5. **Conditions** → adjust power settings if required
6. **Settings** → enable “Run task as soon as possible after a missed start”
7. Save and provide Windows credentials
8. Right-click → **Run** once to verify it succeeds

### 4.3 Restore a backup
```powershell
# make sure the MySQL container is running
docker-compose up -d mysql

# import the desired dump file (update the timestamp to the file you want)
docker exec -i cbl-so-mysql mysql -u root -pcbl_so_root_password cbl_so < "D:\Backups\cbl_so\cbl_so_YYYYMMDD-HHmmss.sql"
```
