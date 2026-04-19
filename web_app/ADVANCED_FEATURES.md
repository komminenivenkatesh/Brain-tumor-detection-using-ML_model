# Advanced Features Documentation

## Overview

This document describes the five advanced features added to the Brain Tumor Detection application:

1. **3D Brain Visualization** - Interactive 3D rendering of MRI brain with tumor highlighting
2. **Tumor Growth Prediction** - AI-powered prediction of tumor growth trajectories
3. **Doctor Recommendation System** - Specialist and treatment recommendations
4. **Model Performance Panel** - Comprehensive model metrics and clinical quality assessment
5. **Voice Assistant** - Speech recognition and text-to-speech interface

---

## 1. 3D Brain Visualization ⭐

### Features
- Convert MRI slices into interactive 3D model
- Highlight tumor regions in different colors
- Generate key axial slices with overlay

### Backend Endpoints

#### Create 3D Visualization
```
POST /api/advanced/visualization/3d
Content-Type: application/json

{
  "tumor_volume_mm3": 1250.5,
  "brain_volume_mm3": 1400
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "visualization": "<plotly json>",
    "tumor_volume": 1250,
    "brain_volume": 1400,
    "tumor_percentage": 89.29
  }
}
```

#### Get Axial Slices
```
GET /api/advanced/visualization/slices?num_slices=5
```

**Response:**
```json
{
  "success": true,
  "slices": [
    {
      "index": 10,
      "image": [[...pixel data...]],
      "tumor_mask": [[...mask data...]],
      "has_tumor": true
    }
  ],
  "total_slices": 50
}
```

### Frontend Component
```jsx
import Brain3DVisualization from './components/Brain3DVisualization';

<Brain3DVisualization />
```

### Usage
1. Navigate to 3D Visualization tab
2. Enter tumor volume in mm³
3. Click "Generate 3D Model"
4. Interactive 3D visualization will load with Plotly

---

## 2. Tumor Growth Prediction 🔥

### Features
- Predict tumor growth over custom time periods
- Compare growth scenarios (slow/moderate/aggressive)
- Risk assessment based on growth rate
- Doubling time calculation
- Clinical recommendations

### Backend Endpoints

#### Predict Growth
```
POST /api/advanced/prediction/growth
Content-Type: application/json

{
  "current_volume_mm3": 500.0,
  "tumor_grade": "moderate",
  "days_ahead": 90
}
```

**Parameters:**
- `tumor_grade`: "slow", "moderate", or "aggressive"
- `days_ahead`: Number of days to predict (default: 90)

**Response:**
```json
{
  "success": true,
  "current_volume_mm3": 500.0,
  "tumor_grade": "moderate",
  "growth_rate_mm3_per_day": 2.0,
  "doubling_time_days": 173.29,
  "predictions": [
    {
      "days": 0,
      "date": "2024-04-16",
      "predicted_volume_mm3": 500.0,
      "volume_increase_percent": 0.0
    }
  ],
  "risk_assessment": {
    "level": "MODERATE",
    "volume_increase_percent": 25.5,
    "final_volume_mm3": 627.5,
    "recommendation": "Close monitoring and treatment consideration recommended"
  }
}
```

#### Compare Growth Scenarios
```
POST /api/advanced/prediction/scenarios
```

**Response:**
```json
{
  "success": true,
  "current_volume_mm3": 500.0,
  "scenarios": {
    "slow": {
      "growth_rate": 0.5,
      "doubling_time": 693.15,
      "final_volume": 565.0,
      "risk_level": "LOW"
    },
    "moderate": {
      "growth_rate": 2.0,
      "doubling_time": 173.29,
      "final_volume": 690.0,
      "risk_level": "MODERATE"
    },
    "aggressive": {
      "growth_rate": 5.0,
      "doubling_time": 69.31,
      "final_volume": 1350.0,
      "risk_level": "HIGH"
    }
  }
}
```

### Frontend Component
```jsx
import TumorGrowthPrediction from './components/TumorGrowthPrediction';

<TumorGrowthPrediction />
```

### Usage
1. Enter current tumor volume
2. Select tumor grade (slow/moderate/aggressive)
3. Set prediction period (days)
4. Click "Predict Growth" or "Compare Scenarios"
5. View growth trajectory chart and risk assessment

