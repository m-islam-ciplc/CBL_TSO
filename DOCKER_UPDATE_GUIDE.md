# Docker Update & Rebuild Guide

Keep the database volume unless you want to lose MySQL data.

---

## 1. First-time setup
```powershell
# 1. build and start everything
docker-compose up -d --build
```
- Builds backend, frontend, and MySQL containers.
- MySQL volume starts empty, so `database.sql` runs automatically.

---

## 2. Full project reset (containers, images, volumes)
```powershell
# 1. remove project containers, images, volumes
docker-compose down --rmi all --volumes

# 2. rebuild from scratch
docker-compose up -d --build
```
- Removes every container, image, and named volume defined in this compose project only.
- Useful when you want to rebuild the stack exactly as shipped in the repo.
- Does **not** touch resources from other Docker projects.

---

## 3. Update code but keep MySQL data
```powershell
# 0. (optional) backup current database
docker exec -it cbl-so-mysql mysqldump -u root -pcbl_so_root_password cbl_so > backup.sql

# 1. stop app services only
docker-compose stop frontend backend

# 2. refresh images (choose one)
docker-compose pull
# or
docker-compose build

# 3. start updated services
docker-compose up -d frontend backend
```
- Leave the MySQL container/volume running so data persists.
- Use `pull` when images come from a registry; use `build` when building locally.

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
- Run manually with:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\cbl_so_mysql_daily_backup.ps1
  ```

### 4.2 Automate with Windows Task Scheduler
1. Open **Task Scheduler** → **Create Task…**
2. **General** tab
   - Name: `CBL SO MySQL Daily Backup`
   - Select **Run whether user is logged on or not**
   - Check **Run with highest privileges**
3. **Triggers** tab → **New…**
   - Begin the task: **On a schedule** → **Daily**
   - Set the start time to when Docker and MySQL are running (e.g., 02:00)
4. **Actions** tab → **New…**
   - Action: **Start a program**
   - Program/script: `powershell.exe`
   - Add arguments:
     ```
     -NoProfile -ExecutionPolicy Bypass -File "D:\GitHub_m-islam-ciplc\CBL_TSO\scripts\cbl_so_mysql_daily_backup.ps1"
     ```
5. **Conditions** tab (optional)
   - Uncheck **Start the task only if the computer is on AC power** if you want it on battery too.
6. **Settings** tab
   - Enable **Run task as soon as possible after a scheduled start is missed**
7. Click **OK**, then provide your Windows credentials so it can run unattended.
8. Test the task once via **Task Scheduler → Right-click → Run** to confirm it succeeds.

### 4.3 Restore a backup
```powershell
# 1. ensure mysql container is running
docker-compose up -d mysql

# 2. import the chosen dump file
docker exec -i cbl-so-mysql mysql -u root -pcbl_so_root_password cbl_so < "D:\Backups\cbl_so\cbl_so_YYYYMMDD-HHmmss.sql"
```
- Replace the timestamp with the filename you want to restore.
- Existing data in `cbl_so` will be overwritten by the dump content.
