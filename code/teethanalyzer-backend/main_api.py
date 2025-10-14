# main_api.py
from http.client import HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from lime_inference import get_lime_predictor
from prediction import predict_disease
from pydantic import BaseModel
from chatbot import stream_response
from typing import List
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to ["http://localhost:3000"] if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For image prediction
@app.post("/predict")
async def predict_endpoint(files: List[UploadFile] = File(...)):
    try:
        logger.info(f"Received {len(files)} files")
        for i, file in enumerate(files):
            logger.info(f"File {i}: {file.filename}, content_type: {file.content_type}")
        
        result = await predict_disease(files)
        logger.info(f"Prediction successful: {result}")
        return {"prediction": result}
    
    except Exception as e:
        logger.error(f"Error in predict_endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# For chatbot
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

# ==================== NEW LIME ENDPOINTS ====================



@app.post("/predict-lime")

async def predict_lime_endpoint(file: UploadFile = File(...)):

    """

    Quick prediction using LIME model (without explanation visualization)

    Faster than /predict-with-lime

    """

    try:

        logger.info(f"LIME Quick Predict - File: {file.filename}")

        

        # Read image bytes

        image_bytes = await file.read()

        

        # Get LIME predictor

        predictor = get_lime_predictor()

        

        # Get prediction

        result = predictor.predict(image_bytes)

        

        logger.info(f"LIME prediction successful: {result['hybrid_prediction']}")

        return JSONResponse(content={

            "status": "success",

            "prediction": result

        })

    

    except Exception as e:

        logger.error(f"Error in predict_lime_endpoint: {str(e)}")

        logger.error(f"Traceback: {traceback.format_exc()}")

        raise HTTPException(status_code=500, detail=f"LIME prediction failed: {str(e)}")



@app.post("/predict-with-lime")

async def predict_with_lime_endpoint(

    file: UploadFile = File(...),

    num_samples: int = 300  # Can be adjusted via query parameter

):

    """

    Prediction with LIME explanation visualization

    This takes longer but provides interpretability

    

    Query parameters:

    - num_samples: Number of samples for LIME (default: 300, range: 100-1000)

    """

    try:

        # Validate num_samples

        if not 100 <= num_samples <= 1000:

            raise HTTPException(

                status_code=400, 

                detail="num_samples must be between 100 and 1000"

            )

        

        logger.info(f"LIME with Explanation - File: {file.filename}, Samples: {num_samples}")

        

        # Read image bytes

        image_bytes = await file.read()

        

        # Get LIME predictor

        predictor = get_lime_predictor()

        

        # Generate LIME explanation

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



@app.get("/lime/health")

async def lime_health_check():

    """Check if LIME model is loaded and ready"""

    try:

        predictor = get_lime_predictor()

        return {

            "status": "healthy",

            "model_loaded": True,

            "best_model": predictor.best_model_name,

            "num_classes": len(predictor.label_encoder.classes_),

            "disease_classes": predictor.metadata['disease_classes']

        }

    except Exception as e:

        logger.error(f"LIME health check failed: {str(e)}")

        raise HTTPException(status_code=503, detail=f"LIME model not available: {str(e)}")



# ==================== GENERAL ENDPOINTS ====================



@app.get("/")

async def root():

    return {

        "message": "Dental Disease Detection API",

        "endpoints": {

            "prediction": {

                "/predict": "Original prediction endpoint (multiple files)",

                "/predict-lime": "Quick LIME prediction (single file, no visualization)",

                "/predict-with-lime": "LIME prediction with explanation visualization"

            },

            "chatbot": {

                "/chat-stream": "Streaming chatbot responses"

            },

            "health": {

                "/lime/health": "Check LIME model status"

            }

        }

    }



@app.get("/health")

async def health_check():

    return {"status": "healthy", "service": "dental-api"}