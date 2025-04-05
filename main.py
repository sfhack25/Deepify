"""
Deep Learner backend (MongoDB Atlas edition)
-------------------------------------------------
Now updated to use **genai.Client** with the *gemini‑2.0‑flash* model for every
Google Gemini request (instead of the older `GenerativeModel` interface).

Quick start:
  1.  export GOOGLE_API_KEY="<your_gemini_key>"
  2.  export MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
  3.  pip install -r requirements.txt
  4.  uvicorn main:app --reload

Dependencies (requirements.txt):
  fastapi
  uvicorn[standard]
  motor                 # async MongoDB driver
  pydantic              # FastAPI uses it internally
  google-generativeai   # Gemini client
  pdfplumber            # PDF text extraction
  python-docx           # DOCX text extraction
"""

import os
import json
from dotenv import load_dotenv
import tempfile
from datetime import datetime
from typing import List, Optional
import re
import pdfplumber
# import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from google import genai
from datetime import date
load_dotenv()


try:
    import docx  # type: ignore
except ImportError:
    docx = None  # will raise later if user uploads DOCX without python-docx installed

# ---------------------------------------------------------------------------
# Environment & third‑party setup
# ---------------------------------------------------------------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# Use MongoDB Atlas
MONGODB_URI = os.getenv("MONGO_URI")

if not GOOGLE_API_KEY:
    raise RuntimeError("Set GOOGLE_API_KEY environment variable")

if not MONGODB_URI:
    raise RuntimeError("Set MONGO_URI environment variable")

# Create a single Gemini client instance (new style)
GENAI_CLIENT = genai.Client(api_key=GOOGLE_API_KEY)

# Initialize MongoDB variables
mongo_client = None
db = None

# ---------------------------------------------------------------------------
# Pydantic models (for request / response bodies)
# ---------------------------------------------------------------------------
class RoadmapEntry(BaseModel):
    date: Optional[str] = None  # ISO date or week number
    topic: str
    preQuizPrompt: Optional[str] = None
    assignment: Optional[str] = None


class CourseCreateResponse(BaseModel):
    id: str = Field(..., alias="_id")
    roadmap: List[RoadmapEntry]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Deep Learner API – MongoDB Atlas MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Startup and shutdown events
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_db_client():
    global mongo_client, db
    
    # Connect to MongoDB Atlas
    try:
        print(f"Attempting to connect to MongoDB Atlas at: {MONGODB_URI}")
        # Disable SSL certificate verification for MongoDB Atlas
        mongo_client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        # Test the connection
        print("Testing MongoDB connection...")
        server_info = await mongo_client.server_info()
        print(f"MongoDB server info: {server_info}")
        db = mongo_client["deep_learner"]
        print("Successfully connected to MongoDB Atlas")
        
        # Test database access by listing collections
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
    except Exception as e:
        print(f"Failed to connect to MongoDB Atlas: {e}")
        raise RuntimeError(f"Failed to connect to MongoDB Atlas: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    global mongo_client
    if mongo_client:
        mongo_client.close()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_text_from_file(path: str, suffix: str) -> str:
    """Return plaintext from a PDF or DOCX syllabus file."""

    if suffix == ".pdf":
        with pdfplumber.open(path) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)

    if suffix == ".docx":
        if docx is None:
            raise RuntimeError("python-docx not installed; cannot parse DOCX files")
        document = docx.Document(path)
        return "\n".join(p.text for p in document.paragraphs)

    raise ValueError("Unsupported file type")


