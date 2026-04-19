@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

cls
echo ==========================================
echo  Brain Tumor Detection - One Click Start
echo ==========================================
echo.

echo Starting services in separate windows...
echo.

rem MongoDB is assumed to already be installed and available
netstat -ano | findstr :27017 >nul
if %errorlevel%==0 (
    echo [OK] MongoDB is already running on port 27017.
) else (
    echo [WARN] MongoDB is not running. Start it before using the app.
)

netstat -ano | findstr :8000 >nul
if %errorlevel%==0 (
    echo [OK] Backend is already running on port 8000.
) else (
    echo Starting backend...
    start "Brain Tumor Backend" cmd /k "cd /d \"%BACKEND%\" && \"%BACKEND%\venv\Scripts\python.exe\" -m uvicorn app.main:app --reload --port 8000"
)

netstat -ano | findstr :5173 >nul
if %errorlevel%==0 (
    set "FRONTEND_URL=http://localhost:5173"
    echo [OK] Frontend is already running on port 5173.
) else (
    netstat -ano | findstr :5174 >nul
    if %errorlevel%==0 (
        set "FRONTEND_URL=http://localhost:5174"
        echo [OK] Frontend is already running on port 5174.
    ) else (
        set "FRONTEND_URL=http://localhost:5173"
        echo Starting frontend...
        start "Brain Tumor Frontend" cmd /k "cd /d \"%FRONTEND%\" && npm run dev"
    )
)

echo.
echo ==========================================
echo  App should open on:
echo  - Frontend: %FRONTEND_URL%
echo  - Backend:  http://localhost:8000
echo  - API Docs: http://localhost:8000/docs
echo ==========================================
echo.
echo To stop the app, close the opened terminal windows.
echo.

endlocal
