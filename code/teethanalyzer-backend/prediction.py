import tensorflow as tf
from PIL import Image
import numpy as np
import io
import traceback
import logging

# Set up logging
logger = logging.getLogger(__name__)

class_names = ['Calculus', 'Dental Caries', 'Gingivitis', 'Hypodontia', 'Mouth Ulcer', 'Tooth Discoloration']
MODEL_PATH = "modeldentifycare.keras"

model = tf.keras.models.load_model(MODEL_PATH)

def transform_image(image):
    image = image.resize((224, 224)).convert('RGB')
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

def transform_images_batch(images):
    """Transform multiple images into a batch tensor"""
    batch_images = []
    for image in images:
        image = image.resize((224, 224)).convert('RGB')
        image_array = np.array(image) / 255.0
        batch_images.append(image_array)
    
    return np.array(batch_images)

async def predict_disease(files):
    try:
        logger.info(f"predict_disease called with {len(files)} files")
        
        # Handle both single file and multiple files
        if not isinstance(files, list):
            files = [files]
        
        # Process all images
        images = []
        for i, file in enumerate(files):
            logger.info(f"Processing file {i}: {file.filename}")
            
            if hasattr(file, 'read'):
                contents = await file.read()
                logger.info(f"File {i} read successfully, size: {len(contents)} bytes")
            else:
                contents = file
                logger.info(f"File {i} already in bytes format")
            
            try:
                image = Image.open(io.BytesIO(contents))
                logger.info(f"Image {i} opened successfully: {image.size}, mode: {image.mode}")
                images.append(image)
            except Exception as img_error:
                logger.error(f"Failed to open image {i}: {str(img_error)}")
                raise
        
        # Transform images to batch tensor
        if len(images) == 1:
            logger.info("Single image prediction")
            image_tensor = transform_image(images[0])
            logger.info(f"Image tensor shape: {image_tensor.shape}")
            predictions = model.predict(image_tensor)[0]
        else:
            logger.info(f"Batch prediction with {len(images)} images")
            batch_tensor = transform_images_batch(images)
            logger.info(f"Batch tensor shape: {batch_tensor.shape}")
            batch_predictions = model.predict(batch_tensor)
            predictions = np.mean(batch_predictions, axis=0)
        
        # Get the top prediction
        top_index = np.argmax(predictions)
        top_class = class_names[top_index]
        top_confidence = float(predictions[top_index])
        
        logger.info(f"Prediction: {top_class}, Confidence: {top_confidence}")
        
        # Return as a simple list
        confidence_percentage = f"{top_confidence * 100:.2f}%"
        return [top_class, confidence_percentage]
        
    except Exception as e:
        logger.error(f"Error in predict_disease: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise