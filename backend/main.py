from fastapi import FastAPI, UploadFile, Form, File
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI
import PyPDF2
import docx
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import Optional
from contextlib import closing

# ------------------------------
# Load API key
# ------------------------------
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
try:
    client = OpenAI(api_key=api_key)
except TypeError:
    # Fallback for httpx compatibility issues
    import httpx
    client = OpenAI(api_key=api_key, http_client=httpx.Client())

# ------------------------------
# Simple SQLite persistence for uploaded documents
# ------------------------------
DB_PATH = os.path.join(os.path.dirname(__file__), "uploaded_docs.db")

def init_db():
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                email TEXT PRIMARY KEY,
                content TEXT
            )
            """
        )
        conn.commit()

def save_document(email: str, content: str):
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO documents (email, content) VALUES (?, ?)",
            (email, content),
        )
        conn.commit()

def load_document(email: str) -> Optional[str]:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cur = conn.cursor()
        cur.execute("SELECT content FROM documents WHERE email = ?", (email,))
        row = cur.fetchone()
        return row[0] if row else None

app = FastAPI(title="Citizen Legal Buddy API")

# ------------------------------
# Enable CORS
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Pydantic models
# ------------------------------
class AskRequest(BaseModel):
    email: str
    question: str

class DocQARequest(BaseModel):
    email: str
    question: str

# ------------------------------
# Legal question endpoint
# ------------------------------
@app.post("/ask")
async def ask_question(request: AskRequest):
    system_prompt = f"""
You are an AI Legal Assistant for Indian citizens.
- Always explain laws in simple, clear language.
- Only answer legal questions (IPC, Constitution, Acts, rights, penalties, case laws, etc.).
- If the user asks something irrelevant, politely decline.
User email: {request.email}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            max_tokens=400,
            temperature=0.3
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        print("Error:", e)
        return {"answer": f"⚠️ Could not process '{request.question}'."}

# ------------------------------
# Upload endpoint (Summarize + Store)
# ------------------------------
uploaded_docs = {}  # in-memory fallback storage {email: document_text}

# initialize DB on startup
init_db()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), email: str = Form(...)):
    filename = file.filename.lower()
    text = ""

    try:
        # audio transcription (Whisper)
        if filename.endswith((".mp3", ".wav", ".m4a")):
            # rewind to start
            file.file.seek(0)
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=file.file
            )
            text = transcript.text
            save_document(email, text)
            return {"transcript": transcript.text}

        # PDF
        elif filename.endswith(".pdf"):
            file.file.seek(0)
            reader = PyPDF2.PdfReader(file.file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        # Word documents
        elif filename.endswith((".doc", ".docx")):
            file.file.seek(0)
            doc = docx.Document(file.file)
            text = "\n".join([p.text for p in doc.paragraphs])

        # Plain text
        elif filename.endswith(".txt"):
            file.file.seek(0)
            text = file.file.read().decode("utf-8")

        else:
            return {"analysis": "⚠️ Unsupported file type."}

        # persist the document
        save_document(email, text)

        system_prompt = f"""
You are an AI Legal Assistant for Indian citizens.
Summarize the following legal document clearly and simply.
Focus only on laws, rights, penalties, or important legal points.

User email: {email}
Document content (truncated):
{text[:4000]}
"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Summarize the legal content of this document."}
            ],
            max_tokens=400,
            temperature=0.4
        )
        answer = response.choices[0].message.content.strip()
        return {"analysis": answer, "message": "✅ Document stored for Q&A."}

    except Exception as e:
        print("Error:", e)
        return {"analysis": f"⚠️ Could not process '{file.filename}'."}

# ------------------------------
# Document Q&A endpoint
# ------------------------------
@app.post("/doc-qa")
async def doc_qa(request: DocQARequest):
    # Try DB first, fall back to in-memory
    document_text = load_document(request.email)
    if not document_text:
        if request.email not in uploaded_docs:
            return {"answer": "⚠️ No document found. Please upload a document first."}
        document_text = uploaded_docs[request.email]

    system_prompt = f"""
You are an AI Legal Assistant for Indian citizens.
The user has uploaded a document. Use ONLY the document content and general Indian law to answer.
If the question cannot be answered from the document, politely say so.

User email: {request.email}
Document content (truncated):
{document_text[:4000]}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            max_tokens=400,
            temperature=0.3
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        print("Error:", e)
        return {"answer": f"⚠️ Could not process '{request.question}'."}

# ------------------------------
# Dummy Acts endpoint
# ------------------------------
@app.get("/acts")
async def get_acts():
    return {
        "acts": [
            "IPC Section 378 - Theft",
            "RTI Act 2005",
            "Consumer Protection Act 2019"
        ]
    }

# ------------------------------
# Root endpoint
# ------------------------------
@app.get("/")
async def root():
    return {
        "message": "✅ Welcome to Citizen Legal Buddy API!",
        "endpoints": ["/ask", "/upload", "/doc-qa", "/acts"]
    }
