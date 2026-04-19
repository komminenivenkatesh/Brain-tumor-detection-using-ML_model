from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS
from app.routes_auth import router as auth_router
from app.routes_analysis import router as analysis_router
from app.routes_analytics import router as analytics_router
from app.routes_advanced import router as advanced_router

app = FastAPI(
    title="Brain Tumor Detection API",
    description="API for brain tumor detection using CNN with advanced features",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(analytics_router)
app.include_router(advanced_router)

@app.get("/")
async def root():
    return {
        "message": "Brain Tumor Detection API with Advanced Features",
        "version": "2.0.0",
        "status": "running",
        "new_features": [
            "3D Brain Visualization",
            "Tumor Growth Prediction",
            "Doctor Recommendation System",
            "Model Performance Analysis",
            "Voice Assistant (Speech Recognition & Text-to-Speech)"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/health/model")
async def model_health_check():
    from app.ml_model import get_model_status
    return get_model_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
