import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np
import json
import os
import io
import base64
import lightgbm as lgb
from sklearn.preprocessing import LabelEncoder
from lime import lime_image
from skimage.segmentation import mark_boundaries, slic
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server
import matplotlib.pyplot as plt
import logging

logger = logging.getLogger(__name__)

# Configuration
DEVICE = torch.device('cpu')
IMAGE_SIZE = (260, 260)
MODEL_PATH = 'Dental Lens Model V4.pth'
HYBRID_MODELS_DIR = 'hybrid_models'

class EfficientNetV2Classifier(nn.Module):
    """Same architecture as training"""
    def __init__(self, num_classes, pretrained=True, fine_tune=False):
        super(EfficientNetV2Classifier, self).__init__()
        self.backbone = models.efficientnet_v2_s(pretrained=pretrained)

        if not fine_tune:
            for param in self.backbone.parameters():
                param.requires_grad = False
        else:
            for param in list(self.backbone.parameters())[:-50]:
                param.requires_grad = False

        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(1024, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)
    
    def extract_features(self, x):
        """Extract 1024-dim features"""
        features = self.backbone.features(x)
        features = self.backbone.avgpool(features)
        features = torch.flatten(features, 1)
        features = self.backbone.classifier[0](features)
        features = self.backbone.classifier[1](features)
        features = self.backbone.classifier[2](features)
        return features

