# """
# QuillMind — Reading Application Module Service
# Provides page-by-page PDF reading, progress tracking, and AI-powered
# per-page comprehension insights via Groq (LLaMA 3).
# """

# import os
# from typing import Dict, List

# from shared.preprocessing.text_processor import extract_pdf_pages
# from shared.llm.groq_client import groq_chat
# from shared.prompts.templates import reading_insight_prompt
# from database.db import get_db
# from config.settings import UPLOAD_DIR
# from shared.utils.logger import logger


# # ── Page Reading ───────────────────────────────────────────────────────────────

# def get_pdf_page(filename: str, page_number: int) -> Dict:
#     """
#     Return the text content of a specific page in a PDF.

#     Args:
#         filename:    Filename (including sub-folder), e.g. "science/notes.pdf".
#         page_number: 1-based page number.
#     """
#     pdf_path = os.path.join(UPLOAD_DIR, filename)

#     if not os.path.exists(pdf_path):
#         return {"error": f"File '{filename}' not found.", "page": page_number}

#     pages = extract_pdf_pages(pdf_path)
#     total = len(pages)

#     if total == 0:
#         return {"error": "No text could be extracted from this PDF.", "page": page_number}

#     page_number = max(1, min(page_number, total))   # clamp
#     content = pages[page_number - 1]

#     return {
#         "filename": filename,
#         "page": page_number,
#         "total_pages": total,
#         "content": content or "[No text on this page]",
#     }


# def get_pdf_all_pages(filename: str) -> Dict:
#     """Return all pages of a PDF as a list of strings."""
#     pdf_path = os.path.join(UPLOAD_DIR, filename)
#     if not os.path.exists(pdf_path):
#         return {"error": f"File '{filename}' not found."}

#     pages = extract_pdf_pages(pdf_path)
#     return {
#         "filename": filename,
#         "total_pages": len(pages),
#         "pages": pages,
#     }


# # ── AI Insights ────────────────────────────────────────────────────────────────

# def get_page_insight(filename: str, page_number: int) -> Dict:
#     """
#     Ask Groq (LLaMA 3) for comprehension questions and a mini-summary
#     for a single PDF page.
#     """
#     page_data = get_pdf_page(filename, page_number)
#     if "error" in page_data:
#         return page_data

#     page_text = page_data["content"]
#     prompt = reading_insight_prompt(page_text)

#     try:
#         insight = groq_chat(prompt)
#     except Exception as exc:
#         logger.error("Reading insight Groq call failed: %s", exc)
#         insight = f"[AI Error] {exc}"

#     return {
#         "filename": filename,
#         "page": page_number,
#         "insight": insight,
#     }


# # ── Progress Tracking ──────────────────────────────────────────────────────────

# def save_reading_progress(username: str, filename: str, page: int) -> Dict:
#     """Persist the user's current reading page for a file."""
#     with get_db() as conn:
#         existing = conn.execute(
#             "SELECT id FROM reading_sessions WHERE username=? AND filename=?",
#             (username, filename),
#         ).fetchone()

#         if existing:
#             conn.execute(
#                 "UPDATE reading_sessions SET page=?, updated_at=datetime('now') "
#                 "WHERE username=? AND filename=?",
#                 (page, username, filename),
#             )
#         else:
#             conn.execute(
#                 "INSERT INTO reading_sessions (username, filename, page) VALUES (?,?,?)",
#                 (username, filename, page),
#             )

#     return {"username": username, "filename": filename, "saved_page": page}


# def get_reading_progress(username: str, filename: str) -> Dict:
#     """Retrieve the user's last-read page for a file."""
#     with get_db() as conn:
#         row = conn.execute(
#             "SELECT page, updated_at FROM reading_sessions "
#             "WHERE username=? AND filename=?",
#             (username, filename),
#         ).fetchone()

#     if not row:
#         return {"username": username, "filename": filename, "last_page": 1}

#     return {
#         "username": username,
#         "filename": filename,
#         "last_page": row["page"],
#         "last_read_at": row["updated_at"],
#     }




"""
QuillMind — Enhanced Reading Module Service (v2)
Supports: PDF, scanned documents, handwritten notes, images, screenshots, tables.
Technologies: OCR (Tesseract/pytesseract), Vision (PIL), Layout analysis, Chat with document.
"""

import os
import base64
import io
from typing import Dict, List, Optional

from shared.llm.groq_client import groq_chat
from database.db import get_db
from config.settings import UPLOAD_DIR
from shared.utils.logger import logger

# ── Extraction helpers ────────────────────────────────────────────────────────

