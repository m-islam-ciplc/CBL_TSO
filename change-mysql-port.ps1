# Script to change MySQL port from 3306 to 3307
# Run this script as Administrator

$mysqlConfigPath = "C:\ProgramData\MySQL\MySQL Server 9.5\my.ini"
$serviceName = "MYSQL95"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MySQL Port Change Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if config file exists
if (-not (Test-Path $mysqlConfigPath)) {
    Write-Host "ERROR: MySQL config file not found at: $mysqlConfigPath" -ForegroundColor Red
    exit 1
}

# Backup the original file
$backupPath = "$mysqlConfigPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup: $backupPath" -ForegroundColor Yellow
Copy-Item $mysqlConfigPath $backupPath

# Read the file
Write-Host "Reading MySQL configuration..." -ForegroundColor Yellow
$content = Get-Content $mysqlConfigPath

# Replace port=3306 with port=3307
$originalContent = $content -join "`n"
$newContent = $originalContent -replace 'port=3306', 'port=3307'

# Count replacements
$replacements = ([regex]::Matches($originalContent, 'port=3306')).Count
Write-Host "Found $replacements occurrence(s) of port=3306" -ForegroundColor Yellow

if ($replacements -eq 0) {
    Write-Host "WARNING: No port=3306 found. Port may already be changed or configured differently." -ForegroundColor Yellow
}

# Write the new content
Write-Host "Writing updated configuration..." -ForegroundColor Yellow
$newContent | Set-Content $mysqlConfigPath -NoNewline

Write-Host ""
Write-Host "Configuration updated successfully!" -ForegroundColor Green
Write-Host ""

# Stop MySQL service
Write-Host "Stopping MySQL service ($serviceName)..." -ForegroundColor Yellow
Stop-Service -Name $serviceName -Force
Start-Sleep -Seconds 3

# Start MySQL service
Write-Host "Starting MySQL service ($serviceName)..." -ForegroundColor Yellow
Start-Service -Name $serviceName
Start-Sleep -Seconds 5

# Verify service is running
$service = Get-Service -Name $serviceName
if ($service.Status -eq 'Running') {
    Write-Host "MySQL service is running!" -ForegroundColor Green
} else {
    Write-Host "WARNING: MySQL service status is: $($service.Status)" -ForegroundColor Yellow
}

# Test connection on new port
Write-Host ""
Write-Host "Testing connection on port 3307..." -ForegroundColor Yellow
try {
    $testConnection = Test-NetConnection -ComputerName localhost -Port 3307 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "SUCCESS: MySQL is now listening on port 3307!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Could not connect to port 3307. Please check MySQL logs." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not test connection: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Port change complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update MySQL Workbench connection to use port 3307" -ForegroundColor White
Write-Host "2. Your backend application is already configured to use port 3307" -ForegroundColor White
Write-Host "3. Backup saved at: $backupPath" -ForegroundColor White
Write-Host ""

