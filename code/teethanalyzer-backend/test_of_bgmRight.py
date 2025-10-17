import lightgbm as lgb
import pickle
import os

# Load your existing model
models_dir = 'hybrid_models'

try:
    # Try loading the corrupted model
    lgb_model = lgb.Booster(model_file=os.path.join(models_dir, 'lightgbm_model.txt'))
    
    # Re-save it properly as pickle (more robust)
    with open(os.path.join(models_dir, 'lightgbm_model.pkl'), 'wb') as f:
        pickle.dump(lgb_model, f)
    
    print("✅ Model successfully re-saved as pickle!")
    
except Exception as e:
    print(f"❌ Model is corrupted: {e}")
    print("You need to re-train the LightGBM model from your training script")