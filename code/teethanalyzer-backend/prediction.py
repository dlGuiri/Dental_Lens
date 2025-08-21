import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import numpy as np
import io
import traceback
import logging

# Set up logging
logger = logging.getLogger(__name__)

class_names = ['Calculus', 'Dental Caries', 'Gingivitis', 'Hypodontia', 'Mouth Ulcer', 'Tooth Discoloration']
MODEL_PATH = "Dental_Lens_efficientnetv2.pth"

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Your exact model architecture from training code
class EfficientNetV2Classifier(nn.Module):
    def __init__(self, num_classes, pretrained=True, fine_tune=False):
        super(EfficientNetV2Classifier, self).__init__()
        # Load pre-trained EfficientNetV2
        from torchvision.models import efficientnet_v2_s
        self.backbone = efficientnet_v2_s(pretrained=pretrained)
        
        # Freeze backbone layers if not fine-tuning
        if not fine_tune:
            for param in self.backbone.parameters():
                param.requires_grad = False
        else:
            # Unfreeze last few layers for fine-tuning
            for param in list(self.backbone.parameters())[:-50]:
                param.requires_grad = False
        
        # Get the number of features from the classifier
        num_features = self.backbone.classifier[1].in_features
        
        # Replace the classifier
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(1024, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)

# Load the model using your exact training setup
model = EfficientNetV2Classifier(num_classes=len(class_names), pretrained=False)

# Load the saved checkpoint
checkpoint = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(checkpoint['model_state_dict'])
model.to(device)
model.eval()

# Define transforms matching your training setup (260x260 size, same normalization)
transform = transforms.Compose([
    transforms.Resize((260, 260)),  # Your training used 260x260
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Same as training
])

def transform_image(image):
    """Transform single image for PyTorch model"""
    image = image.convert('RGB')
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return image_tensor.to(device)

def transform_images_batch(images):
    """Transform multiple images into a batch tensor for PyTorch"""
    batch_tensors = []
    for image in images:
        image = image.convert('RGB')
        image_tensor = transform(image)
        batch_tensors.append(image_tensor)
    
    batch_tensor = torch.stack(batch_tensors)
    return batch_tensor.to(device)

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
        
        # Transform images and make predictions
        with torch.no_grad():  # Disable gradient computation for inference
            if len(images) == 1:
                logger.info("Single image prediction")
                image_tensor = transform_image(images[0])
                logger.info(f"Image tensor shape: {image_tensor.shape}")
                
                outputs = model(image_tensor)
                predictions = torch.softmax(outputs, dim=1)[0].cpu().numpy()
                
            else:
                logger.info(f"Batch prediction with {len(images)} images")
                batch_tensor = transform_images_batch(images)
                logger.info(f"Batch tensor shape: {batch_tensor.shape}")
                
                outputs = model(batch_tensor)
                batch_predictions = torch.softmax(outputs, dim=1).cpu().numpy()
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