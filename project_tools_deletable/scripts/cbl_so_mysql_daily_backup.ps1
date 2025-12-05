$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "D:\Backups\cbl_so"
$backupFile = Join-Path $backupDir "cbl_so_$timestamp.sql"

# Ensure backup directory exists
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Run mysqldump inside the MySQL container
$dumpCommand = "mysqldump -u root -pcbl_so_root_password cbl_so"
docker exec cbl-so-mysql powershell -Command "& { $dumpCommand }" > $backupFile

# Optional: keep only the latest 7 backups
Get-ChildItem $backupDir -Filter "cbl_so_*.sql" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -Skip 7 |
  Remove-Item -Force
