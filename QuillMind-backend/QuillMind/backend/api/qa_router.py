"""
QuillMind — Q&A API Router
Two endpoints:
  - /qa/ask/     → PDF-based Q&A (searches uploaded documents)
  - /qa/general/ → General conversational Q&A (direct AI chat, no PDFs needed)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from shared.utils.history import save_history
from fastapi import APIRouter, File, Form, UploadFile, Depends
from shared.utils.auth import get_current_user

from workflows.qa_workflow import run_qa
from modules.qa.general_qa_service import general_answer

router = APIRouter(prefix="/qa", tags=["Q&A"])


class QARequest(BaseModel):
    question: str
    subject: str = "all"
    document_id: str | None = None


class GeneralQARequest(BaseModel):
    question: str


# @router.post("/ask/")
# def ask_question(body: QARequest):
#     """
#     PDF-based Q&A — answers questions from uploaded documents.

#     - **question**: Your natural-language question.
#     - **subject**: Subject folder to search (default: "all").
#     """
#     return run_qa(body.question, body.subject)
#     save_history(
#         user["username"],
#         "doc-qa",
#         body.question,
#         1
#     )

#     return result

@router.post("/ask/")
def ask_question(
    body: QARequest,
    user: dict = Depends(get_current_user)
):
    result = run_qa(body.question, body.subject, body.document_id)

    save_history(
        user["username"],
        "doc-qa",
        body.question,
        1
    )

    return result


# @router.post("/general/")
# def general_question(body: GeneralQARequest):
#     """
#     General conversational Q&A — answers any question directly via AI.
#     No PDFs or uploads required. Supports small talk, general knowledge,
#     concept explanations, and academic help.

#     - **question**: Any question or message.
#     """
#     return general_answer(body.question)
#     save_history(
#         user["username"],
#         "chat",
#         body.question,
#         1
#     )

#     return result

@router.post("/general/")
def general_question(
    body: GeneralQARequest,
    user: dict = Depends(get_current_user)
):
    result = general_answer(body.question)

    save_history(
        user["username"],
        "chat",
        body.question,
        1
    )

    return result