def _extract_pdf_text_layer(pdf_path: str) -> List[str]:
    """Try digital text layer extraction first (fast, lossless)."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return [page.extract_text() or "" for page in reader.pages]
    except Exception as exc:
        logger.warning("PyPDF2 extraction failed: %s", exc)
        return []


def _pdf_has_text(pages: List[str], threshold: int = 30) -> bool:
    """Return True if enough text was extracted (not a pure scan)."""
    total = sum(len(p.strip()) for p in pages)
    return total >= threshold


def _ocr_image(image) -> str:
    """Run Tesseract OCR on a PIL Image object."""
    try:
        import pytesseract
        return pytesseract.image_to_string(image, config="--psm 3")
    except Exception as exc:
        logger.error("OCR failed: %s", exc)
        return ""


def _pdf_page_to_image(pdf_path: str, page_number: int):
    """Rasterize a single PDF page to PIL Image (requires pdf2image / poppler)."""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, first_page=page_number,
                                   last_page=page_number, dpi=200)
        return images[0] if images else None
    except Exception as exc:
        logger.warning("pdf2image failed (poppler may be missing): %s", exc)
        return None


def _open_image(file_path: str):
    """Open any image file as a PIL Image."""
    try:
        from PIL import Image
        img = Image.open(file_path)
        img.load()
        return img
    except Exception as exc:
        logger.error("Image open failed: %s", exc)
        return None


def _image_to_base64(image) -> Optional[str]:
    """Convert PIL Image to base64 JPEG string for vision prompt."""
    try:
        buf = io.BytesIO()
        image.convert("RGB").save(buf, format="JPEG", quality=85)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return None


# ── File type detection ───────────────────────────────────────────────────────

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif", ".gif"}
PDF_EXTENSION    = ".pdf"

def _detect_file_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext == PDF_EXTENSION:
        return "pdf"
    if ext in IMAGE_EXTENSIONS:
        return "image"
    return "unknown"


# ── Core Extraction: unified entry point ─────────────────────────────────────

def extract_document(filename: str) -> Dict:
    """
    Extract content from any supported file type.
    Returns {"pages": [...], "total_pages": N, "method": "...", "file_type": "..."}
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": f"File '{filename}' not found."}

    file_type = _detect_file_type(filename)

    if file_type == "pdf":
        return _extract_pdf(file_path, filename)
    elif file_type == "image":
        return _extract_image(file_path, filename)
    else:
        return {"error": f"Unsupported file type. Supported: PDF, JPG, PNG, WEBP, BMP, TIFF."}


def _extract_pdf(pdf_path: str, filename: str) -> Dict:
    """Smart PDF extraction: text layer first, OCR fallback per page."""
    pages_text = _extract_pdf_text_layer(pdf_path)

    if not _pdf_has_text(pages_text):
        # Scanned PDF — OCR every page
        logger.info("'%s' appears scanned. Running OCR.", filename)
        ocr_pages = []
        total_pages = len(pages_text) if pages_text else _count_pdf_pages(pdf_path)
        for i in range(1, total_pages + 1):
            img = _pdf_page_to_image(pdf_path, i)
            if img:
                text = _ocr_image(img)
                ocr_pages.append(text or f"[Page {i}: OCR returned no text]")
            else:
                ocr_pages.append(f"[Page {i}: could not rasterize]")
        return {
            "filename": filename,
            "total_pages": len(ocr_pages),
            "pages": ocr_pages,
            "method": "ocr",
            "file_type": "pdf",
        }
    else:
        # Digital PDF with text layer — use it directly; OCR any blank pages
        final_pages = []
        for i, text in enumerate(pages_text):
            if len(text.strip()) < 30:
                img = _pdf_page_to_image(pdf_path, i + 1)
                if img:
                    text = _ocr_image(img) or text
            final_pages.append(text)
        return {
            "filename": filename,
            "total_pages": len(final_pages),
            "pages": final_pages,
            "method": "text_layer+ocr_fallback",
            "file_type": "pdf",
        }


def _extract_image(image_path: str, filename: str) -> Dict:
    """Extract text from a single image (handwriting, screenshot, table, etc.)."""
    img = _open_image(image_path)
    if img is None:
        return {"error": f"Could not open image '{filename}'."}

    text = _ocr_image(img)
    return {
        "filename": filename,
        "total_pages": 1,
        "pages": [text or "[No text detected in image]"],
        "method": "ocr",
        "file_type": "image",
        "image_size": img.size,
    }


def _count_pdf_pages(pdf_path: str) -> int:
    try:
        from PyPDF2 import PdfReader
        return len(PdfReader(pdf_path).pages)
    except Exception:
        return 0


# ── Page Reading ──────────────────────────────────────────────────────────────

