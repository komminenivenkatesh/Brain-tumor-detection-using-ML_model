@echo off
REM Start the backend server using the clean virtual environment
REM This script fixes the DLL loading error by using the isolated venv_clean

cd /d "%~dp0"

echo ========================================
echo Brain Tumor Detection API - Clean Start
echo ========================================
echo.
echo Activating clean virtual environment...
call venv_clean\Scripts\activate.bat

echo.
echo Starting server with venv_clean Python...
echo Server will run on: http://127.0.0.1:8000
echo.

venv_clean\Scripts\python.exe run_server.py

pause
