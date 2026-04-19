@echo off
setlocal

cd /d "%~dp0"

echo =====================================================
echo   Brain Tumor Detection - One Click Guide
echo =====================================================
echo.
echo Step 1: Read quick guide in VS Code/browser
echo Step 2: Start MongoDB

echo Step 3: Start Backend API
echo Step 4: Start Frontend

echo.
echo Opening guide file...
start "" QUICKSTART_EASY.md

echo.
echo Do you want to start the full project now? (Y/N)
choice /c YN /n /m "Enter choice: "
if errorlevel 2 goto :end

call run_all.bat

echo.
echo App URLs:
echo Frontend: http://localhost:5173 (or 5174)
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

:end
echo Done.
exit /b 0
