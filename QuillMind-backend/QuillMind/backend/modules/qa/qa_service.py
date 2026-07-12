"""
QuillMind — Q&A Module Service
Retrieves semantically relevant chunks from the vector store
and sends them + the question to Groq (LLaMA 3) for a grounded answer.
"""

from typing import Dict

from shared.vectorstore.folder_store import get_subject
from shared.embeddings.sentence_encoder import top_k_chunks
from shared.llm.groq_client import groq_chat
from shared.prompts.templates import qa_prompt
from config.settings import TOP_K_RESULTS
from shared.utils.logger import logger


def answer_question(question: str, subject: str = "all", document_id: str | None = None) -> Dict:
    """
    Answer a question by:
      1. Retrieving the top-k most relevant chunks from the vector store.
      2. Building a grounded prompt with those chunks as context.
      3. Sending the prompt to Groq (LLaMA 3) and returning its response.

    Args:
        question: The user's question string.
        subject:  The subject folder to search ("all" searches everything).

    Returns:
        A dict with keys: "answer", "subject_used", "chunks_used".
    """
    data = get_subject(subject)

    if not data:
        logger.warning("Subject '%s' not in store; falling back to 'all'.", subject)
        data = get_subject("all")

    if not data:
        return {
            "answer": "No documents are indexed yet. Please upload PDFs first.",
            "subject_used": subject,
            "chunks_used": 0,
        }

    chunks     = data["chunks"]
    embeddings = data["embeddings"]

    relevant_chunks = top_k_chunks(question, chunks, embeddings, k=TOP_K_RESULTS)
    context = "\n\n".join(relevant_chunks)

    prompt = qa_prompt(context, question)

    try:
        answer = groq_chat(prompt)
    except Exception as exc:
        logger.error("Q&A Groq call failed: %s", exc)
        answer = f"[AI Error] {exc}"

    return {
        "answer": answer,
        "subject_used": subject,
        "chunks_used": len(relevant_chunks),
    }