def generate_roadmap(syllabus_text: str):
    """Call Gemini (gemini‑2.0‑flash) to convert raw syllabus into a JSON roadmap."""

    
    prompt = (
        "You are an expert academic planner. Given the following semester syllabus, "
        "produce a valid JSON array where each element has: `date` (YYYY-MM-DD), "
        "has element `topic` and `preQuizPrompt` which is detailed 2 sentence of what the topic is about and `assignment` due on that day if theres any pure json array please with no other info starts with { and ends with }"
        f"\n\nSyllabus:\n{syllabus_text}"
        )

    try:
        print(f"Sending prompt to Gemini API: {prompt[:200]}...")
        response = GENAI_CLIENT.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        
        # Log the full response
        print(f"Gemini API Response: {response}")
        
        # Depending on library version, the text may be under `text` or `content`.
        raw_text = getattr(response, "text", None) or getattr(response, "content", "")
        print(f"Extracted text from response: {raw_text}")
        
        # Clean up the response by removing markdown code block formatting
        cleaned_text = raw_text
        if "```json" in cleaned_text:
            cleaned_text = cleaned_text.split("```json")[1]
        if "```" in cleaned_text:
            cleaned_text = cleaned_text.split("```")[0]
        
        # Strip any leading/trailing whitespace
        cleaned_text = cleaned_text.strip()
        print(f"Cleaned text for JSON parsing: {cleaned_text}")
        
    except Exception as err:
        print(f"Error calling Gemini API: {err}")
        raise ValueError(f"Gemini API call failed: {err}")

    try:
        roadmap_data = json.loads(cleaned_text)
        print(f"Successfully parsed JSON roadmap: {roadmap_data}")
        return roadmap_data
    except Exception as exc:
        print(f"Error parsing JSON from Gemini response: {exc}")
        print(f"Raw response that failed to parse: {raw_text}")
        raise ValueError(
            f"Gemini returned invalid JSON: {exc}\nRaw response: {raw_text}"
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/courses/", response_model=CourseCreateResponse, summary="Create a course and upload syllabus")
async def create_course(name: str, syllabus: UploadFile = File(...)):
    """Accept a PDF or DOCX syllabus, extract text, generate roadmap, persist in MongoDB."""

    suffix = os.path.splitext(syllabus.filename)[-1].lower()
    if suffix not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files are supported")

    # Save to a temporary file to allow library parsing
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await syllabus.read())
        tmp_path = tmp.name

    # 1️ Extract text
    try:
        syllabus_text = extract_text_from_file(tmp_path, suffix)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Failed to parse syllabus: {err}")

    # 2️ Generate roadmap via Gemini
    try:
        roadmap_json = generate_roadmap(syllabus_text)
    except ValueError as err:
        raise HTTPException(status_code=500, detail=str(err))

    # 3️ Persist to MongoDB
    course_doc = {
        "name": name,
        "created_at": datetime.utcnow(),
        "roadmap": roadmap_json,
    }
    
    try:
        # Insert the document
        print(f"Inserting course document: {name}")
        result = await db.courses.insert_one(course_doc)
        course_id = str(result.inserted_id)
        print(f"Successfully inserted course with ID: {course_id}")
        
        # Verify the document was inserted
        inserted_doc = await db.courses.find_one({"_id": result.inserted_id})
        if inserted_doc:
            print(f"Verified document insertion: {inserted_doc['name']}")
        else:
            print("Warning: Could not verify document insertion")
    except Exception as e:
        print(f"Error inserting document to MongoDB: {e}")
        raise RuntimeError(f"Error inserting document to MongoDB: {e}")
    
    # Create response with proper _id field
    response_data = {
        "_id": course_id,
        "roadmap": roadmap_json
    }
    
    return response_data


@app.get(
    "/courses/{course_id}/roadmap",
    response_model=List[RoadmapEntry],
    summary="Fetch roadmap for a course by ID",
)
async def get_roadmap(course_id: str):
    try:
        obj_id = ObjectId(course_id)
        course = await db.courses.find_one({"_id": obj_id}, {"_id": 0, "roadmap": 1})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course["roadmap"]
    except Exception as e:
        if "Invalid course ID" in str(e):
            raise HTTPException(status_code=400, detail="Invalid course ID")
        raise HTTPException(status_code=500, detail=f"Error retrieving roadmap: {str(e)}")



@app.post("/courses/{course_id}/quizzes/pre", summary="Generate pre-lecture quiz for all roadmap topics")
async def generate_pre_quiz(course_id: str):
    try:
        obj_id = ObjectId(course_id)
        course = await db.courses.find_one({"_id": obj_id})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        roadmap = course.get("roadmap", [])
        if not roadmap:
            raise HTTPException(status_code=404, detail="No roadmap entries found")

        all_quizzes = []

        for entry in roadmap:
            topic = entry.get("topic")
            prompt = entry.get("preQuizPrompt")

            if not topic or not prompt:
                continue  # skip entries without quiz input data

            quiz_prompt = f"""
Create 10 multiple-choice questions (A–D) with answers to help a student prepare for a lecture on:

Topic: {topic}
Prompt: {prompt}

Return ONLY valid JSON in this format:
[
  {{
    "question": "...",
    "choices": ["A...", "B...", "C...", "D..."],
    "answer": "B"
  }},
  ...
]
"""

            try:
                response = GENAI_CLIENT.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=quiz_prompt,
                )
                raw_text = getattr(response, "text", None) or getattr(response, "content", "")
                stripped = raw_text.strip()

                if stripped.startswith("```"):
                    stripped = re.sub(r"^```[a-zA-Z]*\n", "", stripped)
                    stripped = re.sub(r"```$", "", stripped)
                    stripped = stripped.strip()

                quiz_data = json.loads(stripped)

                all_quizzes.append({
                    "topic": topic,
                    "quiz": quiz_data
                })

            except Exception as e:
                all_quizzes.append({
                    "topic": topic,
                    "error": f"Quiz generation failed: {e}"
                })

        return {"quizzes": all_quizzes}

    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Internal error: {err}")