"""
QuillMind — Main Application Entry Point
========================================
Starts the FastAPI server, loads all AI models once,
seeds the vector store, and registers all API routers.

Run with:
    uvicorn main:app --reload
"""

import nltk  # type: ignore
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from config.settings import APP_TITLE, APP_VERSION, APP_DESCRIPTION, CORS_ORIGINS, UPLOAD_DIR
from database.db import init_db
from shared.embeddings.sentence_encoder import load_sentence_model
from shared.vectorstore.folder_store import build_store
from workflows.exam_workflow import init_exam_workflow
from shared.utils.logger import logger

# ── API Routers ────────────────────────────────────────────────────────────────
from api.admin_router import router as admin_router
from api.qa_router import router as qa_router
from api.summary_router import router as summary_router
from api.exam_router import router as exam_router
from api.reading_router import router as reading_router
from api.auth_router import router as auth_router

import os
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once at startup before accepting requests.
    Order:
      1. Download NLTK data
      2. Initialize database tables
      3. Load SentenceTransformer (shared by Q&A, Summary, Reading)
      4. Build the vector store from existing uploads
      5. Initialize the Exam MCQ generator (loads spaCy)
    """
    logger.info("=" * 60)
    logger.info("QuillMind API — Starting up…")
    logger.info("=" * 60)

    # 1. NLTK
    nltk.download("punkt",     quiet=True)
    nltk.download("punkt_tab", quiet=True)
    logger.info("[1/5] NLTK data ready.")

    # 2. Database
    init_db()
    logger.info("[2/5] Database initialized.")

    # 3. Sentence Transformer
    load_sentence_model()
    logger.info("[3/5] SentenceTransformer loaded.")

    # 4. Vector Store
    build_store()
    logger.info("[4/5] Vector store built from uploads.")

    # 5. MCQ Generator (spaCy)
    init_exam_workflow()
    logger.info("[5/5] MCQ Generator (spaCy) ready.")

    logger.info("=" * 60)
    logger.info("QuillMind API is ready.  Docs → http://127.0.0.1:8000/docs")
    logger.info("=" * 60)

    yield  # ← server is live here

    logger.info("QuillMind API — Shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan,
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(admin_router)
app.include_router(qa_router)
app.include_router(summary_router)
app.include_router(exam_router)
app.include_router(reading_router)
app.include_router(auth_router)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "app": APP_TITLE,
        "version": APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
