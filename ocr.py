from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import os
import io
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

# Configure the Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    model = genai.GenerativeModel('gemini-2.0-flash')
    try:
        # Read the uploaded image file
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))

        # Prepare the prompt for the model
        prompt = "Extract the handwritten text from this image."

        # Send the image and prompt to the model
        response = model.generate_content([prompt, img])

        # Get the extracted text from the response
        extracted_text = response.text

        # Generate 10 example questions based on the extracted text
        quiz_prompt = f"""
        Create 10 example questions based on the following text. Each question should have one answer:

        Text: {extracted_text}

        Return ONLY valid JSON in this format:
        [
          {{
            "question": "...",
            "answer": "..."
          }},
          ...
        ]
        """

        quiz_response = model.generate_content([quiz_prompt])
        raw_quiz_text = quiz_response.text.strip()

        # Clean up the response if it contains Markdown formatting
        if raw_quiz_text.startswith("```"):
            raw_quiz_text = re.sub(r"^```[a-zA-Z]*\n", "", raw_quiz_text)
            raw_quiz_text = re.sub(r"```$", "", raw_quiz_text)
            raw_quiz_text = raw_quiz_text.strip()

        # Parse the JSON response
        questions = json.loads(raw_quiz_text)

        # Return the extracted text and generated questions
        return JSONResponse(content={"extracted_text": extracted_text, "questions": questions}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)