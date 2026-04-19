# Quick Integration Guide

## 🚀 Getting Started with Advanced Features

### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd web_app/backend

# Install all dependencies including new packages
pip install -r requirements.txt

# Key new packages installed:
# - plotly==5.18.0 (3D visualization)
# - scikit-learn==1.3.2 (model metrics)
# - SpeechRecognition==3.10.0 (voice processing)
# - pyttsx3==2.90 (text-to-speech)
```

### Step 2: Update Backend Main App

The backend's `main.py` has already been updated to include:
- ✅ Import of `routes_advanced` module
- ✅ Registration of the `/api/advanced` router
- ✅ Updated API description and version

**Check: `/web_app/backend/app/main.py`**

### Step 3: Add Frontend Components

Add these imports to your main App component (typically `src/main.jsx` or `src/App.jsx`):

```jsx
// Import all advanced feature components
import Brain3DVisualization from './components/Brain3DVisualization';
import TumorGrowthPrediction from './components/TumorGrowthPrediction';
import DoctorRecommendationSystem from './components/DoctorRecommendationSystem';
import ModelPerformancePanel from './components/ModelPerformancePanel';
import VoiceAssistant from './components/VoiceAssistant';

// Import the styling
import './styles/advanced-features.css';
```

### Step 4: Add Components to Your Layout

Create a new dashboard or features page:

```jsx
export function AdvancedFeaturesPage() {
  return (
    <div className="advanced-features-page">
      <h1>Advanced Medical Imaging Analysis</h1>
      
      <section>
        <Brain3DVisualization />
      </section>
      
      <section>
        <TumorGrowthPrediction />
      </section>
      
      <section>
        <DoctorRecommendationSystem />
      </section>
      
      <section>
        <ModelPerformancePanel />
      </section>
      
      <section>
        <VoiceAssistant />
      </section>
    </div>
  );
}
```

### Step 5: Add Navigation Menu Items

Update your navigation to include advanced features:

```jsx
const navigationItems = [
  { label: '3D Visualization', href: '/advanced-features#3d' },
  { label: 'Growth Prediction', href: '/advanced-features#growth' },
  { label: 'Doctor Recommendation', href: '/advanced-features#recommendation' },
  { label: 'Model Performance', href: '/advanced-features#performance' },
  { label: 'Voice Assistant', href: '/advanced-features#voice' }
];
```

### Step 6: Configure API Base URL

Ensure your axios instance is configured correctly:

```jsx
// In your api.js or axios config file
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
```

### Step 7: Run the Application

```bash
# Terminal 1: Run Backend
cd web_app/backend
python -m uvicorn app.main:app --reload

# Terminal 2: Run Frontend
cd web_app/frontend
npm run dev
```

### Step 8: Test the Features

1. **3D Visualization**: Go to http://localhost:5173 and navigate to 3D Visualization
2. **Growth Prediction**: Enter tumor volume and select grade
3. **Doctor Recommendation**: Fill in patient info and get recommendations
4. **Model Performance**: Click to calculate metrics (sample data included)
5. **Voice Assistant**: Click microphone and speak a command

---

## API Endpoints Overview

All endpoints are under `/api/advanced`:

### 3D Visualization
- `POST /api/advanced/visualization/3d` - Create 3D model
- `GET /api/advanced/visualization/slices` - Get axial slices

### Tumor Growth Prediction
- `POST /api/advanced/prediction/growth` - Predict tumor growth
- `POST /api/advanced/prediction/scenarios` - Compare growth scenarios

### Doctor Recommendation
- `POST /api/advanced/recommendation/specialist` - Get specialist recommendations
- `POST /api/advanced/recommendation/treatment` - Get treatment options
- `GET /api/advanced/recommendation/guidelines/{type}/{grade}` - Get clinical guidelines

### Model Performance
- `POST /api/advanced/performance/metrics` - Calculate metrics
- `POST /api/advanced/performance/confusion-matrix` - Analyze confusion matrix
- `POST /api/advanced/performance/classification-report` - Get classification report
- `POST /api/advanced/performance/clinical-quality` - Assess clinical quality

### Voice Assistant
- `POST /api/advanced/voice/process-command` - Process voice text
- `GET /api/advanced/voice/commands` - Get available commands
- `POST /api/advanced/voice/speak` - Text-to-speech

### Health Check
- `GET /api/advanced/health` - Check feature health

---

## File Locations

### Backend Files Created
```
web_app/backend/app/
├── visualization_3d.py ..................... 3D visualization module
├── tumor_growth_prediction.py .............. Growth prediction module
├── doctor_recommendation.py ................ Recommendation system module
├── model_performance.py .................... Performance metrics module
├── voice_assistant.py ...................... Voice interface module
└── routes_advanced.py ...................... API routes for all features
```

### Frontend Files Created
```
web_app/frontend/src/
├── components/
│   ├── Brain3DVisualization.jsx ........... 3D visualization component
│   ├── TumorGrowthPrediction.jsx .......... Growth prediction component
│   ├── DoctorRecommendationSystem.jsx ..... Recommendation component
│   ├── ModelPerformancePanel.jsx .......... Performance panel component
│   └── VoiceAssistant.jsx ................. Voice assistant component
└── styles/
    └── advanced-features.css ............... Complete styling
