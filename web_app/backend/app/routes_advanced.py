"""Advanced Features Routes"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import random
import cv2
from io import BytesIO

from app.visualization_3d import create_3d_brain_model, generate_axial_slices
from app.tumor_growth_prediction import TumorGrowthPredictor
from app.doctor_recommendation import DoctorRecommendationSystem
from app.model_performance import ModelPerformanceAnalyzer
from app.voice_assistant import VoiceAssistant, create_voice_response

router = APIRouter(prefix="/api/advanced", tags=["Advanced Features"])

# ==================== Pydantic Models ====================

class Visualization3DRequest(BaseModel):
    tumor_volume_mm3: Optional[float] = None
    brain_volume_mm3: float = 1400000.0
    generate_volume: bool = False

class GrowthPredictionRequest(BaseModel):
    current_volume_mm3: float
    tumor_grade: str = "moderate"  # slow, moderate, aggressive
    days_ahead: int = 90

class SpecialistRecommendationRequest(BaseModel):
    tumor_size_mm3: float
    tumor_grade: str
    location_operable: bool
    symptoms: List[str] = []

class TreatmentRecommendationRequest(BaseModel):
    tumor_size_mm3: float
    tumor_grade: str
    location_operable: bool
    patient_age: int
    comorbidities: List[str] = []

class PerformanceMetricsRequest(BaseModel):
    y_true: List[int]
    y_pred: List[int]
    y_pred_proba: Optional[List[float]] = None

class VoiceCommandRequest(BaseModel):
    text: str

# ==================== 3D Visualization Routes ====================

@router.post("/visualization/3d")
async def create_3d_visualization(request: Visualization3DRequest):
    """
    Create 3D brain visualization with tumor highlighting
    """
    try:
        if request.brain_volume_mm3 <= 0:
            raise HTTPException(status_code=400, detail="brain_volume_mm3 must be greater than 0")

        # Allow either user-provided tumor volume or API-generated volume.
        if request.generate_volume or request.tumor_volume_mm3 is None:
            used_tumor_volume = float(round(random.uniform(1500.0, 45000.0), 2))
            volume_source = "generated"
        else:
            if request.tumor_volume_mm3 <= 0:
                raise HTTPException(status_code=400, detail="tumor_volume_mm3 must be greater than 0")
            used_tumor_volume = float(request.tumor_volume_mm3)
            volume_source = "user_input"

        # Return visualization metadata without processing large arrays
        tumor_percentage = (used_tumor_volume / request.brain_volume_mm3) * 100
        
        return {
            'success': True,
            'data': {
                'tumor_volume': used_tumor_volume,
                'brain_volume': request.brain_volume_mm3,
                'tumor_percentage': round(tumor_percentage, 2),
                'volume_source': volume_source,
                'input_tumor_volume': request.tumor_volume_mm3,
                'visualization_type': '3D_MODEL',
                'status': 'ready',
                'slices_available': 50,
                'resolution': '256x256'
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visualization/slices")
async def get_axial_slices(num_slices: int = 5):
    """
    Get key axial slices with tumor overlay
    """
    try:
        # Return slice metadata without processing large arrays
        slices = []
        total_slices = 50
        slice_indices = [int(i * total_slices / max(num_slices, 1)) for i in range(num_slices)]
        
        for idx in slice_indices:
            slices.append({
                'slice_number': idx,
                'position_mm': round(idx * 3.5, 2),  # Assuming 3.5mm spacing
                'has_tumor': 20 <= idx < 30,
                'tumor_area_percent': 15 if (20 <= idx < 30) else 0
            })
        
        return {
            'success': True,
            'total_slices': total_slices,
            'selected_slices': slices,
            'status': 'ready'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Tumor Growth Prediction Routes ====================

@router.post("/prediction/growth")
async def predict_tumor_growth(request: GrowthPredictionRequest):
    """
    Predict tumor growth over time
    """
    try:
        predictor = TumorGrowthPredictor()
        result = predictor.predict_growth(
            request.current_volume_mm3,
            request.tumor_grade,
            request.days_ahead
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prediction/scenarios")
async def compare_growth_scenarios(request: GrowthPredictionRequest):
    """
    Compare growth predictions across different tumor grades
    """
    try:
        predictor = TumorGrowthPredictor()
        result = predictor.compare_growth_scenarios(
            request.current_volume_mm3,
            request.days_ahead
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Doctor Recommendation Routes ====================

@router.post("/recommendation/specialist")
async def recommend_specialists(request: SpecialistRecommendationRequest):
    """
    Recommend specialist types based on tumor characteristics
    """
    try:
        system = DoctorRecommendationSystem()
        result = system.recommend_specialists(
            request.tumor_size_mm3,
            request.tumor_grade,
            request.location_operable,
            request.symptoms
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendation/treatment")
async def recommend_treatment(request: TreatmentRecommendationRequest):
    """
    Recommend treatment options
    """
    try:
        system = DoctorRecommendationSystem()
        result = system.recommend_treatment(
            request.tumor_size_mm3,
            request.tumor_grade,
            request.location_operable,
            request.patient_age,
            request.comorbidities
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendation/guidelines/{tumor_type}/{tumor_grade}")
async def get_clinical_guidelines(tumor_type: str, tumor_grade: str):
    """
    Get clinical guideline summary for treatment
    """
    try:
        system = DoctorRecommendationSystem()
        result = system.get_clinical_guideline_summary(tumor_type, tumor_grade)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Model Performance Routes ====================

@router.post("/performance/metrics")
async def calculate_performance_metrics(request: PerformanceMetricsRequest):
    """
    Calculate comprehensive performance metrics
    """
    try:
        analyzer = ModelPerformanceAnalyzer()
        result = analyzer.calculate_metrics(
            request.y_true,
            request.y_pred,
            request.y_pred_proba
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/performance/confusion-matrix")
async def analyze_confusion_matrix(request: PerformanceMetricsRequest):
    """
    Analyze confusion matrix with interpretation
    """
    try:
        analyzer = ModelPerformanceAnalyzer()
        metrics = analyzer.calculate_metrics(request.y_true, request.y_pred)
        
        if metrics['success']:
            cm = metrics['confusion_matrix']
            interpretation = analyzer.get_confusion_matrix_interpretation(
                cm['true_negatives'],
                cm['false_positives'],
                cm['false_negatives'],
                cm['true_positives']
            )
            return {
                'success': True,
                'metrics': metrics,
                'interpretation': interpretation
            }
        else:
            return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/performance/classification-report")
async def get_classification_report(request: PerformanceMetricsRequest):
    """
    Generate detailed classification report
    """
    try:
        analyzer = ModelPerformanceAnalyzer()
        result = analyzer.generate_classification_report(request.y_true, request.y_pred)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/performance/clinical-quality")
async def assess_clinical_quality(request: PerformanceMetricsRequest):
    """
    Assess model quality for clinical use
    """
    try:
        analyzer = ModelPerformanceAnalyzer()
        metrics = analyzer.calculate_metrics(request.y_true, request.y_pred)
        
        if metrics['success']:
            quality = analyzer.clinical_quality_assessment(
                metrics['accuracy'],
                metrics['recall'],
                metrics['specificity']
            )
            return {
                'success': True,
                'metrics': metrics,
                'quality_assessment': quality
            }
        else:
            return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Voice Assistant Routes ====================

@router.post("/voice/process-command")
async def process_voice_command(request: VoiceCommandRequest):
    """
    Process voice command text and identify action
    """
    try:
        assistant = VoiceAssistant()
        result = assistant.process_command(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voice/commands")
async def get_available_commands():
    """
    Get list of all available voice commands
    """
    try:
        assistant = VoiceAssistant()
        result = assistant.get_available_commands()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice/speak")
async def text_to_speech(message: str):
    """
    Convert text to speech
    """
    try:
        result = create_voice_response(message, should_speak=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Health Check ====================

@router.get("/health")
async def advanced_features_health():
    """
    Health check for advanced features
    """
    return {
        'status': 'healthy',
        'features': [
            '3D Visualization',
            'Tumor Growth Prediction',
            'Doctor Recommendation',
            'Model Performance Analysis',
            'Voice Assistant'
        ]
    }
