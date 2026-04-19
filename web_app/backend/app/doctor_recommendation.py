"""Doctor Recommendation & Treatment System"""
from typing import Dict, List
import json


class DoctorRecommendationSystem:
    """Recommend specialist types and treatment options based on tumor characteristics"""
    
    def __init__(self):
        self.specialist_map = {
            'neurologist': {
                'title': 'Neurologist',
                'expertise': 'Brain disorder diagnosis and treatment',
                'responsibilities': [
                    'Diagnose neurological disorders',
                    'Manage tumor-related neurological symptoms',
                    'Monitor tumor progression',
                    'Coordination with oncology team'
                ],
                'priority_conditions': ['Low-grade glioma', 'Meningioma', 'Early-stage detection']
            },
            'neuro-oncologist': {
                'title': 'Neuro-Oncologist',
                'expertise': 'Specialized cancer treatment of brain and nervous system',
                'responsibilities': [
                    'Chemotherapy administration',
                    'Treatment planning',
                    'Clinical trial evaluation',
                    'Symptom management'
                ],
                'priority_conditions': ['High-grade glioma', 'Metastatic tumors', 'Recurrent tumors']
            },
            'neurosurgeon': {
                'title': 'Neurosurgeon',
                'expertise': 'Surgical intervention for brain tumors',
                'responsibilities': [
                    'Surgical resection planning',
                    'Biopsy procedures',
                    'Emergency interventions',
                    'Post-operative monitoring'
                ],
                'priority_conditions': ['Operable tumors', 'Large tumors', 'Tumor causing edema']
            },
            'radiation-oncologist': {
                'title': 'Radiation Oncologist',
                'expertise': 'Radiation therapy for cancer treatment',
                'responsibilities': [
                    'Radiation therapy planning',
                    'Stereotactic radiosurgery',
                    'Whole brain radiation',
                    'Side effect management'
                ],
                'priority_conditions': ['Multiple lesions', 'Inoperable tumors', 'Post-operative radiation']
            }
        }
        
        self.treatment_options = {
            'surveillance': {
                'name': 'Active Surveillance',
                'description': 'Regular monitoring without immediate treatment',
                'use_cases': ['Small tumors', 'Slow-growing tumors', 'Asymptomatic patients'],
                'duration': '3-6 months between scans',
                'side_effects': 'Psychological stress from monitoring'
            },
            'chemotherapy': {
                'name': 'Chemotherapy',
                'description': 'Drug-based cancer treatment',
                'use_cases': ['High-grade gliomas', 'Metastatic tumors', 'Recurrent tumors'],
                'duration': 'Usually 6-12 cycles',
                'side_effects': ['Nausea', 'Hair loss', 'Fatigue', 'Infection risk']
            },
            'radiation': {
                'name': 'Radiation Therapy',
                'description': 'High-energy rays to kill cancer cells',
                'use_cases': ['Inoperable tumors', 'Residual disease', 'Metastases'],
                'duration': '4-6 weeks (daily treatment)',
                'side_effects': ['Fatigue', 'Hair loss', 'Skin irritation', 'Cognitive changes']
            },
            'surgery': {
                'name': 'Surgical Resection',
                'description': 'Surgical removal of tumor',
                'use_cases': ['Accessible tumors', 'Large tumors', 'Emergency decompression'],
                'duration': 'Single procedure + 4-6 weeks recovery',
                'side_effects': ['Neurological deficits', 'Infection', 'Bleeding']
            },
            'combined': {
                'name': 'Combined Multimodal Treatment',
                'description': 'Surgery + Chemotherapy + Radiation',
                'use_cases': ['High-grade gliomas', 'Large tumors', 'Aggressive tumors'],
                'duration': '6-12 months total',
                'side_effects': 'Cumulative effects of all modalities'
            }
        }
    
    def recommend_specialists(
        self,
        tumor_size_mm3: float,
        tumor_grade: str,
        location_operable: bool,
        symptoms: List[str]
    ) -> Dict:
        """
        Recommend specialist types based on tumor characteristics
        """
        try:
            recommendations = []
            
            # Base priority on tumor grade
            if tumor_grade in ['high', 'aggressive', 'grade_4']:
                # High-grade tumors need comprehensive team
                specialist_order = [
                    'neuro-oncologist',
                    'neurosurgeon',
                    'radiation-oncologist',
                    'neurologist'
                ]
            elif location_operable and tumor_size_mm3 > 1000:
                # Large operable tumors need surgery first
                specialist_order = [
                    'neurosurgeon',
                    'neuro-oncologist',
                    'radiation-oncologist',
                    'neurologist'
                ]
            else:
                # Standard approach
                specialist_order = [
                    'neurologist',
                    'neuro-oncologist',
                    'neurosurgeon',
                    'radiation-oncologist'
                ]
            
            # Build recommendations
            for priority, specialist_key in enumerate(specialist_order, 1):
                specialist = self.specialist_map[specialist_key]
                recommendations.append({
                    'priority': priority,
                    'specialist': specialist['title'],
                    'expertise': specialist['expertise'],
                    'responsibilities': specialist['responsibilities']
                })
            
            return {
                'success': True,
                'recommendations': recommendations,
                'recommended_team_composition': [r['specialist'] for r in recommendations]
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def recommend_treatment(
        self,
        tumor_size_mm3: float,
        tumor_grade: str,
        location_operable: bool,
        patient_age: int,
        comorbidities: List[str]
    ) -> Dict:
        """
        Recommend treatment options
        """
        try:
            recommended_treatments = []
            
            # Determine treatment strategy
            if tumor_grade in ['low', 'slow']:
                if tumor_size_mm3 < 500:
                    primary = 'surveillance'
                    secondary = ['radiation']
                else:
                    primary = 'surgery'
                    secondary = ['surveillance', 'radiation']
            
            elif tumor_grade in ['medium', 'moderate']:
                if location_operable:
                    primary = 'combined'
                    secondary = ['surgery', 'chemotherapy']
                else:
                    primary = 'combined'
                    secondary = ['radiation', 'chemotherapy']
            
            else:  # High-grade/aggressive
                primary = 'combined'
                secondary = ['surgery', 'chemotherapy', 'radiation']
            
            # Build treatment plan
            treatments = [primary] + secondary
            
            for idx, treatment_key in enumerate(treatments):
                if treatment_key in self.treatment_options:
                    treatment = self.treatment_options[treatment_key]
                    recommended_treatments.append({
                        'sequence': idx + 1,
                        'treatment': treatment['name'],
                        'description': treatment['description'],
                        'use_cases': treatment['use_cases'],
                        'expected_duration': treatment['duration'],
                        'possible_side_effects': treatment['side_effects'] if isinstance(treatment['side_effects'], list) else [treatment['side_effects']]
                    })
            
            # Age consideration
            age_consideration = ''
            if patient_age > 65:
                age_consideration = 'Advanced age: Consider reduced intensity treatments and frequent monitoring'
            
            # Comorbidity warning
            comorbidity_warning = ''
            if comorbidities:
                comorbidity_warning = f'Patient has {len(comorbidities)} comorbidities: {", ".join(comorbidities)}. Adjust treatment intensity accordingly.'
            
            return {
                'success': True,
                'recommended_treatments': recommended_treatments,
                'primary_recommendation': self.treatment_options[primary],
                'age_consideration': age_consideration,
                'comorbidity_considerations': comorbidity_warning,
                'notes': 'All recommendations should be discussed with the patient and medical team. Individual factors may warrant modifications.'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_clinical_guideline_summary(self, tumor_type: str, tumor_grade: str) -> Dict:
        """
        Get summary of clinical guidelines for treatment
        """
        guidelines = {
            'glioma': {
                'low': 'Watchful waiting or surgery; consider radiation for residual disease',
                'medium': 'Surgery + chemotherapy + radiation in most cases',
                'high': 'Maximum safe surgical resection + concurrent radiation + chemotherapy'
            },
            'meningioma': {
                'low': 'Surgery if symptomatic; observation if asymptomatic',
                'medium': 'Surgery + adjuvant radiation if high-risk features',
                'high': 'Aggressive surgery + radiation + consider chemotherapy'
            },
            'metastasis': {
                'any': 'SRS (Stereotactic Radiosurgery) or WBRT (Whole Brain Radiation) depending on number and size of lesions'
            }
        }
        
        guideline = guidelines.get(tumor_type, {}).get(tumor_grade, 'Individualized treatment plan recommended')
        
        return {
            'tumor_type': tumor_type,
            'tumor_grade': tumor_grade,
            'clinical_guideline': guideline
        }
