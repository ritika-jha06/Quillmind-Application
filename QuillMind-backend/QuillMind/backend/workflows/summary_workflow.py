"""
QuillMind — Summary Workflow
Thin orchestration layer between the API router and the Summary service.
"""

from modules.summary.summary_service import summarize_text, summarize_pdf
from shared.utils.logger import logger


def run_summary_text(text: str) -> dict:
    """Summarize raw text input."""
    logger.info("Summary workflow — text input (%d chars).", len(text))
    return summarize_text(text)


def run_summary_pdf(pdf_path: str) -> dict:
    """Summarize a PDF file."""
    logger.info("Summary workflow — PDF: '%s'.", pdf_path)
    return summarize_pdf(pdf_path)
