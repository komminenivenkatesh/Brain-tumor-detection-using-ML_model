# Start the backend server using the clean virtual environment
# This script fixes the DLL loading error by using the isolated venv_clean

param(
    [switch]$NoReload
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Brain Tumor Detection API - Clean Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommandPath
Set-Location $scriptDir

Write-Host "Activating clean virtual environment..." -ForegroundColor Yellow
& ".\venv_clean\Scripts\Activate.ps1"

Write-Host ""
Write-Host "Starting server with venv_clean Python..." -ForegroundColor Green
Write-Host "Server will run on: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""

if ($NoReload) {
    & "venv_clean\Scripts\python.exe" -c "
import uvicorn
import os
os.chdir('.')
uvicorn.run(
    'app.main:app',
    host='127.0.0.1',
    port=8000,
    reload=False
)
"
} else {
    & "venv_clean\Scripts\python.exe" run_server.py
}
