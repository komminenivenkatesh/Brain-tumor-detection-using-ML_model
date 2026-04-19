import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "brain_tumor_db"

# Upload Configuration
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# Model Configuration
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
CLASSIFICATION_MODEL_JSON = "model.json"
CLASSIFICATION_WEIGHTS_H5 = "model_weights.h5"
SEGMENTATION_MODEL_JSON = "segmented_model.json"
SEGMENTATION_WEIGHTS_H5 = "segmented_weights.h5"
SUBTYPE_MODEL_JSON = "subtype_model.json"
SUBTYPE_WEIGHTS_H5 = "subtype_weights.h5"

# Approximate pixel spacing (cm per pixel) for size estimation.
# Update this based on your dataset's metadata for accurate measurements.
PIXEL_SPACING_CM = float(os.getenv("PIXEL_SPACING_CM", "0.1"))

# CORS Configuration
ALLOWED_ORIGINS = [
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:3000",
	"http://localhost:8080",
]
