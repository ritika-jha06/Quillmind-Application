# """
# QuillMind — Exam Workflow
# Holds the MCQGenerator singleton and orchestrates MCQ generation requests.
# """

# from typing import List, Dict
# from modules.exam.mcq_generator import MCQGenerator
# from shared.preprocessing.text_processor import extract_pdf_text
# from shared.utils.logger import logger

# _generator: MCQGenerator | None = None


# def init_exam_workflow() -> None:
#     """Load the spaCy model once at startup."""
#     global _generator
#     if _generator is None:
#         _generator = MCQGenerator()
#         logger.info("Exam workflow: MCQGenerator ready.")


# def _get_generator() -> MCQGenerator:
#     if _generator is None:
#         init_exam_workflow()
#     return _generator  # type: ignore


# def run_exam_from_text(text: str, num_questions: int = 10) -> List[Dict]:
#     """Generate MCQs from raw text."""
#     logger.info("Exam workflow — text input, requesting %d questions.", num_questions)
#     return _get_generator().generate_mcqs(text, num_questions)


# def run_exam_from_pdf(pdf_path: str, num_questions: int = 10) -> List[Dict]:
#     """Extract text from a PDF and generate MCQs."""
#     logger.info("Exam workflow — PDF: '%s', requesting %d questions.", pdf_path, num_questions)
#     text = extract_pdf_text(pdf_path)
#     if not text.strip():
#         logger.warning("Exam workflow: no text extracted from '%s'.", pdf_path)
#         return []
#     return _get_generator().generate_mcqs(text, num_questions)




"""
QuillMind — Exam Workflow
=========================
Manages the MCQGenerator singleton and orchestrates MCQ generation requests
from both raw text and PDF inputs.

What changed from v1
--------------------
* ``run_exam_from_text`` now accepts an optional *difficulty* argument
  ("easy" | "medium" | "hard" | "mixed") and passes it to the generator.
* ``run_exam_from_pdf`` likewise accepts *difficulty*.
* ``init_exam_workflow`` now initialises MCQGenerator (Flan-T5-base) instead
  of the spaCy-based MCQGenerator — no other module is affected.
* All public signatures remain backwards-compatible: callers that omit
  *difficulty* get "mixed" by default (same visible behaviour as before).
"""

from typing import List, Dict

from modules.exam.mcq_generator import MCQGenerator
from shared.preprocessing.text_processor import extract_pdf_text
from shared.utils.logger import logger

# ---------------------------------------------------------------------------
# Module-level singleton — loaded once at startup, reused for every request
# ---------------------------------------------------------------------------
_generator: MCQGenerator | None = None


def init_exam_workflow() -> None:
    """
    Initialise the MCQGenerator singleton.

    Called once from the application startup hook (e.g. FastAPI lifespan or
    app startup event).  Safe to call multiple times — subsequent calls are
    no-ops.

    The first call triggers Flan-T5-base download / cache load (~250 MB on
    first run, instant on subsequent runs).
    """
    global _generator
    if _generator is None:
        logger.info("Exam workflow: initialising MCQGenerator (Flan-T5-base) …")
        _generator = MCQGenerator()
        logger.info("Exam workflow: MCQGenerator ready.")


def _get_generator() -> MCQGenerator:
    """Return the singleton, initialising it lazily if not yet done."""
    if _generator is None:
        init_exam_workflow()
    return _generator  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Public helpers called by the router
# ---------------------------------------------------------------------------

def run_exam_from_text(
    text:          str,
    num_questions: int = 10,
    difficulty:    str = "mixed",
) -> List[Dict]:
    """
    Generate MCQs from a raw text string.

    Parameters
    ----------
    text          : source text (any length)
    num_questions : how many questions to produce (default 10)
    difficulty    : "easy" | "medium" | "hard" | "mixed" (default "mixed")

    Returns
    -------
    List of MCQ dicts compatible with the frontend schema.
    """
    logger.info(
        "Exam workflow — text input: %d chars, %d questions requested, difficulty=%s.",
        len(text), num_questions, difficulty,
    )
    return _get_generator().generate_mcqs(text, num_questions, difficulty)


def run_exam_from_pdf(
    pdf_path:      str,
    num_questions: int = 10,
    difficulty:    str = "mixed",
) -> List[Dict]:
    """
    Extract text from a PDF file, then generate MCQs from it.

    Parameters
    ----------
    pdf_path      : absolute path to the temporary PDF file
    num_questions : how many questions to produce (default 10)
    difficulty    : "easy" | "medium" | "hard" | "mixed" (default "mixed")

    Returns
    -------
    List of MCQ dicts, or an empty list if the PDF yields no usable text.
    """
    logger.info(
        "Exam workflow — PDF: '%s', %d questions requested, difficulty=%s.",
        pdf_path, num_questions, difficulty,
    )
    text = extract_pdf_text(pdf_path)
    if not text.strip():
        logger.warning(
            "Exam workflow: no text could be extracted from '%s'.", pdf_path
        )
        return []
    return _get_generator().generate_mcqs(text, num_questions, difficulty)