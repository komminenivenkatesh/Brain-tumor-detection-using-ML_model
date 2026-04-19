# Brain Tumor Detection - Complete Project Startup Script
# This script launches both backend and frontend servers

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Brain Tumor Detection - Complete Project" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$backendPath = Join-Path $projectRoot "web_app\backend"
$frontendPath = Join-Path $projectRoot "web_app\frontend"
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"

# Color outputs
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

# Function to check if port is in use
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

# Check required ports
Write-Host "Checking required ports..." -ForegroundColor $InfoColor
$backendPortInUse = Test-Port -Port 8000
$frontendPortInUse = Test-Port -Port 5173

if ($backendPortInUse) {
    Write-Host "[WARN] Port 8000 is already in use (Backend)" -ForegroundColor $WarningColor
}
if ($frontendPortInUse) {
    Write-Host "[WARN] Port 5173 is already in use (Frontend)" -ForegroundColor $WarningColor
}
Write-Host ""

# Start Backend
Write-Host "Starting Backend API Server..." -ForegroundColor $InfoColor
Write-Host "Location: $backendPath" -ForegroundColor $InfoColor
Push-Location $backendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$venvPython' run_server.py"
Write-Host "[OK] Backend started (http://127.0.0.1:8000)" -ForegroundColor $SuccessColor
Pop-Location
Start-Sleep -Seconds 5

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend Development Server..." -ForegroundColor $InfoColor
Write-Host "Location: $frontendPath" -ForegroundColor $InfoColor
Push-Location $frontendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "[OK] Frontend started (http://localhost:5173)" -ForegroundColor $SuccessColor
Pop-Location

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  All Servers Running!" -ForegroundColor $SuccessColor
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application:" -ForegroundColor $InfoColor
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor $SuccessColor
Write-Host "  Backend:   http://127.0.0.1:8000" -ForegroundColor $SuccessColor
Write-Host "  API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "Features Available:" -ForegroundColor $InfoColor
Write-Host "  - 3D Brain Visualization" -ForegroundColor $SuccessColor
Write-Host "  - Tumor Growth Prediction" -ForegroundColor $SuccessColor
Write-Host "  - Doctor Recommendation System" -ForegroundColor $SuccessColor
Write-Host "  - Model Performance Analytics" -ForegroundColor $SuccessColor
Write-Host "  - Voice Assistant" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "Press Ctrl+C to stop any server" -ForegroundColor $WarningColor
Write-Host ""
