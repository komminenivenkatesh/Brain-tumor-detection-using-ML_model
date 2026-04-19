@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"
set "MONGO_DATA=%BACKEND_DIR%\mongo-data"
set "PYTHON_EXE=%BACKEND_DIR%\venv\Scripts\python.exe"
set "NPM_CMD="
set "MONGOD_EXE="
set "FRONTEND_INSTALL_EXIT=0"

echo Tip: Double-click CLICK_ME_FIRST.bat for guided steps.

rem Resolve npm path even if Node.js is not in PATH for this shell
if exist "C:\Program Files\nodejs\npm.cmd" (
  set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
) else (
  for /f "delims=" %%I in ('where npm 2^>nul') do (
    if not defined NPM_CMD set "NPM_CMD=%%I"
  )
)

if not defined NPM_CMD (
  echo ERROR: npm was not found.
  echo Install Node.js LTS from https://nodejs.org/ and rerun this script.
  exit /b 1
)

rem Resolve mongod path
for /f "delims=" %%I in ('where mongod 2^>nul') do (
  if not defined MONGOD_EXE set "MONGOD_EXE=%%I"
)
if not defined MONGOD_EXE (
  for /f "delims=" %%I in ('dir /b /s "C:\Program Files\MongoDB\Server\*\bin\mongod.exe" 2^>nul') do (
    if not defined MONGOD_EXE set "MONGOD_EXE=%%I"
  )
)

if not defined MONGOD_EXE (
  echo ERROR: mongod was not found.
  echo Install MongoDB Community Server and rerun this script.
  exit /b 1
)

rem Ensure MongoDB data folder exists
if not exist "%MONGO_DATA%" mkdir "%MONGO_DATA%" >nul

rem Create backend venv if missing
if not exist "%PYTHON_EXE%" (
  echo Creating backend virtual environment...
  where py >nul 2>nul
  if %errorlevel%==0 (
    py -3 -m venv "%BACKEND_DIR%\venv"
  ) else (
    python -m venv "%BACKEND_DIR%\venv"
  )
  if %errorlevel% neq 0 (
    echo ERROR: Failed to create backend virtual environment.
    exit /b 1
  )

  echo Installing backend dependencies...
  "%PYTHON_EXE%" -m pip install --upgrade pip
  "%PYTHON_EXE%" -m pip install -r "%BACKEND_DIR%\requirements.txt"
  if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies.
    exit /b 1
  )
)

rem Install frontend dependencies once
if not exist "%FRONTEND_DIR%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND_DIR%"
  call "%NPM_CMD%" install
  set "FRONTEND_INSTALL_EXIT=%errorlevel%"
  popd
  if %FRONTEND_INSTALL_EXIT% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    exit /b 1
  )
)

rem Start MongoDB (background)
echo Starting MongoDB...
netstat -ano | findstr /R /C:":27017 .*LISTENING" >nul
if %errorlevel%==0 (
  echo MongoDB already running on port 27017.
) else (
  start "MongoDB" cmd /c ""%MONGOD_EXE%" --dbpath "%MONGO_DATA%" --bind_ip 127.0.0.1 --port 27017"
)

rem Start backend (background)
echo Starting backend...
start "Backend" cmd /c "cd /d "%BACKEND_DIR%" && "%PYTHON_EXE%" -m uvicorn app.main:app --reload --port 8000"

rem Start frontend (background)
echo Starting frontend...
start "Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && "%NPM_CMD%" run dev"

echo.
echo Services launched.
echo Backend:  http://127.0.0.1:8000
echo Frontend: check Vite terminal output for the active localhost port.
echo.
echo To stop everything, close the launched service terminals.