class LIMEPredictor:
    """LIME-enabled predictor for dental disease detection (LightGBM only)"""
    
    def __init__(self):
        self.device = DEVICE
        self.transform = transforms.Compose([
            transforms.Resize(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
        logger.info("Loading CNN model...")
        self.cnn_model = self._load_cnn_model(MODEL_PATH)
        
        logger.info("Loading LightGBM hybrid model...")
        self.lightgbm_model, self.metadata = self._load_lightgbm_model(HYBRID_MODELS_DIR)
        
        self.label_encoder = LabelEncoder()
        self.label_encoder.classes_ = np.array(self.metadata['label_encoder_classes'])
        
        logger.info(f"LIME Predictor initialized with LightGBM")
    
    def _load_cnn_model(self, model_path):
        """Load CNN model"""
        checkpoint = torch.load(model_path, map_location=self.device)
        model = EfficientNetV2Classifier(
            num_classes=checkpoint['num_classes'], 
            pretrained=True, 
            fine_tune=True
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(self.device)
        model.eval()
        return model
    
    def _load_lightgbm_model(self, models_dir):
        """Load LightGBM model and metadata"""
        # Load metadata
        with open(os.path.join(models_dir, 'metadata.json'), 'r') as f:
            metadata = json.load(f)
        
        # Load LightGBM model
        lgb_model = lgb.Booster(model_file=os.path.join(models_dir, 'lightgbm_model.txt'))
        
        return lgb_model, metadata
    
    def predict(self, image_bytes):
        """Quick prediction without LIME"""
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # CNN prediction
            with torch.no_grad():
                cnn_output = self.cnn_model(img_tensor)
                cnn_probs = F.softmax(cnn_output, dim=1)
                cnn_prediction = torch.argmax(cnn_probs, dim=1).item()
                cnn_confidence = cnn_probs[0, cnn_prediction].item()
                
                # Extract features
                features = self.cnn_model.extract_features(img_tensor).cpu().numpy()
            
            # LightGBM prediction
            prediction_probs = self.lightgbm_model.predict(features)
            hybrid_prediction = np.argmax(prediction_probs)
            hybrid_probabilities = prediction_probs[0]
            
            return {
                'cnn_prediction': self.label_encoder.inverse_transform([cnn_prediction])[0],
                'cnn_confidence': float(cnn_confidence),
                'hybrid_prediction': self.label_encoder.inverse_transform([hybrid_prediction])[0],
                'hybrid_confidence': float(hybrid_probabilities[hybrid_prediction]),
                'all_probabilities': {
                    disease: float(prob) 
                    for disease, prob in zip(self.metadata['disease_classes'], hybrid_probabilities)
                }
            }
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def predict_with_lime(self, image_bytes, num_samples=300):
        """Prediction with LIME explanation"""
        try:
            logger.info(f"Generating LIME explanation with {num_samples} samples...")
            
            # Load image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image_array = np.array(image)
            
            # Get basic prediction first
            prediction_result = self.predict(image_bytes)
            predicted_class = self.label_encoder.transform([prediction_result['hybrid_prediction']])[0]
            
            # Define prediction function for LIME
            def predict_fn(images):
                predictions = []
                for img in images:
                    pil_img = Image.fromarray(img.astype(np.uint8))
                    img_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
                    with torch.no_grad():
                        output = self.cnn_model(img_tensor)
                        probs = F.softmax(output, dim=1).cpu().numpy()[0]
                    predictions.append(probs)
                return np.array(predictions)
            
            # Generate LIME explanation
            explainer = lime_image.LimeImageExplainer(random_state=42)
            explanation = explainer.explain_instance(
                image_array,
                predict_fn,
                top_labels=len(self.label_encoder.classes_),
                hide_color=0,
                num_samples=num_samples,
                segmentation_fn=lambda x: slic(x, n_segments=50, compactness=10, sigma=1, start_label=0),
                random_seed=42
            )
            
            # Generate comprehensive visualization
            logger.info("Creating comprehensive LIME visualization...")
            
            # Get explanation masks
            temp, mask = explanation.get_image_and_mask(
                predicted_class,
                positive_only=False,
                num_features=10,
                hide_rest=False
            )
            
            temp_positive, mask_positive = explanation.get_image_and_mask(
                predicted_class,
                positive_only=True,
                num_features=5,
                hide_rest=False
            )
            
            temp_negative, mask_negative = explanation.get_image_and_mask(
                predicted_class,
                positive_only=False,
                num_features=5,
                hide_rest=False,
                negative_only=True
            )
            
            # Create comprehensive 8-panel visualization
            fig, axes = plt.subplots(2, 4, figsize=(20, 12))
            disease_name = prediction_result["hybrid_prediction"]
            fig.suptitle(f'LIME Explanation for {disease_name}', fontsize=16, fontweight='bold')
            
            # 1. Original Image
            axes[0, 0].imshow(image)
            axes[0, 0].set_title('Original Image', fontsize=12, fontweight='bold')
            axes[0, 0].axis('off')
            
            # 2. Superpixel Segmentation
            segments = explanation.segments
            segmented_img = mark_boundaries(image_array/255.0, segments)
            axes[0, 1].imshow(segmented_img)
            axes[0, 1].set_title(f'Superpixel Segmentation\n({len(np.unique(segments))} segments)', 
                               fontsize=12, fontweight='bold')
            axes[0, 1].axis('off')
            
            # 3. Overall Explanation (Positive + Negative)
            axes[0, 2].imshow(mark_boundaries(temp/255.0, mask))
            axes[0, 2].set_title('Complete Explanation\n(Green=Support, Red=Against)', 
                               fontsize=12, fontweight='bold')
            axes[0, 2].axis('off')
            
            # 4. Positive Contributions Only
            axes[0, 3].imshow(mark_boundaries(temp_positive/255.0, mask_positive))
            axes[0, 3].set_title('Positive Evidence\n(Supports Diagnosis)', 
                               fontsize=12, fontweight='bold')
            axes[0, 3].axis('off')
            
            # 5. Negative Contributions Only
            axes[1, 0].imshow(mark_boundaries(temp_negative/255.0, mask_negative))
            axes[1, 0].set_title('Negative Evidence\n(Against Diagnosis)', 
                               fontsize=12, fontweight='bold')
            axes[1, 0].axis('off')
            
            # 6. Heatmap of superpixel importance
            importance_map = self._create_importance_heatmap(explanation, predicted_class)
            im = axes[1, 1].imshow(importance_map, cmap='RdYlBu_r', alpha=0.8)
            axes[1, 1].imshow(image_array, alpha=0.5)
            axes[1, 1].set_title('Importance Heatmap\n(Warmer = More Important)', 
                               fontsize=12, fontweight='bold')
            axes[1, 1].axis('off')
            plt.colorbar(im, ax=axes[1, 1], fraction=0.046)
            
            # 7. Top Contributing Regions
            self._plot_top_regions(axes[1, 2], explanation, image_array, predicted_class)
            
            # 8. Quantitative Analysis
            self._plot_quantitative_analysis(axes[1, 3], explanation, predicted_class, disease_name)
            
            plt.tight_layout()
            
            # Save to base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()
            
            logger.info("LIME explanation generated successfully")
            
            return {
                'explanation_image': img_base64,
                'prediction': prediction_result,
                'num_samples': num_samples
            }
            
        except Exception as e:
            logger.error(f"LIME explanation error: {str(e)}")
            raise
    
    def _create_importance_heatmap(self, explanation, predicted_class):
        """Create importance heatmap from LIME explanation"""
        segments = explanation.segments
        importance_map = np.zeros_like(segments, dtype=float)
        
        # Get local explanation
        local_exp = explanation.local_exp[predicted_class]
        
        for segment_id, importance in local_exp:
            importance_map[segments == segment_id] = importance
        
        return importance_map
    
    def _plot_top_regions(self, ax, explanation, image_array, predicted_class):
        """Plot top contributing regions with their importance scores"""
        local_exp = explanation.local_exp[predicted_class]
        top_regions = sorted(local_exp, key=lambda x: abs(x[1]), reverse=True)[:5]
        
        # Create image showing only top regions
        segments = explanation.segments
        top_regions_mask = np.zeros_like(segments)
        
        for i, (segment_id, importance) in enumerate(top_regions):
            top_regions_mask[segments == segment_id] = i + 1
        
        # Show regions with different colors
        masked_image = image_array.copy()
        colored_mask = plt.cm.Set1(top_regions_mask / 5.0)
        
        # Blend original image with colored mask
        for i in range(3):
            masked_image[:, :, i] = np.where(
                top_regions_mask > 0,
                0.6 * masked_image[:, :, i] + 0.4 * 255 * colored_mask[:, :, i],
                masked_image[:, :, i]
            )
        
        ax.imshow(masked_image.astype(np.uint8))
        ax.set_title('Top 5 Contributing Regions', fontsize=12, fontweight='bold')
        ax.axis('off')
        
        # Add legend
        legend_text = []
        for i, (segment_id, importance) in enumerate(top_regions):
            sign = "+" if importance > 0 else ""
            legend_text.append(f"Region {i+1}: {sign}{importance:.3f}")
        
        ax.text(1.02, 1, '\n'.join(legend_text), transform=ax.transAxes, 
               verticalalignment='top', fontsize=9,
               bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))
    
    def _plot_quantitative_analysis(self, ax, explanation, predicted_class, disease_name):
        """Plot quantitative analysis of LIME explanation"""
        local_exp = explanation.local_exp[predicted_class]
        
        # Separate positive and negative contributions
        positive_contrib = [imp for _, imp in local_exp if imp > 0]
        negative_contrib = [imp for _, imp in local_exp if imp < 0]
        
        # Create summary statistics
        stats_text = f"Quantitative Analysis\n" + "="*25 + "\n"
        stats_text += f"Disease: {disease_name}\n\n"
        stats_text += f"Total Regions: {len(local_exp)}\n"
        stats_text += f"Supporting: {len(positive_contrib)}\n"
        stats_text += f"Against: {len(negative_contrib)}\n\n"
        
        if positive_contrib:
            stats_text += f"Positive Evidence:\n"
            stats_text += f"• Mean: {np.mean(positive_contrib):.4f}\n"
            stats_text += f"• Max: {np.max(positive_contrib):.4f}\n"
            stats_text += f"• Sum: {np.sum(positive_contrib):.4f}\n\n"
        
        if negative_contrib:
            stats_text += f"Negative Evidence:\n"
            stats_text += f"• Mean: {np.abs(np.mean(negative_contrib)):.4f}\n"
            stats_text += f"• Min: {np.abs(np.min(negative_contrib)):.4f}\n"
            stats_text += f"• Sum: {np.abs(np.sum(negative_contrib)):.4f}\n\n"
        
        # Overall assessment
        net_support = np.sum(positive_contrib) - np.abs(np.sum(negative_contrib))
        stats_text += f"Net Support: {net_support:.4f}\n"
        
        if net_support > 0.1:
            assessment = "Strong Support"
        elif net_support > 0.05:
            assessment = "Moderate Support"
        elif net_support > -0.05:
            assessment = "Weak/Mixed Evidence"
        else:
            assessment = "Contradictory Evidence"
        
        stats_text += f"Assessment: {assessment}"
        
        ax.text(0.05, 0.95, stats_text, transform=ax.transAxes, 
               verticalalignment='top', fontsize=10, fontfamily='monospace',
               bbox=dict(boxstyle="round,pad=0.5", facecolor="lightgray", alpha=0.8))
        ax.set_title('Statistical Summary', fontsize=12, fontweight='bold')
        ax.axis('off')

# Global instance (lazy initialization)
_lime_predictor = None

def get_lime_predictor():
    """Get or create LIME predictor instance"""
    global _lime_predictor
    if _lime_predictor is None:
        _lime_predictor = LIMEPredictor()
    return _lime_predictor