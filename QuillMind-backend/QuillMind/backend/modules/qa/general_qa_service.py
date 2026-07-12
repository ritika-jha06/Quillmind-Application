"""
QuillMind — General Q&A Service
Direct conversational AI — answers any question or small talk
without needing uploaded PDFs or a vector store.
Powered by Groq (LLaMA 3).
"""

from shared.llm.groq_client import groq_chat
from shared.utils.logger import logger

SYSTEM_PROMPT = (
    "You are QuillMind, a friendly and knowledgeable academic assistant. "
    "You can answer general knowledge questions, help with studies, explain concepts, "
    "and have casual conversations. Be helpful, clear, and concise."
)


def general_answer(question: str) -> dict:
    """
    Answer any question directly using Groq — no documents needed.

    Args:
        question: Any question or message from the user.

    Returns:
        Dict with 'question' and 'answer' keys.
    """
    if not question or not question.strip():
        return {"question": question, "answer": "Please ask me something!"}

    logger.info("General Q&A — question: '%s'", question)

    try:
        answer = groq_chat(question, system=SYSTEM_PROMPT)
    except Exception as exc:
        logger.error("General Q&A Groq call failed: %s", exc)
        answer = f"[AI Error] {exc}"

    return {
        "question": question,
        "answer": answer,
    }
