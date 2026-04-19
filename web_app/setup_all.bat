@echo off
REM Brain Tumor Detection Web App - Complete Setup Script

setlocal enabledelayedexpansion

cd /d "C:\Users\kommi\Desktop\BrainTumor[2]\web_app"

REM Clear screen
cls

echo.
echo =====================================================
echo Brain Tumor Detection - Web App Complete Setup
echo =====================================================
echo.

echo This script will:
echo 1. Setup Backend (FastAPI)
echo 2. Setup Frontend (React)
echo 3. Copy model files
echo 4. Show how to run everything
echo.
pause

REM Setup Backend
echo.
echo [STEP 1] Setting up Backend...
echo ======================================
cd "%CD%\backend"
call setup.bat
if %errorlevel% neq 0 (
    echo ERROR during backend setup
    pause
    exit /b 1
)

REM Setup Frontend
echo.
echo [STEP 2] Setting up Frontend...
echo ======================================
cd "%CD%\..\frontend"
call setup.bat
if %errorlevel% neq 0 (
    echo ERROR during frontend setup
    pause
    exit /b 1
)

REM Final instructions
cls
echo.
echo =====================================================
echo ✓ Setup Complete!
echo =====================================================
echo.
echo You now have 3 things to start:
echo.
echo [Terminal 1] Backend (Port 8000):
echo   cd "C:\Users\kommi\Desktop\BrainTumor[2]\web_app\backend"
echo   .\venv\Scripts\activate.bat
echo   python -m uvicorn app.main:app --reload --port 8000
echo.
echo [Terminal 2] Frontend (Port 5173):
echo   cd "C:\Users\kommi\Desktop\BrainTumor[2]\web_app\frontend"
echo   npm run dev
echo.
echo [Terminal 3] MongoDB (Port 27017):
echo   mongod
echo.
echo Then visit: http://localhost:5173
echo.
echo =====================================================
echo.
pause
