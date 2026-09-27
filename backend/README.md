# Backend (FastAPI) — Citizen Legal Buddy

This folder runs a FastAPI backend that answers legal questions, accepts document uploads (PDF/DOCX/TXT) for analysis, and supports audio transcription (Whisper) for voice queries.

Quick start (local, Windows PowerShell):

1. Create and activate a virtual env:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Create `.env` with your OpenAI key:

```powershell
'OPENAI_API_KEY=sk-...' | Out-File -Encoding utf8 .env
```

4. Run the server:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Notes:
- Uploaded documents are persisted to `uploaded_docs.db` (SQLite) in this folder. Mount this file or directory when deploying so documents survive restarts.
- For production container deployment, build the Docker image and run it exposing port 8000.

Docker build example:

```powershell
docker build -t citizen-legal-buddy-backend .
docker run -e OPENAI_API_KEY="sk-..." -p 8000:8000 citizen-legal-buddy-backend
```

Hosting suggestions:
- Render / Railway / Fly / Google Cloud Run are straightforward for container deployments.
- Ensure `OPENAI_API_KEY` is set in platform secrets and persist the SQLite file (or switch to cloud DB like PostgreSQL) for production.

Security & scaling:
- Restrict CORS `allow_origins` to your frontend URL in production.
- Replace in-memory storage with a proper DB (Postgres) and add authentication for user data.
- Use background workers for long-running tasks (large files) and rate-limit API endpoints.
