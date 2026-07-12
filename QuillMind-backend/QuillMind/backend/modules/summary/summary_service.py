"""
QuillMind — Summary Maker Module Service
Accepts raw text or a PDF path and returns a structured AI summary via Groq (LLaMA 3).
"""

from typing import Dict

from shared.llm.groq_client import groq_chat
from shared.preprocessing.text_processor import extract_pdf_text, normalize_text
from shared.prompts.templates import summary_prompt
from shared.utils.logger import logger


def _chunk_for_summary(text: str, max_words: int = 1500) -> str:
    """
    Truncate text to `max_words` words so it fits within Groq's context window.
    """
    words = text.split()
    if len(words) <= max_words:
        return text
    logger.info(
        "Summary: text truncated from %d to %d words.", len(words), max_words
    )
    return " ".join(words[:max_words])


def summarize_text(text: str) -> Dict:
    """
    Generate a structured summary for raw text input.

    Args:
        text: Any plain text string.

    Returns:
        Dict with 'summary' and 'word_count' keys.
    """
    if not text or not text.strip():
        return {"summary": "No text provided.", "word_count": 0}

    text = normalize_text(text)
    truncated = _chunk_for_summary(text)
    prompt = summary_prompt(truncated)

    try:
        summary = groq_chat(prompt)
    except Exception as exc:
        logger.error("Summary Groq call failed: %s", exc)
        summary = f"[AI Error] {exc}"

    return {
        "summary": summary,
        "word_count": len(text.split()),
    }


def summarize_pdf(pdf_path: str) -> Dict:
    """
    Extract text from a PDF file and summarize it.

    Args:
        pdf_path: Absolute path to the PDF file.

    Returns:
        Dict with 'summary', 'word_count', and 'file' keys.
    """
    text = extract_pdf_text(pdf_path)
    print("PDF TEXT LENGTH:", len(text))
    print("FIRST 500 CHARS:")
    print(text[:500])
    if not text:
        return {
            "summary": "Could not extract any text from the PDF.",
            "word_count": 0,
            "file": pdf_path,
        }

    result = summarize_text(text)
    result["file"] = pdf_path
    return result
