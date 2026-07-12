"""
QuillMind — Text Preprocessing Utilities
PDF extraction, chunking, and text normalization.
"""

import re
from typing import List

from PyPDF2 import PdfReader  # type: ignore
from shared.utils.logger import logger


# def extract_pdf_text(pdf_path: str) -> str:
#     """
#     Extract all text from a PDF file as a single string.

#     Args:
#         pdf_path: Absolute path to the PDF.

#     Returns:
#         Concatenated text from all pages, or empty string on failure.
#     """
#     try:
#         reader = PdfReader(pdf_path)
#         pages = [page.extract_text() or "" for page in reader.pages]
#         text = "\n".join(pages)
#         logger.info("Extracted %d chars from '%s'.", len(text), pdf_path)
#         return text
#     except Exception as exc:
#         logger.error("PDF extraction failed for '%s': %s", pdf_path, exc)
#         return ""


# def extract_pdf_pages(pdf_path: str) -> List[str]:
#     """
#     Extract text page by page.

#     Returns:
#         List where index 0 = page 1 text, index 1 = page 2 text, etc.
#     """
#     try:
#         reader = PdfReader(pdf_path)
#         return [page.extract_text() or "" for page in reader.pages]
#     except Exception as exc:
#         logger.error("PDF page extraction failed for '%s': %s", pdf_path, exc)
#         return []


# def normalize_text(text: str) -> str:
#     """
#     Basic text normalization:
#     - Collapse multiple whitespace/newlines
#     - Strip leading/trailing whitespace
#     """
#     text = re.sub(r"\s+", " ", text)
#     return text.strip()


# def chunk_text(text: str, chunk_size: int = 400) -> List[str]:
#     """
#     Split text into overlapping word-based chunks.

#     Args:
#         text:       Input text string.
#         chunk_size: Maximum words per chunk.

#     Returns:
#         List of text chunk strings.
#     """
#     words = text.split()
#     if not words:
#         return []

#     chunks = []
#     step = max(1, int(chunk_size * 0.8))   # 20 % overlap

#     for i in range(0, len(words), step):
#         chunk = " ".join(words[i: i + chunk_size])
#         if chunk.strip():
#             chunks.append(chunk)

#     logger.debug("Chunked text into %d chunks (size=%d).", len(chunks), chunk_size)
#     return chunks


"""
QuillMind — Text Preprocessing Utilities (v2)
Unified extraction for PDFs, images, scanned docs, handwriting.
"""


def extract_pdf_text(pdf_path: str) -> str:
    """Extract all text from a PDF as a single string (digital PDFs only)."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages)
        logger.info("Extracted %d chars from '%s'.", len(text), pdf_path)
        return text
    except Exception as exc:
        logger.error("PDF extraction failed for '%s': %s", pdf_path, exc)
        return ""


def extract_pdf_pages(pdf_path: str) -> List[str]:
    """Extract text page-by-page (digital PDFs only)."""
    try:
        from PyPDF2 import PdfReader
        return [page.extract_text() or "" for page in PdfReader(pdf_path).pages]
    except Exception as exc:
        logger.error("PDF page extraction failed for '%s': %s", pdf_path, exc)
        return []


def ocr_image_file(image_path: str) -> str:
    """Run Tesseract OCR on any image file (PNG, JPG, TIFF, BMP, etc.)."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(image_path)
        return pytesseract.image_to_string(img, config="--psm 3")
    except Exception as exc:
        logger.error("OCR failed for '%s': %s", image_path, exc)
        return ""


def ocr_pdf_pages(pdf_path: str) -> List[str]:
    """
    Rasterize each page of a PDF and OCR it.
    Requires: pdf2image + poppler.
    Falls back to empty strings if poppler is not installed.
    """
    try:
        from pdf2image import convert_from_path
        import pytesseract
        images = convert_from_path(pdf_path, dpi=200)
        return [pytesseract.image_to_string(img, config="--psm 3") for img in images]
    except ImportError:
        logger.warning("pdf2image/pytesseract not available — OCR skipped.")
        return []
    except Exception as exc:
        logger.error("OCR PDF pages failed for '%s': %s", pdf_path, exc)
        return []


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 400) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    step = max(1, int(chunk_size * 0.8))
    for i in range(0, len(words), step):
        chunk = " ".join(words[i: i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    logger.debug("Chunked text into %d chunks (size=%d).", len(chunks), chunk_size)
    return chunks
