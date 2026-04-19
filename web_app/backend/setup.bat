@echo off
REM Brain Tumor Detection Web App - Setup Script
REM Change to the backend directory using LiteralPath to handle brackets

cd /d "C:\Users\kommi\Desktop\BrainTumor[2]\web_app\backend"

echo.
echo ========================================
echo Setting up Brain Tumor Web App - Backend
echo ========================================
echo.

REM Create virtual environment
echo [1/5] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install requirements
echo [3/5] Installing dependencies (this may take 5-10 minutes)...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Copy model files
echo [4/5] Copying model files...
if not exist models mkdir models
copy "..\BrainTumor\Model\*" "models\" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy model files
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
echo [5/5] Setting up configuration...
if not exist .env (
    copy .env.example .env
    echo .env file created from .env.example
    echo Please edit .env with your settings if needed
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open this folder in VS Code
echo 2. Open Terminal and run:
echo    python -m uvicorn app.main:app --reload --port 8000
echo.
echo Then open 2 more terminals in the project root for:
echo - Frontend: cd web_app\frontend && npm install && npm run dev
echo - MongoDB: mongod
echo.
pause