---

## 3. Doctor Recommendation System 👨‍⚕️

### Features
- Specialist type recommendations (Neurologist, Neuro-Oncologist, Neurosurgeon, Radiation Oncologist)
- Treatment option recommendations
- Patient age and comorbidity consideration
- Clinical guideline summaries

### Backend Endpoints

#### Get Specialist Recommendations
```
POST /api/advanced/recommendation/specialist
Content-Type: application/json

{
  "tumor_size_mm3": 2500.0,
  "tumor_grade": "high",
  "location_operable": true,
  "symptoms": ["Headaches", "Vision Changes"]
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "priority": 1,
      "specialist": "Neuro-Oncologist",
      "expertise": "Specialized cancer treatment of brain and nervous system",
      "responsibilities": [
        "Chemotherapy administration",
        "Treatment planning",
        "Clinical trial evaluation",
        "Symptom management"
      ]
    }
  ],
  "recommended_team_composition": ["Neuro-Oncologist", "Neurosurgeon", ...]
}
```

#### Get Treatment Recommendations
```
POST /api/advanced/recommendation/treatment
Content-Type: application/json

{
  "tumor_size_mm3": 2500.0,
  "tumor_grade": "high",
  "location_operable": true,
  "patient_age": 45,
  "comorbidities": ["Diabetes", "Hypertension"]
}
```

**Response:**
```json
{
  "success": true,
  "recommended_treatments": [
    {
      "sequence": 1,
      "treatment": "Combined Multimodal Treatment",
      "description": "Surgery + Chemotherapy + Radiation",
      "use_cases": ["High-grade gliomas", "Large tumors", "Aggressive tumors"],
      "expected_duration": "6-12 months total",
      "possible_side_effects": ["Cumulative effects of all modalities"]
    }
  ],
  "age_consideration": "",
  "comorbidity_considerations": "Patient has 2 comorbidities...",
  "notes": "All recommendations should be discussed with the patient..."
}
```

#### Get Clinical Guidelines
```
GET /api/advanced/recommendation/guidelines/{tumor_type}/{tumor_grade}

Examples:
- /api/advanced/recommendation/guidelines/glioma/high
- /api/advanced/recommendation/guidelines/meningioma/medium
- /api/advanced/recommendation/guidelines/metastasis/any
```

**Response:**
```json
{
  "tumor_type": "glioma",
  "tumor_grade": "high",
  "clinical_guideline": "Maximum safe surgical resection + concurrent radiation + chemotherapy"
}
```

### Frontend Component
```jsx
import DoctorRecommendationSystem from './components/DoctorRecommendationSystem';

<DoctorRecommendationSystem />
```

### Usage
1. Enter patient and tumor information
2. Select symptoms and comorbidities
3. Click "Get Specialist Recommendations"
4. Click "Get Treatment Options"
5. Review recommendations with considerations

---

## 4. Model Performance Panel 📊

### Features
- Calculate comprehensive performance metrics (Accuracy, Precision, Recall, F1, etc.)
- Detailed confusion matrix analysis with clinical interpretation
- ROC-AUC calculation
- Clinical quality assessment
- Classification report

### Backend Endpoints

#### Calculate Performance Metrics
```
POST /api/advanced/performance/metrics
Content-Type: application/json

{
  "y_true": [0, 1, 0, 1, 1, 0, 0, 1],
  "y_pred": [0, 1, 0, 0, 1, 0, 1, 1],
  "y_pred_proba": [0.1, 0.9, 0.2, 0.4, 0.8, 0.3, 0.7, 0.6]
}
```

**Response:**
```json
{
  "success": true,
  "accuracy": 0.75,
  "precision": 0.67,
  "recall": 1.0,
  "sensitivity": 1.0,
  "specificity": 0.67,
  "f1_score": 0.8,
  "mcc": 0.577,
  "roc_auc": 0.92,
  "confusion_matrix": {
    "true_negatives": 2,
    "false_positives": 1,
    "false_negatives": 0,
    "true_positives": 3
  },
  "sample_counts": {
    "total_samples": 8,
    "positive_samples": 4,
    "negative_samples": 4
  }
}
```

#### Analyze Confusion Matrix
```
POST /api/advanced/performance/confusion-matrix
```

