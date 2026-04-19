@echo off
REM Brain Tumor Detection Web App - Frontend Setup Script

cd /d "C:\Users\kommi\Desktop\BrainTumor[2]\web_app\frontend"

echo.
echo ========================================
echo Setting up Brain Tumor Web App - Frontend
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/2] Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install npm dependencies
echo [2/2] Installing npm dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Frontend Setup Complete!
echo ========================================
echo.
echo To start the frontend development server, run:
echo npm run dev
echo.
pause
