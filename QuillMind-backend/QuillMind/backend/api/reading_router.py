# """
# QuillMind — Reading Application API Router
# """

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel

# from workflows.reading_workflow import (
#     run_get_page,
#     run_get_all_pages,
#     run_get_insight,
#     run_save_progress,
#     run_get_progress,
# )

# router = APIRouter(prefix="/reading", tags=["Reading App"])


# class ProgressSaveRequest(BaseModel):
#     username: str
#     filename: str
#     page: int


# @router.get("/page/")
# def get_page(filename: str, page: int = 1):
#     """
#     Get the text content of a specific page.

#     - **filename**: e.g. `science/chapter1.pdf`
#     - **page**: 1-based page number.
#     """
#     result = run_get_page(filename, page)
#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])
#     return result


# @router.get("/all-pages/")
# def get_all_pages(filename: str):
#     """Get all pages of a PDF as a list."""
#     result = run_get_all_pages(filename)
#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])
#     return result


# @router.get("/insight/")
# def get_insight(filename: str, page: int = 1):
#     """Get AI comprehension insight (mini-summary + questions) for a page."""
#     result = run_get_insight(filename, page)
#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])
#     return result


# @router.post("/progress/save/")
# def save_progress(body: ProgressSaveRequest):
#     """Save a user's reading progress (last page read)."""
#     return run_save_progress(body.username, body.filename, body.page)


# @router.get("/progress/")
# def get_progress(username: str, filename: str):
#     """Retrieve a user's last-read page for a document."""
#     return run_get_progress(username, filename)


"""
QuillMind — Reading Application API Router (v2)
Supports: PDF, scanned docs, handwritten notes, images, screenshots, tables.
New endpoints: /extract, /chat
"""

from typing import List, Optional
from fastapi import APIRouter, File, Form, UploadFile, Depends
from shared.utils.auth import get_current_user
from pydantic import BaseModel
import os, shutil
from fastapi import HTTPException
from shared.utils.history import save_history

from shared.vectorstore.folder_store import build_store

from config.settings import UPLOAD_DIR
from workflows.reading_workflow import (
    run_extract_document,
    run_get_page,
    run_get_all_pages,
    run_get_insight,
    run_chat_with_document,
    run_save_progress,
    run_get_progress,
)

router = APIRouter(prefix="/reading", tags=["Reading App v2"])

ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif", ".gif"
}


# ── Upload ─────────────────────────────────────────────────────────────────────

@router.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for reading.
    Accepts: PDF, JPG, PNG, WEBP, BMP, TIFF, GIF (scans, handwriting, screenshots, tables).
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    for old_file in os.listdir(UPLOAD_DIR):
        path = os.path.join(UPLOAD_DIR, old_file)

        if os.path.isfile(path):
            os.remove(path)

    # doc_folder = os.path.join(UPLOAD_DIR, "all")
    # os.makedirs(doc_folder, exist_ok=True)
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    build_store()

    # Auto-extract immediately so first read is fast
    result = run_extract_document(file.filename)
    if "error" in result:
        return {"filename": file.filename, "uploaded": True, "extraction_error": result["error"]}
    save_history(
        "admin",
        "reading",
        file.filename
    )

    return {
        "filename": file.filename,
        "uploaded": True,
        "total_pages": result.get("total_pages"),
        "method": result.get("method"),
        "file_type": result.get("file_type"),
    }


# ── Extract ────────────────────────────────────────────────────────────────────

@router.get("/extract/")
def extract_document(filename: str):
    """
    Extract all content from a document.
    Automatically applies OCR for scanned files / images.
    Returns page-by-page text, method used, and file type.
    """
    result = run_extract_document(filename)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── Page Reading ───────────────────────────────────────────────────────────────

@router.get("/page/")
def get_page(filename: str, page: int = 1):
    """Get the extracted text of a specific page (1-indexed)."""
    result = run_get_page(filename, page)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/all-pages/")
def get_all_pages(filename: str):
    """Get all extracted pages as a list."""
    result = run_get_all_pages(filename)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── AI Insight ─────────────────────────────────────────────────────────────────

@router.get("/insight/")
def get_insight(filename: str, page: int = 1):
    """
    Get AI comprehension insight for a page:
    mini-summary, key terms, comprehension questions, layout notes.
    """
    result = run_get_insight(filename, page)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── Chat with Document ─────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    filename: str
    question: str
    page: Optional[int] = None          # None = search whole document
    chat_history: Optional[List[dict]] = None   # [{"role": "user"|"assistant", "content": "..."}]


@router.post("/chat/")
def chat_with_document(
    body: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    Ask a question about the document.
    The AI answers using only the document content.
    Supports multi-turn chat via chat_history.
    Optionally scope to a specific page.
    """
    result = run_chat_with_document(
        body.filename, body.question, body.page, body.chat_history
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    save_history(
        user["username"],
        "reading",
        f"{body.filename}: {body.question}",
        1
    )
    return result

# ── Progress ───────────────────────────────────────────────────────────────────

class ProgressSaveRequest(BaseModel):
    username: str
    filename: str
    page: int


@router.post("/progress/save/")
def save_progress(body: ProgressSaveRequest):
    """Save a user's reading progress (last page read)."""
    return run_save_progress(body.username, body.filename, body.page)


@router.get("/progress/")
def get_progress(username: str, filename: str):
    """Retrieve a user's last-read page for a document."""
    return run_get_progress(username, filename)