**Response includes detailed interpretation:**
```json
{
  "success": true,
  "metrics": { ... },
  "interpretation": {
    "true_positives": {
      "count": 3,
      "percentage": 37.5,
      "meaning": "Tumors correctly identified as tumors"
    },
    "false_negatives": {
      "count": 0,
      "percentage": 0.0,
      "meaning": "Tumors incorrectly identified as non-tumors",
      "clinical_impact": "CRITICAL - Missed diagnoses, delayed treatment"
    }
  }
}
```

#### Get Classification Report
```
POST /api/advanced/performance/classification-report
```

#### Assess Clinical Quality
```
POST /api/advanced/performance/clinical-quality
```

**Response:**
```json
{
  "success": true,
  "metrics": { ... },
  "quality_assessment": {
    "clinical_readiness": "READY",
    "accuracy_assessment": {
      "score": 0.95,
      "status": "EXCELLENT",
      "threshold": 0.95
    },
    "sensitivity_assessment": {
      "score": 0.92,
      "status": "GOOD",
      "threshold": 0.90,
      "clinical_importance": "CRITICAL - Lower sensitivity increases missed diagnoses"
    },
    "recommendations": [...]
  }
}
```

### Frontend Component
```jsx
import ModelPerformancePanel from './components/ModelPerformancePanel';

<ModelPerformancePanel />
```

### Metrics Explained

| Metric | Definition | Clinical Importance |
|--------|-----------|-------------------|
| **Accuracy** | (TP + TN) / Total | Overall model correctness |
| **Precision** | TP / (TP + FP) | False alarm rate |
| **Recall/Sensitivity** | TP / (TP + FN) | **CRITICAL** - Missed diagnosis rate |
| **Specificity** | TN / (TN + FP) | False positive rate |
| **F1 Score** | Harmonic mean of Precision & Recall | Balance metric |
| **ROC-AUC** | Area under ROC curve | Overall discrimination ability |
| **MCC** | Matthews Correlation Coefficient | Balanced metric for imbalanced data |

### Usage
1. Click buttons to calculate different metrics
2. View metric cards with performance values
3. Analyze confusion matrix with interpretation
4. Review clinical quality assessment
5. Check recommendations for improvement

---

## 5. Voice Assistant 🎤

### Features
- Speech-to-text recognition using Web Speech API
- Text-to-speech response using pyttsx3
- Voice command processing
- Multiple command aliases
- Interactive voice interface

### Backend Endpoints

#### Process Voice Command
```
POST /api/advanced/voice/process-command
Content-Type: application/json

{
  "text": "upload MRI"
}
```

**Response:**
```json
{
  "success": true,
  "command": "upload",
  "action": "upload_file",
  "response": "Opening file upload. Please select an MRI image.",
  "confidence": "high"
}
```

#### Get Available Commands
```
GET /api/advanced/voice/commands
```

**Response:**
```json
{
  "success": true,
  "total_commands": 8,
  "commands": [
    {
      "command": "upload",
      "aliases": ["upload mri", "upload image", "upload scan"],
      "description": "Opening file upload. Please select an MRI image."
    },
    {
      "command": "analyze",
      "aliases": ["analyze", "run analysis", "analyze image", "check tumor"],
      "description": "Starting analysis. This may take a moment."
    }
  ]
}
```

#### Text-to-Speech
```
POST /api/advanced/voice/speak?message=Hello
```

### Voice Commands

| Command | Aliases | Action |
|---------|---------|--------|
| **upload** | upload mri, upload image, upload scan | Open file upload dialog |
| **analyze** | analyze, run analysis, check tumor | Start image analysis |
| **show_results** | show results, display results, what's the result | Display analysis results |
| **3d** | 3d view, 3d model, show 3d | Generate 3D visualization |
| **growth_prediction** | predict growth, tumor growth, how fast | Show growth prediction |
| **recommendation** | doctor recommendation, specialist, treatment | Get recommendations |
| **performance** | model performance, accuracy, show metrics | Display performance metrics |
| **help** | help, what can you do, commands | Show available commands |
| **exit** | exit, quit, close, goodbye | Close application |

### Frontend Component
```jsx
import VoiceAssistant from './components/VoiceAssistant';

<VoiceAssistant />
```

