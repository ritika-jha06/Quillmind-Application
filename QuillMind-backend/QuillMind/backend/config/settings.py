"""
QuillMind — Centralized Configuration
Loads all settings from environment variables (.env file).
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Application ────────────────────────────────────────────────────────────────
APP_TITLE       = "QuillMind API"
APP_VERSION     = "1.0.0"
APP_DESCRIPTION = "AI-powered academic platform: Q&A, Summary, Exam Maker, Reading App."

# ── Groq LLM ───────────────────────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL    = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# ── JWT Auth ───────────────────────────────────────────────────────────────────
JWT_SECRET       = os.getenv("JWT_SECRET", "quillmind-dev-secret")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "6"))

# ── Sentence Transformer ───────────────────────────────────────────────────────
SENTENCE_MODEL_NAME = os.getenv("SENTENCE_MODEL_NAME", "all-MiniLM-L6-v2")

# ── Text Processing ────────────────────────────────────────────────────────────
CHUNK_SIZE   = int(os.getenv("CHUNK_SIZE", "400"))
TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "3"))

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
LOG_DIR    = os.path.join(BASE_DIR, "logs")
DB_PATH    = os.path.join(BASE_DIR, "database", "quillmind.db")

# ── CORS ───────────────────────────────────────────────────────────────────────
_cors_raw    = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",")] if _cors_raw != "*" else ["*"]
