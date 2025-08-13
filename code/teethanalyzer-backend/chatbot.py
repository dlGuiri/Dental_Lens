import os
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
import io

load_dotenv()

def stream_response(prompt: str, image_base64: str = None):
    # Create the client instance
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    
    # Start with the text prompt
    contents = [prompt]
    
    # Add image if provided
    if image_base64:
        # Decode the base64 image
        image_data = base64.b64decode(image_base64.split(",")[1])
        
        # Convert to PIL Image (the new SDK handles PIL Images automatically)
        image = Image.open(io.BytesIO(image_data))
        contents.append(image)
    
    # Stream the response using the new SDK
    for chunk in client.models.generate_content_stream(
        model='gemini-2.0-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="text/plain"
        )
    ):
        yield chunk.text
