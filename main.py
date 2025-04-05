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
import tempfile
from datetime import datetime
from typing import List, Optional

import pdfplumber
# import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import google.generativeai as genai



try:
    import docx  # type: ignore
except ImportError:
    docx = None  # will raise later if user uploads DOCX without python-docx installed

# ---------------------------------------------------------------------------
# Environment & third‑party setup
# ---------------------------------------------------------------------------
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

if not GOOGLE_API_KEY:
    raise RuntimeError("Set GOOGLE_API_KEY environment variable")

# Create a single Gemini client instance (new style)
# GENAI_CLIENT = genai.Client(api_key=GOOGLE_API_KEY)

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-pro")


mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client["deep_learner"]

# ---------------------------------------------------------------------------
# Pydantic models (for request / response bodies)
# ---------------------------------------------------------------------------
class RoadmapEntry(BaseModel):
    date: Optional[str] = None  # ISO date or week number
    topic: str
    preQuizPrompt: Optional[str] = None
    assignment: Optional[str] = None
    projectDue: Optional[str] = None


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
        "produce a JSON array where each element has: `date` (YYYY-MM-DD or week number), "
        "`topic`, `preQuizPrompt` (one‑sentence description of what the pre‑lecture quiz should cover), "
        "`assignment` (optional), `projectDue` (optional). Return ONLY valid JSON.\n\n"
    )

    try:
        response = GENAI_CLIENT.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
    except Exception as err:
        raise ValueError(f"Gemini API call failed: {err}")

    # Depending on library version, the text may be under `text` or `content`.
    raw_text = getattr(response, "text", None) or getattr(response, "content", "")

    try:
        return json.loads(raw_text)
    except Exception as exc:
        raise ValueError(
            f"Gemini returned invalid JSON: {exc}\nRaw response: {raw_text}"
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/courses/", response_model=CourseCreateResponse, summary="Create a course and upload syllabus")
async def create_course(name: str, syllabus: UploadFile = File(...), test_mode: bool = False):

    if test_mode:
        # Dummy test mode: Ignore input and return hardcoded data
        course_doc_test = {
            "name": "dummy_course",
            "syllabus_text": "This is a dummy syllabus text for testing.",
            "created_at": datetime.utcnow(),
            "roadmap": [
                {
                    "date": "2025-04-01",
                    "topic": "Introduction to Testing",
                    "preQuizPrompt": "What is testing?",
                    "assignment": "Read Chapter 1",
                    "projectDue": None,
                }
            ],
        }
        result = await db.courses.insert_one(course_doc_test)
        course_doc_test["_id"] = str(result.inserted_id)
        return course_doc_test


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
        "syllabus_text": syllabus_text,
        "created_at": datetime.utcnow(),
        "roadmap": roadmap_json,
    }

    result = await db.courses.insert_one(course_doc)
    course_doc["_id"] = str(result.inserted_id)

    return course_doc


@app.get(
    "/courses/{course_id}/roadmap",
    response_model=List[RoadmapEntry],
    summary="Fetch roadmap for a course by ID",
)
async def get_roadmap(course_id: str):
    try:
        obj_id = ObjectId(course_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid course ID")

    course = await db.courses.find_one({"_id": obj_id}, {"_id": 0, "roadmap": 1})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course["roadmap"]


# ---------------------------------------------------------------------------
# TODOs for next iterations
# ---------------------------------------------------------------------------
# • Endpoint to generate pre‑lecture quizzes from roadmap entries.
# • Handwriting OCR endpoint (Cloud Vision) → post‑lecture quiz generation.
# • Spaced‑repetition scheduler (Celery/cron) + Calendar push.
# • Authentication & user‑specific quiz attempts (collections: users, quizzes, attempts).
# • Front‑end integration (React / React Native).
