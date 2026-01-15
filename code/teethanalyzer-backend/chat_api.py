from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from chatbot import stream_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    prompt: str

@app.post("/chat-stream")
async def chat_stream(prompt: Prompt):
    return StreamingResponse(stream_response(prompt.prompt), media_type="text/plain")

import torch
import torch.nn as nn
import torch.nn.functional as F

class AGFFBlock(nn.Module):
    """
    Attention-Guided Feature Fusion (AGFF) Block.
    
    Implements:
    1. Spatial Alignment (Bilinear Interpolation)
    2. Calibration (Normalization, Projection, Learnable Scaling)
    3. Dual-Attention Gating (Channel & Spatial)
    4. Additive Fusion
    """
    def __init__(self, in_channels: int = 768, reduction_ratio: int = 4):
        super().__init__()
        
        half_channels = in_channels // 2
        
        # --- Step 2: Calibration Components ---
        # Layer Norms (Applied to [B, H, W, C] shape usually, we will handle permutation in forward)
        self.ln_conv = nn.LayerNorm(in_channels)
        self.ln_swin = nn.LayerNorm(in_channels)
        
        # Projections to C/2
        self.proj_conv = nn.Linear(in_channels, half_channels)
        self.proj_swin = nn.Linear(in_channels, half_channels)
        
        # Learnable Scalar Coefficients (alpha and beta)
        # Initialized to 1.0 to allow gradients to flow initially
        self.alpha = nn.Parameter(torch.tensor(1.0), requires_grad=True)
        self.beta = nn.Parameter(torch.tensor(1.0), requires_grad=True)
        
        # --- Step 3: Dual Attention Components ---
        
        # Module A: Channel Attention (MLP)
        # Input to this MLP will be the concatenated features (size = in_channels)
        self.channel_att_mlp = nn.Sequential(
            nn.Linear(in_channels, in_channels // reduction_ratio),
            nn.ReLU(),
            nn.Linear(in_channels // reduction_ratio, in_channels),
            nn.Sigmoid()
        )
        
        # Module B: Spatial Attention (Conv)
        # 1x1 Convolution to squash channels to 1
        self.spatial_att_conv = nn.Conv2d(in_channels, 1, kernel_size=1, stride=1, padding=0)
        self.spatial_sigmoid = nn.Sigmoid()

    def forward(self, f_conv: torch.Tensor, f_swin: torch.Tensor) -> torch.Tensor:
        """
        Args:
            f_conv: Output from ConvNeXt [Batch, Channels, Height, Width]
            f_swin: Output from Swin Transformer [Batch, Channels, Height_S, Width_S]
                    (Note: Swin output is often permuted; we assume [B, C, H, W] for consistency here)
        """
        
        # --- Step 1: Spatial Alignment ---
        # Resize Swin features to match ConvNeXt resolution (H, W)
        target_size = f_conv.shape[2:] # (H, W)
        
        # 
        f_aligned_swin = F.interpolate(
            f_swin, 
            size=target_size, 
            mode='bilinear', 
            align_corners=False
        )
        
        # --- Step 2: Calibration ---
        # Permute to [B, H, W, C] for LayerNorm and Linear Projection
        f_conv_perm = f_conv.permute(0, 2, 3, 1) 
        f_swin_perm = f_aligned_swin.permute(0, 2, 3, 1)
        
        # Normalization & Projection
        f_conv_proj = self.proj_conv(self.ln_conv(f_conv_perm))
        f_swin_proj = self.proj_swin(self.ln_swin(f_swin_perm))
        
        # Learnable Scaling and Concatenation
        # alpha * Conv + beta * Swin
        f_conv_scaled = self.alpha * f_conv_proj
        f_swin_scaled = self.beta * f_swin_proj
        
        # Concatenate back to original channel dimension
        f_cal = torch.cat([f_conv_scaled, f_swin_scaled], dim=-1)
        
        # Restore to [B, C, H, W] for Convolutional operations
        f_cal = f_cal.permute(0, 3, 1, 2)
        
        # --- Step 3: Dual Attention Gating ---
        
        # A. Channel Attention
        # Global Average Pooling (B, C, H, W) -> (B, C, 1, 1) -> Flatten to (B, C)
        gap = f_cal.mean(dim=[2, 3]) 
        a_c = self.channel_att_mlp(gap) # (B, C)
        # Reshape for broadcasting: (B, C, 1, 1)
        a_c = a_c.view(a_c.size(0), a_c.size(1), 1, 1)
        
        f_channel = f_cal * a_c
        
        # B. Spatial Attention
        # 1x1 Conv -> Sigmoid
        spatial_logits = self.spatial_att_conv(f_cal)
        a_s = self.spatial_sigmoid(spatial_logits) # (B, 1, H, W)
        
        f_spatial = f_cal * a_s
        
        # --- Step 4: Final Fusion ---
        # Additive Fusion
        f_fused = f_spatial + f_channel
        
        return f_fused

class CNNTranFusion(nn.Module):
    def __init__(self, num_classes=10, feature_dim=768):
        super().__init__()
        
        # NOTE: In a real implementation, you would load pretrained backbones here.
        # e.g., timm.create_model('convnext_tiny'), timm.create_model('swin_tiny')
        # We are mocking the backbones to focus on the AGFF logic.
        self.feature_dim = feature_dim
        
        # The Core Fusion Block
        self.agff = AGFFBlock(in_channels=feature_dim)
        
        # --- Final Output Head ---
        self.final_norm = nn.LayerNorm(feature_dim)
        self.head = nn.Linear(feature_dim, num_classes)
        
    def forward(self, x):
        """
        Input x: Raw image tensor
        """
        
        # --- Parallel Branches ---
        # These are placeholders simulating the outputs of ConvNeXt and Swin
        # Branch 1: Local Feature Extraction (ConvNeXt)
        # Output shape: [B, 768, 32, 32] (Hypothetical resolution)
        f_conv = self._mock_convnext_features(x)
        
        # Branch 2: Global Context Modeling (Swin)
        # Output shape: [B, 768, 16, 16] (Often smaller resolution than Conv branch)
        f_swin = self._mock_swin_features(x)
        
        # --- Fusion ---
        # 
        f_fused = self.agff(f_conv, f_swin) # Returns [B, 768, 32, 32]
        
        # --- Classification Head ---
        # Global Average Pooling on the fused map
        # f_fused is [B, C, H, W], we want [B, C]
        v = f_fused.mean(dim=[2, 3])
        
        # Final Norm and Linear
        logits = self.head(self.final_norm(v))
        
        return logits

    # Mock helper methods to make the code runnable without heavy external deps
    def _mock_convnext_features(self, x):
        # Simulates 768 channels, H/8 resolution
        B, _, H, W = x.shape
        return torch.randn(B, self.feature_dim, H//8, W//8, device=x.device)

    def _mock_swin_features(self, x):
        # Simulates 768 channels, H/16 resolution (needs alignment)
        B, _, H, W = x.shape
        return torch.randn(B, self.feature_dim, H//16, W//16, device=x.device)

# --- Sanity Check / Experiment Execution Code ---
if __name__ == "__main__":
    # Check for CUDA backend as per environment details
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Running on: {device}")
    
    # Initialize Model
    model = CNNTranFusion(num_classes=5).to(device)
    
    # Simulate Input (Batch Size 8, RGB, 256x256)
    dummy_input = torch.randn(8, 3, 256, 256).to(device)
    
    # Forward Pass
    output = model(dummy_input)
    
    print("\n--- Architecture Verification ---")
    print(f"Input Shape: {dummy_input.shape}")
    print(f"Output Logits Shape: {output.shape}")
    
    # Verify Learnable Coefficients
    print(f"Alpha (Conv Scale): {model.agff.alpha.item():.4f}")
    print(f"Beta (Swin Scale): {model.agff.beta.item():.4f}")