### Browser Requirements
- Chrome, Edge, or other browser supporting Web Speech API
- Microphone permissions required
- HTTPS connection recommended

### Usage
1. Click microphone button to start listening
2. Speak clearly and naturally
3. Wait for recognition confirmation
4. Voice assistant processes command and responds
5. Feature loads automatically

### Environment Setup
```bash
# Backend requirements already added
pip install -r backend/requirements.txt

# Key dependencies:
# - pyttsx3==2.90 (Text-to-Speech)
# - SpeechRecognition==3.10.0 (Speech-to-Text support)
```

---

## Installation & Setup

### Backend Setup
```bash
cd web_app/backend

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd web_app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Import Components in App
```jsx
// In your main app file
import Brain3DVisualization from './components/Brain3DVisualization';
import TumorGrowthPrediction from './components/TumorGrowthPrediction';
import DoctorRecommendationSystem from './components/DoctorRecommendationSystem';
import ModelPerformancePanel from './components/ModelPerformancePanel';
import VoiceAssistant from './components/VoiceAssistant';

// Import styles
import './styles/advanced-features.css';

// Add to main App component
function App() {
  return (
    <div className="app">
      <Brain3DVisualization />
      <TumorGrowthPrediction />
      <DoctorRecommendationSystem />
      <ModelPerformancePanel />
      <VoiceAssistant />
    </div>
  );
}
```

---

## API Health Check

All endpoints are available at:
```
GET /api/advanced/health

Response:
{
  "status": "healthy",
  "features": [
    "3D Visualization",
    "Tumor Growth Prediction",
    "Doctor Recommendation",
    "Model Performance Analysis",
    "Voice Assistant"
  ]
}
```

---

## Technical Details

### Technologies Used
- **Backend**: FastAPI, NumPy, SciKit-Learn, Plotly, TensorFlow
- **Frontend**: React, Chart.js, Axios
- **Voice**: Web Speech API (browser), pyttsx3 (backend)
- **Database**: MongoDB (for historical data)

### File Structure
```
backend/app/
├── visualization_3d.py
├── tumor_growth_prediction.py
├── doctor_recommendation.py
├── model_performance.py
├── voice_assistant.py
└── routes_advanced.py

frontend/src/
├── components/
│   ├── Brain3DVisualization.jsx
│   ├── TumorGrowthPrediction.jsx
│   ├── DoctorRecommendationSystem.jsx
│   ├── ModelPerformancePanel.jsx
│   └── VoiceAssistant.jsx
└── styles/
    └── advanced-features.css
```

### Database Integration
Store analysis results and performance metrics:
```python
# Example: Save analysis result
db.analyses.insert_one({
  "timestamp": datetime.now(),
  "tumor_volume": 1250.5,
  "predictions": [...],
  "recommendations": {...},
  "metrics": {...}
})
```

---

## Future Enhancements

1. **Machine Learning Integration**: Train growth prediction models on historical data
2. **Database Persistence**: Store and retrieve historical analyses
3. **Advanced 3D**: WebGL-based 3D rendering for better performance
4. **Multi-language Voice**: Support multiple languages in voice assistant
5. **PDF Export**: Generate comprehensive reports with all analyses
6. **Real-time Monitoring**: Stream analysis updates in real-time
7. **Ensemble Predictions**: Combine multiple prediction models
8. **Treatment Plan Generation**: Automated treatment plan creation

---

## Support & Troubleshooting

### Voice Not Working
- Check browser compatibility (Chrome, Edge recommended)
- Ensure microphone permissions granted
- Try refreshing the page
- Check HTTPS connection

### 3D Visualization Issues
- Large MRI files may load slowly
- Ensure JavaScript enabled
- Clear browser cache if display issues persist

### Performance Issues
- Consider implementing pagination for large datasets
- Use image compression for MRI data
- Implement caching for frequently accessed analyses

---

## Clinical Disclaimer

⚠️ **Important**: These tools are designed to assist healthcare professionals and should NOT replace clinical judgment. All recommendations should be reviewed and validated by qualified medical professionals before implementation.

---

## License & Credits

This advanced features package extends the Brain Tumor Detection application with enterprise-level capabilities for medical imaging analysis and AI-driven clinical support.

Version: 2.0.0
Last Updated: April 2026
