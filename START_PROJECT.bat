@echo off
REM Brain Tumor Detection - Quick Start Batch File
REM This script launches the complete project with both backend and frontend

cls
color 0A
echo.
echo ================================================
echo   Brain Tumor Detection - Complete Project
echo ================================================
echo.
echo Starting servers...
echo.

REM Get current directory
setlocal enabledelayedexpansion
set "projectRoot=%~dp0"
set "venvPython=%projectRoot%web_app\backend\venv_clean\Scripts\python.exe"

REM Start Backend API Server
echo Starting Backend API Server...
echo Location: %projectRoot%web_app\backend
start "Brain Tumor Backend API" cmd /k "cd /d "%projectRoot%web_app\backend" && "%venvPython%" run_server.py"
echo [OK] Backend started on http://127.0.0.1:8000
timeout /t 3 /nobreak

REM Start Frontend Development Server
echo.
echo Starting Frontend Development Server...
echo Location: %projectRoot%web_app\frontend
start "Brain Tumor Frontend" cmd /k "cd /d "%projectRoot%web_app\frontend" && npm run dev"
echo [OK] Frontend started on http://localhost:5173

echo.
echo ================================================
echo   All Servers Running!
echo ================================================
echo.
echo Access the application:
echo   Frontend:  http://localhost:5173
echo   Backend:   http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo.
echo Features Available:
echo   * 3D Brain Visualization
echo   * Tumor Growth Prediction
echo   * Doctor Recommendation System
echo   * Model Performance Analytics
echo   * Voice Assistant
echo.
echo Press Ctrl+C in each window to stop servers
echo.
pause
