# Backend Server - Fixed DLL Error

## Quick Start

The DLL error has been fixed by using an isolated virtual environment (`venv_clean`). 

### Windows - Batch File (Recommended)
```bash
cd C:\Users\kommi\Desktop\BrainTumor-Project\web_app\backend
START_SERVER_CLEAN.bat
```

### Windows - PowerShell
```powershell
cd C:\Users\kommi\Desktop\BrainTumor-Project\web_app\backend
.\START_SERVER_CLEAN.ps1
```

### Windows - Manual (PowerShell)
```powershell
cd C:\Users\kommi\Desktop\BrainTumor-Project\web_app\backend
.\venv_clean\Scripts\Activate.ps1
python run_server.py
```

## What Was Fixed

- **Original Error**: `DLL load failed while importing _pywrap_traceme: An Application Control policy has blocked this file`
- **Root Cause**: System Python had conflicting TensorFlow versions (2.13.0, 2.14.0, 2.21.0)
- **Solution**: Created isolated virtual environment `venv_clean` with:
  - TensorFlow 2.14.0
  - OpenCV 4.8.1.78
  - NumPy 1.24.3 (compatible with both)
  - All backend dependencies

## Server Status

Once the server starts, you should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [####] using StatReload
```

Then you can:
1. Access the frontend at `http://localhost:5173` (if running)
2. Upload brain MRI images for analysis
3. The API will process them WITHOUT DLL errors ✅

## Frontend Connection

Make sure the frontend is pointing to the correct backend URL:
- Backend: `http://127.0.0.1:8000`
- Frontend should use this API URL in `src/api.js`
