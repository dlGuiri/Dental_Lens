FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all necessary files
COPY main_api.py .
COPY prediction.py .
COPY chatbot.py .
COPY lime_inference.py .
COPY dental_lens_model_v4.pth .
COPY hybrid_models/ ./hybrid_models/

# Expose port (Render will use PORT env variable)
EXPOSE 8000

# Start the application
CMD uvicorn main_api:app --host 0.0.0.0 --port ${PORT:-8000}