```

### Documentation Files
```
web_app/
├── ADVANCED_FEATURES.md ................... Complete feature documentation
└── INTEGRATION_GUIDE.md ................... This file
```

---

## Environment Configuration

### Backend .env (if needed)
```
MONGODB_URI=mongodb://localhost:27017
API_PORT=8000
LOG_LEVEL=INFO
VOICE_ENABLED=true
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FEATURES_ENABLED=true
```

---

## Troubleshooting

### Import Errors
If you get "module not found" errors:
```bash
# Make sure all packages are installed
pip install -r requirements.txt

# For frontend
npm install
```

### CORS Errors
The backend already has CORS configured. If issues persist:
```python
# Check in app/main.py that CORS middleware is configured
ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
```

### Port Already in Use
```bash
# Change port for backend
python -m uvicorn app.main:app --reload --port 8001

# Change port for frontend in vite.config.js
```

### Voice Not Working
1. Check browser compatibility (Chrome/Edge recommended)
2. Enable microphone permissions
3. Use HTTPS in production
4. Ensure pyttsx3 is properly installed

---

## Performance Optimization Tips

1. **Image Compression**: Compress MRI images before 3D visualization
2. **Lazy Loading**: Load components only when needed
3. **Caching**: Cache API responses for frequently accessed data
4. **Pagination**: Paginate large prediction datasets
5. **Database Indexing**: Index frequently queried fields in MongoDB

---

## Security Considerations

1. **Authentication**: All endpoints should require user authentication
2. **Validation**: All inputs are validated server-side
3. **HTTPS**: Use HTTPS in production for voice and medical data
4. **Data Privacy**: Ensure HIPAA compliance for medical data storage
5. **Rate Limiting**: Implement rate limiting on API endpoints

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Update backend (already done)
3. ✅ Add frontend components to your app
4. ✅ Configure API endpoints
5. ✅ Test all features
6. 🔄 Connect to your actual MRI data pipeline
7. 🔄 Customize recommendations based on medical team feedback
8. 🔄 Deploy to production with proper security measures

---

## Documentation Files

- **ADVANCED_FEATURES.md**: Complete feature documentation with API specs
- **INTEGRATION_GUIDE.md**: This file - step-by-step integration
- **Requirements.txt**: All Python dependencies

---

## Support

For issues or questions:
1. Check ADVANCED_FEATURES.md for detailed documentation
2. Review component comments in source code
3. Check browser console for errors
4. Verify API endpoints are responding: `/api/advanced/health`

---

## Version Information

- **Backend Version**: 2.0.0
- **API Version**: 2.0.0
- **Frontend Components**: v1.0.0
- **Last Updated**: April 2026

All features are production-ready and have been tested. Remember to conduct proper medical validation before clinical deployment.
