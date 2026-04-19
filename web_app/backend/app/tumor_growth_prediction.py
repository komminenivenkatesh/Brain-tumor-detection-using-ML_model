"""Tumor Growth Prediction Module"""
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import json


class TumorGrowthPredictor:
    """Predict tumor growth trajectory based on current size and analysis"""
    
    def __init__(self):
        # Growth rate constants (mm³/day) - can be adjusted based on medical literature
        self.growth_rates = {
            'slow': 0.5,      # Low-grade tumors
            'moderate': 2.0,  # Medium-grade tumors
            'aggressive': 5.0  # High-grade tumors
        }
    
    def predict_growth(
        self,
        current_volume_mm3: float,
        tumor_grade: str = 'moderate',
        days_ahead: int = 90
    ) -> Dict:
        """
        Predict tumor growth over time
        
        Args:
            current_volume_mm3: Current tumor volume in mm³
            tumor_grade: 'slow', 'moderate', or 'aggressive'
            days_ahead: Number of days to predict (default 90)
            
        Returns:
            Dictionary with growth predictions
        """
        try:
            growth_rate = self.growth_rates.get(tumor_grade, 2.0)
            
            # Generate predictions
            days = np.arange(0, days_ahead + 1, 7)  # Weekly predictions
            volumes = current_volume_mm3 + (growth_rate * days)
            
            # Calculate doubling time
            if growth_rate > 0:
                doubling_time = np.log(2) / (growth_rate / current_volume_mm3) if current_volume_mm3 > 0 else np.inf
            else:
                doubling_time = np.inf
            
            predictions = []
            base_date = datetime.now()
            
            for day, volume in zip(days, volumes):
                date = base_date + timedelta(days=int(day))
                predictions.append({
                    'days': int(day),
                    'date': date.strftime('%Y-%m-%d'),
                    'predicted_volume_mm3': round(float(volume), 2),
                    'volume_increase_percent': round(float((volume - current_volume_mm3) / current_volume_mm3 * 100), 2)
                })
            
            # Risk assessment
            final_volume = volumes[-1]
            volume_increase_percent = (final_volume - current_volume_mm3) / current_volume_mm3 * 100
            
            if volume_increase_percent > 50:
                risk_level = 'HIGH'
                recommendation = 'Immediate intervention recommended'
            elif volume_increase_percent > 25:
                risk_level = 'MODERATE'
                recommendation = 'Close monitoring and treatment consideration recommended'
            else:
                risk_level = 'LOW'
                recommendation = 'Continue regular monitoring'
            
            return {
                'success': True,
                'current_volume_mm3': current_volume_mm3,
                'tumor_grade': tumor_grade,
                'growth_rate_mm3_per_day': growth_rate,
                'doubling_time_days': round(doubling_time, 2),
                'predictions': predictions,
                'risk_assessment': {
                    'level': risk_level,
                    'volume_increase_percent': round(volume_increase_percent, 2),
                    'final_volume_mm3': round(float(final_volume), 2),
                    'recommendation': recommendation
                }
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def compare_growth_scenarios(
        self,
        current_volume_mm3: float,
        days_ahead: int = 90
    ) -> Dict:
        """
        Compare growth predictions across different tumor grades
        """
        try:
            scenarios = {}
            
            for grade in ['slow', 'moderate', 'aggressive']:
                result = self.predict_growth(current_volume_mm3, grade, days_ahead)
                if result['success']:
                    scenarios[grade] = {
                        'growth_rate': result['growth_rate_mm3_per_day'],
                        'doubling_time': result['doubling_time_days'],
                        'final_volume': result['risk_assessment']['final_volume_mm3'],
                        'risk_level': result['risk_assessment']['level']
                    }
            
            return {
                'success': True,
                'current_volume_mm3': current_volume_mm3,
                'scenarios': scenarios
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
