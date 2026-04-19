"""Model Performance Metrics & Analysis"""
import numpy as np
from typing import Dict, List, Tuple
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, roc_curve
import json


class ModelPerformanceAnalyzer:
    """Calculate and analyze model performance metrics"""
    
    @staticmethod
    def calculate_metrics(
        y_true: List[int],
        y_pred: List[int],
        y_pred_proba: List[float] = None
    ) -> Dict:
        """
        Calculate comprehensive performance metrics
        
        Args:
            y_true: Ground truth labels (0 or 1)
            y_pred: Predicted labels (0 or 1)
            y_pred_proba: Predicted probabilities (0-1)
            
        Returns:
            Dictionary with all metrics
        """
        try:
            y_true = np.array(y_true)
            y_pred = np.array(y_pred)
            
            # Confusion Matrix
            tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
            
            # Basic metrics
            accuracy = (tp + tn) / (tp + tn + fp + fn)
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
            f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            # Matthews Correlation Coefficient
            denominator = np.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))
            mcc = ((tp * tn) - (fp * fn)) / denominator if denominator > 0 else 0
            
            # ROC-AUC if probabilities provided
            roc_auc = None
            if y_pred_proba is not None:
                try:
                    y_pred_proba = np.array(y_pred_proba)
                    roc_auc = float(roc_auc_score(y_true, y_pred_proba))
                except:
                    roc_auc = None
            
            # Sensitivity and Specificity aliases
            sensitivity = recall  # True positive rate
            
            return {
                'success': True,
                'accuracy': round(float(accuracy), 4),
                'precision': round(float(precision), 4),
                'recall': round(float(recall), 4),
                'sensitivity': round(float(sensitivity), 4),
                'specificity': round(float(specificity), 4),
                'f1_score': round(float(f1_score), 4),
                'mcc': round(float(mcc), 4),
                'roc_auc': round(roc_auc, 4) if roc_auc else None,
                'confusion_matrix': {
                    'true_negatives': int(tn),
                    'false_positives': int(fp),
                    'false_negatives': int(fn),
                    'true_positives': int(tp)
                },
                'sample_counts': {
                    'total_samples': int(len(y_true)),
                    'positive_samples': int(np.sum(y_true)),
                    'negative_samples': int(len(y_true) - np.sum(y_true))
                }
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_confusion_matrix_interpretation(
        tn: int, fp: int, fn: int, tp: int
    ) -> Dict:
        """
        Provide interpretation of confusion matrix results
        """
        total = tn + fp + fn + tp
        
        # Calculate error rates
        false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
        false_negative_rate = fn / (fn + tp) if (fn + tp) > 0 else 0
        
        # Interpret results
        interpretation = {
            'true_positives': {
                'count': tp,
                'percentage': round(tp / total * 100, 2),
                'meaning': 'Tumors correctly identified as tumors'
            },
            'true_negatives': {
                'count': tn,
                'percentage': round(tn / total * 100, 2),
                'meaning': 'Non-tumors correctly identified as non-tumors'
            },
            'false_positives': {
                'count': fp,
                'percentage': round(fp / total * 100, 2),
                'meaning': 'Non-tumors incorrectly identified as tumors',
                'clinical_impact': 'May cause unnecessary anxiety and further testing'
            },
            'false_negatives': {
                'count': fn,
                'percentage': round(fn / total * 100, 2),
                'meaning': 'Tumors incorrectly identified as non-tumors',
                'clinical_impact': 'CRITICAL - Missed diagnoses, delayed treatment'
            },
            'error_rates': {
                'false_positive_rate': round(false_positive_rate, 4),
                'false_negative_rate': round(false_negative_rate, 4)
            }
        }
        
        return interpretation
    
    @staticmethod
    def generate_classification_report(
        y_true: List[int],
        y_pred: List[int]
    ) -> Dict:
        """
        Generate detailed classification report
        """
        try:
            report = classification_report(
                y_true, y_pred,
                target_names=['No Tumor', 'Tumor'],
                output_dict=True
            )
            
            return {
                'success': True,
                'report': report,
                'summary': {
                    'no_tumor': {
                        'precision': round(report['No Tumor']['precision'], 4),
                        'recall': round(report['No Tumor']['recall'], 4),
                        'f1_score': round(report['No Tumor']['f1-score'], 4),
                        'support': int(report['No Tumor']['support'])
                    },
                    'tumor': {
                        'precision': round(report['Tumor']['precision'], 4),
                        'recall': round(report['Tumor']['recall'], 4),
                        'f1_score': round(report['Tumor']['f1-score'], 4),
                        'support': int(report['Tumor']['support'])
                    },
                    'weighted_avg': {
                        'precision': round(report['weighted avg']['precision'], 4),
                        'recall': round(report['weighted avg']['recall'], 4),
                        'f1_score': round(report['weighted avg']['f1-score'], 4)
                    }
                }
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def clinical_quality_assessment(accuracy: float, sensitivity: float, specificity: float) -> Dict:
        """
        Assess model quality for clinical use
        """
        # Clinical thresholds
        quality_assessment = {
            'clinical_readiness': 'READY' if accuracy > 0.95 and sensitivity > 0.90 else 'NEEDS IMPROVEMENT',
            'accuracy_assessment': {
                'score': round(accuracy, 4),
                'status': 'EXCELLENT' if accuracy > 0.95 else 'GOOD' if accuracy > 0.90 else 'ACCEPTABLE' if accuracy > 0.85 else 'POOR',
                'threshold': 0.95
            },
            'sensitivity_assessment': {
                'score': round(sensitivity, 4),
                'status': 'EXCELLENT' if sensitivity > 0.95 else 'GOOD' if sensitivity > 0.90 else 'ACCEPTABLE' if sensitivity > 0.85 else 'POOR',
                'threshold': 0.90,
                'clinical_importance': 'CRITICAL - Lower sensitivity increases missed diagnoses'
            },
            'specificity_assessment': {
                'score': round(specificity, 4),
                'status': 'EXCELLENT' if specificity > 0.95 else 'GOOD' if specificity > 0.90 else 'ACCEPTABLE' if specificity > 0.80 else 'POOR',
                'threshold': 0.85,
                'clinical_importance': 'Important - Lower specificity increases false alarms'
            },
            'recommendations': []
        }
        
        # Generate recommendations
        if sensitivity < 0.90:
            quality_assessment['recommendations'].append('URGENT: Improve model sensitivity to reduce missed diagnoses')
        if accuracy < 0.90:
            quality_assessment['recommendations'].append('Collect more training data and retrain model')
        if specificity < 0.80:
            quality_assessment['recommendations'].append('Improve model specificity to reduce false alarms')
        
        if not quality_assessment['recommendations']:
            quality_assessment['recommendations'].append('Model performance is acceptable for clinical use with proper validation')
        
        return quality_assessment