def get_document_page(filename: str, page_number: int) -> Dict:
    """Return the extracted text of a single page (1-indexed)."""
    result = extract_document(filename)
    if "error" in result:
        return result

    total = result["total_pages"]
    page_number = max(1, min(page_number, total))
    content = result["pages"][page_number - 1]

    return {
        "filename": filename,
        "page": page_number,
        "total_pages": total,
        "content": content or "[No text on this page]",
        "method": result.get("method"),
        "file_type": result.get("file_type"),
    }


def get_document_all_pages(filename: str) -> Dict:
    """Return all extracted pages."""
    result = extract_document(filename)
    return result


# ── AI Insight: per-page comprehension ───────────────────────────────────────

def get_page_insight(filename: str, page_number: int) -> Dict:
    """Generate AI comprehension insight for a single page."""
    page_data = get_document_page(filename, page_number)
    if "error" in page_data:
        return page_data

    page_text = page_data["content"]
    if "[No text" in page_text or len(page_text.strip()) < 20:
        return {
            "filename": filename,
            "page": page_number,
            "insight": "[Insufficient text on this page to generate insight.]",
        }

    prompt = f"""You are an academic reading assistant. Analyze the content below and provide:

1. **Mini Summary** — 2-3 sentences summarizing this content.
2. **Key Terms** — List 3-5 important terms or concepts.
3. **Comprehension Questions** — Write 2 questions a student should answer after reading this.
4. **Visual/Layout Notes** — If this appears to be a table, diagram, or form, briefly describe its structure.

--- CONTENT ---
{page_text[:3000]}"""

    try:
        insight = groq_chat(prompt)
    except Exception as exc:
        logger.error("Reading insight Groq call failed: %s", exc)
        insight = f"[AI Error] {exc}"

    return {
        "filename": filename,
        "page": page_number,
        "insight": insight,
        "file_type": page_data.get("file_type"),
        "method": page_data.get("method"),
    }


# ── Chat with Document ────────────────────────────────────────────────────────

def chat_with_document(filename: str, question: str,
                       page_number: Optional[int] = None,
                       chat_history: Optional[List[Dict]] = None) -> Dict:
    """
    Answer a question grounded in the document content.
    If page_number is given, use that page only; otherwise use all text (truncated).
    """
    if page_number is not None:
        page_data = get_document_page(filename, page_number)
        if "error" in page_data:
            return page_data
        context = page_data["content"]
        context_desc = f"page {page_number}"
    else:
        all_pages = get_document_all_pages(filename)
        if "error" in all_pages:
            return all_pages
        full_text = "\n\n".join(
            f"[Page {i+1}]\n{p}" for i, p in enumerate(all_pages["pages"])
        )
        context = full_text[:8000]   # keep within LLM context window
        context_desc = "entire document"

    history_text = ""
    if chat_history:
        history_lines = []
        for turn in chat_history[-6:]:   # last 3 exchanges
            role = turn.get("role", "user")
            msg  = turn.get("content", "")
            history_lines.append(f"{role.capitalize()}: {msg}")
        history_text = "\n".join(history_lines) + "\n"

    prompt = f"""You are an intelligent document assistant. Answer the user's question using ONLY the document content below.
If the answer is not in the document, say: "I couldn't find that in the document."

--- DOCUMENT CONTENT ({context_desc}) ---
{context}

--- CONVERSATION HISTORY ---
{history_text}
--- CURRENT QUESTION ---
{question}

--- ANSWER ---
Provide a clear, accurate answer based solely on the document content above."""

    try:
        answer = groq_chat(prompt)
    except Exception as exc:
        logger.error("Chat with document Groq call failed: %s", exc)
        answer = f"[AI Error] {exc}"

    return {
        "filename": filename,
        "question": question,
        "answer": answer,
        "context_used": context_desc,
        "file_type": all_pages.get("file_type") if page_number is None else None,
    }


# ── Progress Tracking ─────────────────────────────────────────────────────────

def save_reading_progress(username: str, filename: str, page: int) -> Dict:
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM reading_sessions WHERE username=? AND filename=?",
            (username, filename),
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE reading_sessions SET page=?, updated_at=datetime('now') "
                "WHERE username=? AND filename=?",
                (page, username, filename),
            )
        else:
            conn.execute(
                "INSERT INTO reading_sessions (username, filename, page) VALUES (?,?,?)",
                (username, filename, page),
            )
    return {"username": username, "filename": filename, "saved_page": page}


def get_reading_progress(username: str, filename: str) -> Dict:
    with get_db() as conn:
        row = conn.execute(
            "SELECT page, updated_at FROM reading_sessions "
            "WHERE username=? AND filename=?",
            (username, filename),
        ).fetchone()
    if not row:
        return {"username": username, "filename": filename, "last_page": 1}
    return {
        "username": username,
        "filename": filename,
        "last_page": row["page"],
        "last_read_at": row["updated_at"],
    }
