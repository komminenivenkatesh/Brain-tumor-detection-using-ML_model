from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    patient_id: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    contact_number: Optional[str] = None

class UserResponse(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    created_at: datetime
    profile: Optional[ProfileData] = None

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Analysis Models
class PredictionRequest(BaseModel):
    user_id: str

class PredictionResponse(BaseModel):
    analysis_id: str
    user_id: str
    filename: str
    saved_filename: str
    label: str
    probability: float
    is_tumor: bool
    segmentation_path: Optional[str] = None
    timestamp: datetime
    confidence: float
    predictions: dict = {"normal": 0, "tumor": 0}
    tumor_type: Optional[str] = None
    tumor_subtype: Optional[str] = None
    subtype_confidence: Optional[float] = None
    tumor_count: Optional[int] = None
    tumor_location: Optional[str] = None
    tumor_size_cm2: Optional[float] = None
    tumor_area_px: Optional[int] = None

class AnalysisHistory(BaseModel):
    user_id: str
    limit: int = 20

class AnalysisHistoryResponse(BaseModel):
    total: int
    analyses: list[PredictionResponse]
