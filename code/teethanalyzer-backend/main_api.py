# main_api.py
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from prediction import predict_disease
from pydantic import BaseModel
from chatbot import stream_response
from typing import List
import traceback
import logging

# Import LIME functionality
from lime_inference import get_lime_predictor

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store for LIME results (in production, use Redis or database)
lime_cache = {}

# ==================== FAST PREDICTION ENDPOINT (NO LIME) ====================

@app.post("/predict-fast")
async def predict_fast_endpoint(file: UploadFile = File(...)):
    """
    Fast prediction without LIME explanation
    Returns result immediately
    """
    try:
        logger.info(f"Fast prediction - File: {file.filename}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get predictor
        predictor = get_lime_predictor()
        
        # Quick prediction (no LIME)
        result = predictor.predict(image_bytes)
        
        logger.info(f"Fast prediction successful: {result['hybrid_prediction']}")
        
        return JSONResponse(content={
            "status": "success",
            "prediction": result
        })
    
    except Exception as e:
        logger.error(f"Error in predict_fast_endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Fast prediction failed: {str(e)}")

# ==================== LIME GENERATION ENDPOINT (SEPARATE) ====================

@app.post("/generate-lime")
async def generate_lime_endpoint(
    file: UploadFile = File(...),
    num_samples: int = 300
):
    """
    Generate LIME explanation separately (can be called after fast prediction)
    This takes longer but provides interpretability
    """
    try:
        if not 100 <= num_samples <= 1000:
            raise HTTPException(
                status_code=400, 
                detail="num_samples must be between 100 and 1000"
            )
        
        logger.info(f"LIME generation - File: {file.filename}, Samples: {num_samples}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get predictor
        predictor = get_lime_predictor()
        
        # Generate LIME explanation
        result = predictor.predict_with_lime(image_bytes, num_samples=num_samples)
        
        logger.info(f"LIME explanation generated successfully")
        
        return JSONResponse(content={
            "status": "success",
            "explanation_image": result['explanation_image'],
            "lime_statistics": result['lime_statistics'],
            "num_samples": result['num_samples']
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_lime_endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"LIME generation failed: {str(e)}")

# ==================== COMBINED ENDPOINT (EXISTING) ====================

@app.post("/predict-with-lime")
async def predict_with_lime_endpoint(
    file: UploadFile = File(...),
    num_samples: int = 300
):
    """
    Original endpoint: Prediction with LIME explanation (slow but complete)
    """
    try:
        if not 100 <= num_samples <= 1000:
            raise HTTPException(
                status_code=400, 
                detail="num_samples must be between 100 and 1000"
            )
        
        logger.info(f"LIME with Explanation - File: {file.filename}, Samples: {num_samples}")
        
        image_bytes = await file.read()
        predictor = get_lime_predictor()
        result = predictor.predict_with_lime(image_bytes, num_samples=num_samples)
        
        logger.info(f"LIME explanation generated for: {result['prediction']['hybrid_prediction']}")
        return JSONResponse(content={
            "status": "success",
            **result
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in predict_with_lime_endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"LIME explanation failed: {str(e)}")

# ==================== CHATBOT ENDPOINT ====================

class ChatRequest(BaseModel):
    prompt: str
    image: str | None = None

@app.post("/chat-stream")
async def chat_stream(request: ChatRequest):
    def event_generator():
        try:
            for chunk in stream_response(request.prompt, request.image):
                yield chunk
        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(event_generator(), media_type="text/plain")

# ==================== HEALTH CHECK ENDPOINTS ====================

@app.get("/lime/health")
async def lime_health_check():
    """Check if LIME model is loaded and ready"""
    try:
        predictor = get_lime_predictor()
        return {
            "status": "healthy",
            "model_loaded": True,
            "model_type": "LightGBM Hybrid",
            "num_classes": len(predictor.label_encoder.classes_),
            "disease_classes": predictor.metadata['disease_classes']
        }
    except Exception as e:
        logger.error(f"LIME health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"LIME model not available: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Dental Disease Detection API - Hybrid CNN + LightGBM",
        "endpoints": {
            "prediction": {
                "/predict-fast": "Fast prediction (CNN + LightGBM, no LIME) ⚡",
                "/generate-lime": "Generate LIME explanation separately 🔍",
                "/predict-with-lime": "Complete prediction with LIME (slower) 📊"
            },
            "chatbot": {
                "/chat-stream": "Streaming chatbot responses"
            },
            "health": {
                "/lime/health": "Check hybrid model status"
            }
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "dental-api", "model": "CNN + LightGBM Hybrid"}