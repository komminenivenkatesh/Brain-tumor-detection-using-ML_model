@echo off
REM Brain Tumor Detection - Quick Start for Command Prompt
REM Double-click this file to start all services

setlocal enabledelayedexpansion

cls
echo ======================================================
echo  Brain Tumor Detection - Web Application Startup
echo ======================================================
echo.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

REM Check and start services
echo Checking services...

REM MongoDB check
netstat -ano 2>nul | findstr ":27017" >nul
if %errorlevel%==0 (
    echo [OK] MongoDB is running on port 27017
) else (
    echo [WAIT] MongoDB not running - make sure to start it separately
)

REM Backend check and start
echo.
echo Starting Backend...
start "Brain Tumor - Backend" cmd /k "cd /d %BACKEND% && venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

REM Frontend check and start
echo Starting Frontend...
start "Brain Tumor - Frontend" cmd /k "cd /d %FRONTEND% && npm run dev"

echo.
echo ======================================================
echo  All services started in separate windows
echo ======================================================
echo.
echo Frontend:  http://localhost:5173 or http://localhost:5174
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo Database:  mongodb://localhost:27017
echo.
echo To stop all services, close the terminal windows.
echo.
timeout /t 3 /nobreak
