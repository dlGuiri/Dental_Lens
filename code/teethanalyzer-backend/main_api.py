# main_api.py - Updated for PyTorch Autoencoder
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from prediction import predict_disease
from pydantic import BaseModel
from chatbot import stream_response
from typing import List
import traceback
import logging
import numpy as np
from PIL import Image
import io
import torch
import torch.nn as nn
from torchvision import transforms

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

# ==================== DEFINE AUTOENCODER ARCHITECTURE ====================
# You need to define the same architecture as your training code
class SimpleAutoencoder(nn.Module):
    def __init__(self):
        super(SimpleAutoencoder, self).__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 16, 3, stride=2, padding=1),  # [B, 16, 112, 112]
            nn.ReLU(),
            nn.Conv2d(16, 32, 3, stride=2, padding=1), # [B, 32, 56, 56]
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1), # [B, 64, 28, 28]
            nn.ReLU(),
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1), # [B, 32, 56, 56]
            nn.ReLU(),
            nn.ConvTranspose2d(32, 16, 3, stride=2, padding=1, output_padding=1), # [B, 16, 112, 112]
            nn.ReLU(),
            nn.ConvTranspose2d(16, 3, 3, stride=2, padding=1, output_padding=1),  # [B, 3, 224, 224]
            nn.Sigmoid(),  # Output in [0,1]
        )
    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

# ==================== LOAD PYTORCH AUTOENCODER ====================
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Initialize model
    autoencoder = SimpleAutoencoder().to(device)
    
    # Load weights
    autoencoder.load_state_dict(torch.load('hybrid_models/autoencoder_healthy.pth', map_location=device))
    autoencoder.eval()  # Set to evaluation mode
    
    logger.info("PyTorch Autoencoder model loaded successfully")
    AUTOENCODER_LOADED = True
except Exception as e:
    logger.error(f"Failed to load autoencoder: {str(e)}")
    autoencoder = None
    device = None
    AUTOENCODER_LOADED = False

# Autoencoder threshold (tune this based on your validation results)
RECONSTRUCTION_ERROR_THRESHOLD = 0.05  # Adjust based on your model's performance

# Image preprocessing for PyTorch
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),  # Converts to [0, 1] and changes to CHW format
])

# Store for LIME results
lime_cache = {}

# ==================== AUTOENCODER VALIDATION ENDPOINT ====================

def preprocess_image_for_autoencoder(image_bytes):
    """Preprocess image for PyTorch autoencoder"""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img_tensor = transform(img)  # Shape: (3, 224, 224)
    img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension: (1, 3, 224, 224)
    return img_tensor

@app.post("/validate-autoencoder")
async def validate_autoencoder(file: UploadFile = File(...)):
    """
    STEP 0: Validate if image shows diseased teeth using autoencoder
    
    Logic:
    - Healthy teeth: Low reconstruction error (autoencoder trained on healthy)
    - Diseased teeth: High reconstruction error (autoencoder fails to reconstruct)
    
    Returns:
        - is_valid: True if diseased (proceed to classification), False if healthy
        - reconstruction_error: MSE value
        - confidence: Confidence level
        - status: 'diseased' or 'healthy'
    """
    try:
        if not AUTOENCODER_LOADED:
            raise HTTPException(
                status_code=503, 
                detail="Autoencoder model not loaded"
            )
        
        logger.info(f"Autoencoder validation - File: {file.filename}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Preprocess image
        img_tensor = preprocess_image_for_autoencoder(image_bytes)
        img_tensor = img_tensor.to(device)
        
        # Get reconstruction from autoencoder
        with torch.no_grad():
            reconstructed = autoencoder(img_tensor)
        
        # Calculate reconstruction error (MSE)
        mse = torch.nn.functional.mse_loss(img_tensor, reconstructed)
        reconstruction_error = float(mse.item())
        
        # Determine if image is valid (diseased) or invalid (healthy)
        # High error = diseased (autoencoder can't reconstruct anomalies well)
        # Low error = healthy (autoencoder reconstructs healthy teeth well)
        is_valid = reconstruction_error > RECONSTRUCTION_ERROR_THRESHOLD
        
        # Calculate confidence based on distance from threshold
        error_diff = abs(reconstruction_error - RECONSTRUCTION_ERROR_THRESHOLD)
        
        if is_valid:
            # Diseased - confidence based on how much higher than threshold
            confidence = min(0.99, 0.5 + error_diff * 10)
        else:
            # Healthy - confidence based on how much lower than threshold
            confidence = min(0.99, 0.5 + error_diff * 10)
        
        status = 'diseased' if is_valid else 'healthy'
        
        logger.info(f"Autoencoder result: {status} (error: {reconstruction_error:.6f}, threshold: {RECONSTRUCTION_ERROR_THRESHOLD}, confidence: {confidence:.2f})")
        
        return JSONResponse(content={
            'is_valid': is_valid,
            'reconstruction_error': reconstruction_error,
            'threshold': RECONSTRUCTION_ERROR_THRESHOLD,
            'confidence': confidence,
            'status': status
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in validate_autoencoder: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail=f"Autoencoder validation failed: {str(e)}"
        )

# ==================== FAST PREDICTION ENDPOINT (NO LIME) ====================

@app.post("/predict-fast")
async def predict_fast_endpoint(file: UploadFile = File(...)):
    """
    STEP 1: Fast prediction without LIME explanation
    Returns result immediately
    (Should only be called AFTER autoencoder validation passes)
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
    STEP 2: Generate LIME explanation separately (can be called after fast prediction)
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

@app.get("/autoencoder/health")
async def autoencoder_health_check():
    """Check if autoencoder model is loaded and ready"""
    if AUTOENCODER_LOADED:
        return {
            "status": "healthy",
            "model_loaded": True,
            "model_type": "PyTorch Autoencoder",
            "device": str(device),
            "threshold": RECONSTRUCTION_ERROR_THRESHOLD
        }
    else:
        raise HTTPException(
            status_code=503, 
            detail="Autoencoder model not loaded"
        )

@app.get("/")
async def root():
    return {
        "message": "Dental Disease Detection API - Hybrid CNN + LightGBM with PyTorch Autoencoder",
        "workflow": {
            "step_0": "PyTorch Autoencoder validates if teeth are healthy or diseased",
            "step_1": "If diseased, fast prediction gives immediate results",
            "step_2": "LIME explanation generated in background for interpretability"
        },
        "endpoints": {
            "validation": {
                "/validate-autoencoder": "Check if teeth are healthy or diseased ✓"
            },
            "prediction": {
                "/predict-fast": "Fast prediction (CNN + LightGBM, no LIME) ⚡",
                "/generate-lime": "Generate LIME explanation separately 🔍",
                "/predict-with-lime": "Complete prediction with LIME (slower) 📊"
            },
            "chatbot": {
                "/chat-stream": "Streaming chatbot responses 💬"
            },
            "health": {
                "/lime/health": "Check hybrid model status",
                "/autoencoder/health": "Check autoencoder model status"
            }
        },
        "models_loaded": {
            "autoencoder": AUTOENCODER_LOADED,
            "hybrid_model": True
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "dental-api", 
        "models": {
            "hybrid": "CNN + LightGBM",
            "autoencoder": "PyTorch - loaded" if AUTOENCODER_LOADED else "not loaded"
        }
    }