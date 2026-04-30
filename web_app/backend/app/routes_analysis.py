from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from app.routes_auth import get_current_user_id
from app.database import analysis_collection
from app.config import UPLOAD_DIR
from app.models import PredictionResponse, AnalysisHistoryResponse
from bson.objectid import ObjectId
from datetime import datetime
import os
import uuid
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_tumor(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload image and get tumor prediction"""
    try:
        # Lazy import to keep API startup fast; TensorFlow loads on first prediction call.
        from app.ml_model import get_tumor_model

        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        saved_filename = f"{file_id}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, saved_filename)
        
        # Save uploaded file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Get model and run prediction
        model = get_tumor_model()
        analysis_result = model.analyze_image(file_path, file_path)
        
        # Prepare response
        segmentation_path = None
        if analysis_result.get('segmentation_path'):
            segmentation_path = os.path.basename(analysis_result['segmentation_path'])
        
        # Store in MongoDB
        db_record = {
            "user_id": ObjectId(user_id),
            "filename": file.filename,
            "saved_filename": saved_filename,
            "label": analysis_result["label"],
            "is_tumor": analysis_result["is_tumor"],
            "confidence": analysis_result["confidence"],
            "predictions": analysis_result["predictions"],
            "segmentation_path": segmentation_path,
            "tumor_type": analysis_result.get("tumor_type"),
            "tumor_subtype": analysis_result.get("tumor_subtype"),
            "subtype_confidence": analysis_result.get("subtype_confidence"),
            "tumor_count": analysis_result.get("tumor_count"),
            "tumor_location": analysis_result.get("tumor_location"),
            "tumor_size_cm2": analysis_result.get("tumor_size_cm2"),
            "tumor_area_px": analysis_result.get("tumor_area_px"),
            "timestamp": datetime.utcnow()
        }
        
        result = analysis_collection.insert_one(db_record)
        analysis_id = str(result.inserted_id)
        
        response = PredictionResponse(
            analysis_id=analysis_id,
            user_id=user_id,
            filename=file.filename,
            saved_filename=saved_filename,
            label=analysis_result["label"],
            probability=analysis_result["predictions"].get("tumor", 0),
            is_tumor=analysis_result["is_tumor"],
            segmentation_path=segmentation_path,
            timestamp=db_record["timestamp"],
            confidence=analysis_result["confidence"],
            predictions=analysis_result["predictions"],
            tumor_type=analysis_result.get("tumor_type"),
            tumor_subtype=analysis_result.get("tumor_subtype"),
            subtype_confidence=analysis_result.get("subtype_confidence"),
            tumor_count=analysis_result.get("tumor_count"),
            tumor_location=analysis_result.get("tumor_location"),
            tumor_size_cm2=analysis_result.get("tumor_size_cm2"),
            tumor_area_px=analysis_result.get("tumor_area_px")
        )
        logger.info(f"✅ Predict response: saved_filename={response.saved_filename}")
        return response
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Prediction failed: {error_msg}")
        
        # Check if this is a TensorFlow DLL error or classification model not loaded
        if "DLL load failed" in error_msg or "Application Control policy has blocked" in error_msg or "Classification model not loaded" in error_msg:
            # Import here to check if TensorFlow has a DLL error
            try:
                from app.ml_model import _tensorflow_error
                if _tensorflow_error and ("DLL load failed" in _tensorflow_error or "Application Control policy" in _tensorflow_error):
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="TensorFlow service unavailable: System security policy is blocking machine learning model. Please contact your IT administrator."
                    )
            except:
                pass
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="TensorFlow service unavailable: System security policy is blocking machine learning model. Please contact your IT administrator."
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {error_msg}"
        )

@router.get("/history", response_model=AnalysisHistoryResponse)
async def get_analysis_history(
    limit: int = 20,
    user_id: str = Depends(get_current_user_id)
):
    """Get analysis history for current user"""
    try:
        # Fetch analyses
        analyses = list(analysis_collection.find(
            {"user_id": ObjectId(user_id)}
        ).sort("timestamp", -1).limit(limit))
        
        total = analysis_collection.count_documents({"user_id": ObjectId(user_id)})
        
        # Convert to response model
        result_list = []
        for analysis in analyses:
            result_list.append(PredictionResponse(
                analysis_id=str(analysis["_id"]),
                user_id=user_id,
                filename=analysis["filename"],
                saved_filename=analysis["saved_filename"],
                label=analysis["label"],
                probability=analysis["predictions"].get("tumor", 0),
                is_tumor=analysis["is_tumor"],
                segmentation_path=analysis.get("segmentation_path"),
                timestamp=analysis["timestamp"],
                confidence=analysis["confidence"],
                predictions=analysis["predictions"],
                tumor_type=analysis.get("tumor_type"),
                tumor_subtype=analysis.get("tumor_subtype"),
                subtype_confidence=analysis.get("subtype_confidence"),
                tumor_count=analysis.get("tumor_count"),
                tumor_location=analysis.get("tumor_location"),
                tumor_size_cm2=analysis.get("tumor_size_cm2"),
                tumor_area_px=analysis.get("tumor_area_px")
            ))
        
        return AnalysisHistoryResponse(
            total=total,
            analyses=result_list
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )

@router.get("/analysis/{analysis_id}")
async def get_analysis_details(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get specific analysis details"""
    try:
        analysis = analysis_collection.find_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        return {
            "analysis_id": str(analysis["_id"]),
            "filename": analysis["filename"],
            "saved_filename": analysis["saved_filename"],
            "label": analysis["label"],
            "is_tumor": analysis["is_tumor"],
            "confidence": analysis["confidence"],
            "predictions": analysis["predictions"],
            "timestamp": analysis["timestamp"],
            "segmentation_path": analysis.get("segmentation_path"),
            "tumor_type": analysis.get("tumor_type"),
            "tumor_subtype": analysis.get("tumor_subtype"),
            "subtype_confidence": analysis.get("subtype_confidence"),
            "tumor_count": analysis.get("tumor_count"),
            "tumor_location": analysis.get("tumor_location"),
            "tumor_size_cm2": analysis.get("tumor_size_cm2"),
            "tumor_area_px": analysis.get("tumor_area_px")
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analysis: {str(e)}"
        )
@router.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a specific analysis"""
    try:
        # Verify ownership and get analysis
        analysis = analysis_collection.find_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Delete uploaded file
        try:
            file_path = os.path.join(UPLOAD_DIR, analysis.get("saved_filename", ""))
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to delete file: {str(e)}")
        
        # Delete segmentation file if exists
        try:
            if analysis.get("segmentation_path"):
                seg_path = os.path.join(UPLOAD_DIR, os.path.basename(analysis["segmentation_path"]))
                if os.path.exists(seg_path):
                    os.remove(seg_path)
        except Exception as e:
            logger.warning(f"Failed to delete segmentation: {str(e)}")
        
        # Delete from database
        result = analysis_collection.delete_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        return {"message": "Analysis deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete analysis: {str(e)}"
        )

@router.delete("/history")
async def clear_all_history(user_id: str = Depends(get_current_user_id)):
    """Delete all analyses for current user"""
    try:
        # Get all analyses to delete files
        analyses = list(analysis_collection.find({"user_id": ObjectId(user_id)}))
        
        # Delete all files
        for analysis in analyses:
            try:
                if analysis.get("saved_filename"):
                    file_path = os.path.join(UPLOAD_DIR, analysis["saved_filename"])
                    if os.path.exists(file_path):
                        os.remove(file_path)
            except Exception as e:
                logger.warning(f"Failed to delete file: {str(e)}")
            
            try:
                if analysis.get("segmentation_path"):
                    seg_path = os.path.join(UPLOAD_DIR, os.path.basename(analysis["segmentation_path"]))
                    if os.path.exists(seg_path):
                        os.remove(seg_path)
            except Exception as e:
                logger.warning(f"Failed to delete segmentation: {str(e)}")
        
        # Delete all analyses from database
        result = analysis_collection.delete_many({"user_id": ObjectId(user_id)})
        
        return {
            "message": f"Deleted {result.deleted_count} analyses",
            "count": result.deleted_count
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )
@router.get("/image/{filename}")
async def get_image(filename: str):
    """Download image or segmentation file - Public endpoint (filenames are UUIDs)"""
    try:
        # Security: Only allow UUID-like filenames to prevent directory traversal
        # Reject any path separators or suspicious patterns
        if "/" in filename or "\\" in filename or ".." in filename:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid filename"
            )
        
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Verify file exists
        if not os.path.exists(file_path):
            logger.warning(f"Image not found: {filename}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Additional security: Ensure we're only serving files from UPLOAD_DIR
        real_path = os.path.realpath(file_path)
        real_upload_dir = os.path.realpath(UPLOAD_DIR)
        if not real_path.startswith(real_upload_dir):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        logger.info(f"✅ Serving image: {filename}")
        return FileResponse(file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve image {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve file: {str(e)}"
        )

@router.get("/report/{analysis_id}/pdf")
async def download_report(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Download analysis report as PDF"""
    try:
        from app.pdf_generator import ReportGenerator
        from app.database import users_collection
        
        # Fetch analysis
        analysis = analysis_collection.find_one({
            "_id": ObjectId(analysis_id),
            "user_id": ObjectId(user_id)
        })
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Fetch user profile for patient info
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        patient_name = user.get("full_name", "Patient") if user else "Patient"
        patient_email = user.get("email", "N/A") if user else "N/A"
        patient_id = "N/A"
        
        # Get profile data if available
        if user and user.get("profile"):
            profile = user["profile"]
            # Use profile name/email if provided, otherwise use user account defaults
            if profile.get("name"):
                patient_name = profile["name"]
            if profile.get("email"):
                patient_email = profile["email"]
            if profile.get("patient_id"):
                patient_id = profile["patient_id"]
        
        # Generate PDF with patient info
        generator = ReportGenerator()
        pdf_buffer = generator.generate_pdf(analysis, patient_name, patient_id, patient_email)
        
        # Return as streaming response
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=analysis_report_{analysis_id}.pdf"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )
