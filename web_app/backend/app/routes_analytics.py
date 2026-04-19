from fastapi import APIRouter, Depends, HTTPException, status
from app.routes_auth import get_current_user_id
from app.database import analysis_collection
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_analytics_dashboard(
    days: int = 30,
    user_id: str = Depends(get_current_user_id)
):
    """Get comprehensive analytics dashboard data"""
    try:
        # Get user's analyses
        analyses = list(analysis_collection.find(
            {"user_id": ObjectId(user_id)}
        ).sort("timestamp", -1))
        
        if not analyses:
            return {
                "total_analyses": 0,
                "tumor_detected": 0,
                "normal_cases": 0,
                "average_confidence": 0,
                "detection_rate": 0,
                "confidence_distribution": [],
                "daily_analysis": [],
                "monthly_summary": []
            }
        
        # Calculate basic stats
        total = len(analyses)
        tumor_count = sum(1 for a in analyses if a.get("is_tumor"))
        normal_count = total - tumor_count
        avg_confidence = sum(a.get("confidence", 0) for a in analyses) / total if total > 0 else 0
        detection_rate = (tumor_count / total * 100) if total > 0 else 0
        
        # Confidence distribution
        confidence_dist = {
            "0-20%": 0,
            "20-40%": 0,
            "40-60%": 0,
            "60-80%": 0,
            "80-100%": 0
        }
        
        for analysis in analyses:
            conf = analysis.get("confidence", 0)
            if conf < 0.2:
                confidence_dist["0-20%"] += 1
            elif conf < 0.4:
                confidence_dist["20-40%"] += 1
            elif conf < 0.6:
                confidence_dist["40-60%"] += 1
            elif conf < 0.8:
                confidence_dist["60-80%"] += 1
            else:
                confidence_dist["80-100%"] += 1
        
        # Daily analysis for last 30 days
        daily_analysis = {}
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=i)).date()
            daily_analysis[str(date)] = {"date": str(date), "total": 0, "tumor": 0, "normal": 0}
        
        for analysis in analyses:
            date = analysis.get("timestamp")
            if date:
                date_str = str(date.date()) if hasattr(date, 'date') else str(date)
                if date_str in daily_analysis:
                    daily_analysis[date_str]["total"] += 1
                    if analysis.get("is_tumor"):
                        daily_analysis[date_str]["tumor"] += 1
                    else:
                        daily_analysis[date_str]["normal"] += 1
        
        # Monthly summary
        monthly_summary = {}
        for analysis in analyses:
            date = analysis.get("timestamp")
            if date:
                month_key = date.strftime("%b %Y") if hasattr(date, 'strftime') else str(date)[:7]
                if month_key not in monthly_summary:
                    monthly_summary[month_key] = {"month": month_key, "count": 0}
                monthly_summary[month_key]["count"] += 1
        
        return {
            "total_analyses": total,
            "tumor_detected": tumor_count,
            "normal_cases": normal_count,
            "average_confidence": round(avg_confidence * 100, 2),
            "detection_rate": round(detection_rate, 2),
            "confidence_distribution": [
                {"range": k, "count": v} for k, v in confidence_dist.items() if v > 0
            ],
            "daily_analysis": sorted(daily_analysis.values(), key=lambda x: x["date"]),
            "monthly_summary": sorted(monthly_summary.values(), key=lambda x: x["month"])
        }
    
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )

@router.get("/comparison")
async def get_comparison_metrics(
    user_id: str = Depends(get_current_user_id)
):
    """Compare current metrics with historical data"""
    try:
        analyses = list(analysis_collection.find(
            {"user_id": ObjectId(user_id)}
        ).sort("timestamp", -1))
        
        if len(analyses) < 2:
            return {"message": "Need at least 2 analyses for comparison"}
        
        # Last analysis
        last_analysis = analyses[0]
        
        # Previous average (excluding last)
        previous_analyses = analyses[1:10]  # Last 9 before current
        prev_avg_confidence = (
            sum(a.get("confidence", 0) for a in previous_analyses) / len(previous_analyses)
            if previous_analyses else 0
        )
        
        current_confidence = last_analysis.get("confidence", 0)
        improvement = ((current_confidence - prev_avg_confidence) / prev_avg_confidence * 100 
                      if prev_avg_confidence > 0 else 0)
        
        return {
            "last_analysis": {
                "confidence": last_analysis.get("confidence"),
                "is_tumor": last_analysis.get("is_tumor"),
                "timestamp": str(last_analysis.get("timestamp"))
            },
            "previous_average": round(prev_avg_confidence * 100, 2),
            "improvement_percentage": round(improvement, 2),
            "trend": "improving" if improvement > 0 else "declining" if improvement < 0 else "stable"
        }
    
    except Exception as e:
        logger.error(f"Error fetching comparison metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch comparison metrics: {str(e)}"
        )
