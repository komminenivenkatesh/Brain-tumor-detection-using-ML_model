# 🚀 Quick Start Guide

## Starting the Application

Choose your preferred method:

### Option 1: PowerShell (Recommended) ⭐
```powershell
cd web_app
.\start.ps1
```

**With options:**
```powershell
.\start.ps1 -NoOpen    # Start services without opening browser
```

### Option 2: Command Prompt
Double-click `start.bat` or run:
```cmd
cd web_app
start.bat
```

### Option 3: Batch File (Original)
```cmd
cd web_app
run_all.bat
```

---

## 🌐 Access Points

Once started, the application is available at:

| Service | URL |
|---------|-----|
| **Web Application** | http://localhost:5173 (or 5174 if 5173 is busy) |
| **API Documentation** | http://localhost:8000/docs |
| **Database** | mongodb://localhost:27017 |

---

## ✨ Features

✅ User registration and login  
✅ Brain MRI image upload  
✅ AI-powered tumor detection using CNN  
✅ Image segmentation visualization  
✅ Results history tracking  
✅ MongoDB database persistence  

---

## 🛑 Stopping Services

### PowerShell or CMD:
Close the terminal windows where services are running.

### Manual Stop:
```powershell
# Stop all Node/Python/MongoDB processes
Get-Process node, python, mongod -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 📋 Prerequisites

Ensure you have installed:
- Python 3.8+
- Node.js 16+
- MongoDB 8.2+

---

## 🔧 Troubleshooting

**Port Already in Use?**  
The frontend will automatically try port 5174 if 5173 is busy.

**PowerShell Execution Policy Error?**  
Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**MongoDB Not Found?**  
Install from: https://www.mongodb.com/try/download/community

---

## 📁 Project Structure

```
web_app/
├── start.ps1          ← PowerShell startup script (NEW)
├── start.bat          ← Batch startup script (NEW)
├── run_all.bat        ← Original batch script
├── backend/           ← FastAPI server
├── frontend/          ← React + Vite app
└── mongo-data/        ← MongoDB data directory
```

---

## 📞 Support

For detailed documentation, see:
- [QUICKSTART.md](QUICKSTART.md)
- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
