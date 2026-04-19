# Brain Tumor Detection - Quick Start Script
# Usage: .\start.ps1
# Usage with options: .\start.ps1 -NoOpen

param(
    [switch]$NoOpen
)

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $ROOT "backend"
$frontendDir = Join-Path $ROOT "frontend"
$venvPython = Join-Path (Split-Path -Parent $ROOT) ".venv\Scripts\python.exe"
$mongoDataDir = Join-Path $backendDir "mongo-data"
$mongoLogPath = Join-Path $mongoDataDir "mongod.log"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Brain Tumor Detection - Startup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if port is in use
function Test-Port {
    param([int]$Port)
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

Write-Host "Checking services..." -ForegroundColor Yellow

# MongoDB
if (Test-Port 27017) {
    Write-Host "[OK] MongoDB running on :27017" -ForegroundColor Green
} else {
    Write-Host "[!] MongoDB not found - attempting to start..." -ForegroundColor Yellow

    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -ne "Running") {
        try {
            Start-Service -Name "MongoDB" -ErrorAction Stop
            Write-Host "[OK] MongoDB service started" -ForegroundColor Green
        } catch {
            Write-Host "[!] Could not start MongoDB service (may require Admin). Falling back to starting mongod.exe." -ForegroundColor Yellow
        }
    }

    if (-not (Test-Port 27017)) {
        $mongodPath = $null
        $mongodCmd = Get-Command mongod -ErrorAction SilentlyContinue
        if ($mongodCmd) {
            $mongodPath = $mongodCmd.Source
        } else {
            $mongodPath = Get-ChildItem "C:\Program Files\MongoDB\Server" -Recurse -Filter mongod.exe -ErrorAction SilentlyContinue |
                Sort-Object -Property FullName -Descending |
                Select-Object -First 1 -ExpandProperty FullName
        }

        if ($mongodPath) {
            if (-not (Test-Path $mongoDataDir)) {
                New-Item -ItemType Directory -Force -Path $mongoDataDir | Out-Null
            }
            Write-Host "[...] Starting MongoDB server (mongod.exe)..." -ForegroundColor Cyan
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$mongodPath' --dbpath '$mongoDataDir' --bind_ip 127.0.0.1 --port 27017 --logpath '$mongoLogPath' --logappend" -WindowStyle Minimized

            # Wait for MongoDB to accept connections (up to ~15s)
            for ($i = 0; $i -lt 15; $i++) {
                if (Test-Port 27017) { break }
                Start-Sleep -Seconds 1
            }
        }
    }

    if (Test-Port 27017) {
        Write-Host "[OK] MongoDB running on :27017" -ForegroundColor Green
    } else {
        Write-Host "[!] MongoDB still not reachable on :27017" -ForegroundColor Yellow
    }
}

# Backend
if (Test-Port 8000) {
    Write-Host "[OK] Backend running on :8000" -ForegroundColor Green
} else {
    Write-Host "[...] Starting backend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; & '$venvPython' -m uvicorn app.main:app --reload --port 8000" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# Frontend
if (Test-Port 5173) {
    Write-Host "[OK] Frontend running on :5173" -ForegroundColor Green
    $frontendUrl = "http://localhost:5173"
} elseif (Test-Port 5174) {
    Write-Host "[OK] Frontend running on :5174" -ForegroundColor Green
    $frontendUrl = "http://localhost:5174"
} else {
    Write-Host "[...] Starting frontend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 4
    
    if (Test-Port 5173) {
        $frontendUrl = "http://localhost:5173"
    } else {
        $frontendUrl = "http://localhost:5174"
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "        ALL SERVICES STARTED" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Frontend:   $frontendUrl" -ForegroundColor Green
Write-Host "Backend:    http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Database:   mongodb://localhost:27017" -ForegroundColor Green

Write-Host "`n[INFO] Close terminal windows to stop services`n" -ForegroundColor Yellow

if (-not $NoOpen) {
    Write-Host "Opening application in browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process $frontendUrl
}

Write-Host "[SUCCESS] All services running!`n" -ForegroundColor Green
