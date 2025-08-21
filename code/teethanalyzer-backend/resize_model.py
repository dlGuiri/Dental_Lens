from tensorflow import keras

# Load full model
model = keras.models.load_model("modeldentifycare.keras")
model.summary()

# Save only weights (lighter file)
model.save_weights("dental_lens.weights.h5")
