# Brain Tumor Detection - Complete Project

## 🎯 Project Overview

This is an advanced AI-powered Brain Tumor Detection system with 5 cutting-edge features:

- **3D Brain Visualization** - Interactive 3D visualization of MRI scans with tumor highlighting
- **Tumor Growth Prediction** - AI-powered forecasting of tumor growth trajectories
- **Doctor Recommendation System** - Clinical decision support with specialist suggestions
- **Model Performance Analytics** - Real-time accuracy metrics and confusion matrix analysis
- **Voice Assistant** - Hands-free voice commands for all operations

## 🚀 Quick Start

### Option 1: Using Batch File (Easiest)
1. Navigate to the project root directory
2. Double-click **`START_PROJECT.bat`**
3. Two command windows will open (Backend & Frontend)
4. Wait 10-15 seconds for both servers to start
5. Open browser to **http://localhost:5173**

### Option 2: Using PowerShell Script
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\START_PROJECT.ps1
```

### Option 3: Manual Startup

**Terminal 1 - Start Backend API:**
```powershell
cd web_app/backend
python run_server.py
```

**Terminal 2 - Start Frontend:**
```powershell
cd web_app/frontend
npm run dev
```

## 📍 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend Application** | http://localhost:5173 | Main application UI |
| **Backend API** | http://127.0.0.1:8000 | API endpoints |
| **API Documentation** | http://127.0.0.1:8000/docs | Interactive API docs (Swagger) |
| **Alternative API Docs** | http://127.0.0.1:8000/redoc | ReDoc API documentation |

## 💻 System Requirements

- **Python**: 3.10 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **RAM**: 4GB minimum (8GB recommended for TensorFlow)
- **Disk Space**: 2GB for dependencies

## 📦 Dependencies Installed

### Backend (Python)
- FastAPI 0.104.1 - Web framework
- Uvicorn 0.24.0 - ASGI server
- TensorFlow 2.14.0 - Deep learning
- OpenCV 4.8.1.78 - Image processing
- PyMongo 4.6.0 - MongoDB connector
- Plotly 5.18.0 - Data visualization
- SpeechRecognition 3.10.0 - Voice input
- pyttsx3 2.90 - Voice output
- And 15+ more packages

### Frontend (Node.js)
- React 18.3.1
- Vite 5.4.21
- Axios 1.7.2
- Chart.js 4.4.1
- And 130+ packages

## 🔐 Configuration

### Backend Configuration (`.env`)
Located at `web_app/backend/.env`:
```
SECRET_KEY=your-secret-key-change-in-production
MONGODB_URL=mongodb://localhost:27017
PIXEL_SPACING_CM=0.1
```

### API Port
- Default: **8000**
- To change, edit `web_app/backend/run_server.py`

### Frontend Port
- Default: **5173** (Vite default)
- Configure in `web_app/frontend/vite.config.js`

## 🎨 Features & Usage

### 1. 3D Brain Visualization
- Upload MRI images
- Generate interactive 3D brain models
- View tumor highlighted in 3D space
- Rotate, zoom, and pan the visualization

### 2. Tumor Growth Prediction
- Input tumor volume and growth parameters
- AI predicts growth trajectory over time
- View risk assessment (LOW/MODERATE/HIGH)
- Compare multiple growth scenarios

### 3. Doctor Recommendation System
- Input patient information
- Select symptoms and comorbidities
- Get specialist recommendations
- View clinical guidelines for treatment

### 4. Model Performance Analytics
- View model accuracy metrics
- Analyze confusion matrix
- Check sensitivity, specificity, F1-score
- Clinical quality assessment

### 5. Voice Assistant
- Click microphone button to activate
- Speak voice commands:
  - "upload image"
  - "analyze"
  - "show results"
  - "3d visualization"
  - "growth prediction"
  - "doctor recommendation"
  - "performance metrics"
  - "help"
  - "exit"

## 🔌 API Endpoints

### Advanced Features
- `POST /api/advanced/visualization/3d` - Generate 3D visualization
- `POST /api/advanced/prediction/growth` - Predict tumor growth
- `POST /api/advanced/recommendation/specialist` - Get specialist recommendation
- `POST /api/advanced/performance/metrics` - Calculate performance metrics
- `POST /api/advanced/voice/process-command` - Process voice commands

### Core Features
- `POST /api/upload` - Upload medical image
- `POST /api/analyze` - Analyze uploaded image
- `GET /api/results` - Get analysis results
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 8000 (Backend)
netstat -ano | findstr :8000

# Find process using port 5173 (Frontend)
netstat -ano | findstr :5173

# Kill process by PID
taskkill /PID [PID] /F
```

### Missing Dependencies
```powershell
# Reinstall backend dependencies
cd web_app/backend
pip install -r requirements.txt

# Reinstall frontend dependencies
cd web_app/frontend
npm install
```

### TensorFlow Installation Issues
```powershell
pip install tensorflow --upgrade
```

### CORS Errors
Check `web_app/backend/app/config.py` for `ALLOWED_ORIGINS` configuration

### MongoDB Connection Issues
Ensure MongoDB is running or update `MONGODB_URL` in `.env` file

## 📊 Project Structure

```
Brain-tumor-detection-of-MRI-images-using-CNN-main/
├── web_app/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py              # FastAPI app
│   │   │   ├── config.py            # Configuration
│   │   │   ├── routes_advanced.py   # Advanced feature routes
│   │   │   ├── visualization_3d.py  # 3D visualization
│   │   │   ├── tumor_growth_prediction.py
│   │   │   ├── doctor_recommendation.py
│   │   │   ├── model_performance.py
│   │   │   ├── voice_assistant.py
│   │   │   └── ... other modules
│   │   ├── models/                  # Pre-trained models
│   │   ├── requirements.txt
│   │   ├── run_server.py           # Server startup
│   │   └── .env
│   └── frontend/
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── pages/
│       │   ├── api.js
│       │   └── App.jsx
│       ├── vite.config.js
│       ├── package.json
│       └── index.html
├── START_PROJECT.bat               # Quick start batch
├── START_PROJECT.ps1               # PowerShell start script
└── README.md
```

## 🤝 Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation at `/docs`
3. Check console logs for error details

## ✨ Next Steps

After starting the project:
1. ✅ Create an account or login
2. ✅ Upload a brain MRI image
3. ✅ Run the analysis
4. ✅ View 3D visualization
5. ✅ Check growth predictions
6. ✅ Get doctor recommendations
7. ✅ Review performance metrics
8. ✅ Try voice commands

---

**Happy analyzing! 🧠✨**
