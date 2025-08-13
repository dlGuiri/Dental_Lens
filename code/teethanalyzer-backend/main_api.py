# main_api.py
from http.client import HTTPException
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prediction import predict_disease
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
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