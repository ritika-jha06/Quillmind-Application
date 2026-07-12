"""
QuillMind — Q&A Workflow
Thin orchestration layer between the API router and the Q&A service.
"""

from modules.qa.qa_service import answer_question
from shared.utils.logger import logger


def run_qa(question: str, subject: str = "all", document_id: str | None = None) -> dict:
    """
    Orchestrate a Q&A request.

    Args:
        question: User's question.
        subject:  Target subject folder (default "all").

    Returns:
        Dict from qa_service.answer_question.
    """
    logger.info("QA workflow — question: '%s', subject: '%s'.", question, subject)
    result = answer_question(question, subject, document_id)
    logger.info("QA workflow — chunks_used: %d.", result.get("chunks_used", 0))
    return result
