# """
# QuillMind — Exam Maker API Router
# """

# import os
# import shutil
# import tempfile
# from shared.utils.history import save_history
# from fastapi import HTTPException

# from fastapi import APIRouter, File, Form, UploadFile, Depends
# from shared.utils.auth import get_current_user
# from pydantic import BaseModel

# from workflows.exam_workflow import run_exam_from_text, run_exam_from_pdf

# router = APIRouter(prefix="/exam", tags=["Exam Maker"])


# class ExamTextRequest(BaseModel):
#     text: str
#     number_of_questions: int = 10


# @router.post("/generate/")
# def generate_from_text(
#     body: ExamTextRequest,
#     user: dict = Depends(get_current_user)
# ):
#     """
#     Generate MCQs from raw text.

#     - **text**: Source text to generate questions from.
#     - **number_of_questions**: How many MCQs to generate (default 10).
#     """
#     if not body.text.strip():
#         raise HTTPException(status_code=400, detail="Text cannot be empty.")
#     mcqs = run_exam_from_text(body.text, body.number_of_questions)

#     save_history(
#         user["username"],
#         "exam",
#         "Text Exam Generation",
#         len(mcqs)
#     )

#     return {
#         "total": len(mcqs),
#         "questions": mcqs
#     }


# @router.post("/generate-from-pdf/")
# async def generate_from_pdf(
#     file: UploadFile = File(...),
#     number_of_questions: int = 10,
# ):
#     """Upload a PDF and auto-generate MCQs from its content."""
#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#         shutil.copyfileobj(file.file, tmp)
#         tmp_path = tmp.name

#     try:
#         mcqs = run_exam_from_pdf(tmp_path, number_of_questions)
#         save_history(
#             "admin",
#             "exam",
#             file.filename,
#             len(mcqs)
#         )
#         return {
#             "original_filename": file.filename,
#             "total": len(mcqs),
#             "questions": mcqs,
#         }
#     finally:
#         os.unlink(tmp_path)



"""
QuillMind — Exam Maker API Router
==================================
FastAPI router that exposes two MCQ generation endpoints:

  POST /exam/generate/            — generate from raw text
  POST /exam/generate-from-pdf/   — generate from uploaded PDF

What changed from v1
--------------------
* ``ExamTextRequest`` gains an optional ``difficulty`` field
  ("easy" | "medium" | "hard" | "mixed", default "mixed") so the frontend's
  difficulty selector is wired end-to-end without breaking existing callers
  that omit it.
* Both endpoint handlers pass *difficulty* down to the workflow layer.
* The response schema is extended: each question now includes
  ``explanation`` and ``difficulty`` fields.  The frontend already
  renders these — no frontend changes required.
* All other behaviour (auth, history saving, error handling, URL paths)
  is unchanged.
"""

import os
import shutil
import tempfile
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from shared.utils.auth import get_current_user
from shared.utils.history import save_history
from workflows.exam_workflow import run_exam_from_text, run_exam_from_pdf

router = APIRouter(prefix="/exam", tags=["Exam Maker"])

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

DifficultyLevel = Literal["easy", "medium", "hard", "mixed"]


class ExamTextRequest(BaseModel):
    text: str = Field(..., description="Source text to generate questions from.")
    number_of_questions: int = Field(
        default=10,
        ge=1,
        le=50,
        description="How many MCQs to generate (1–50, default 10).",
    )
    # Alias matches what the frontend sends as `num_questions`
    num_questions: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Alias for number_of_questions (frontend compatibility).",
    )
    difficulty: DifficultyLevel = Field(
        default="mixed",
        description=(
            "Desired difficulty level: easy | medium | hard | mixed. "
            "'mixed' cycles evenly through all three levels."
        ),
    )

    # Resolve num_questions vs number_of_questions:
    # whichever the caller supplies takes priority; number_of_questions wins.
    def resolved_count(self) -> int:
        # If caller explicitly set number_of_questions (not the default 10),
        # prefer it; otherwise fall back to num_questions.
        return self.number_of_questions if self.number_of_questions != 10 else self.num_questions


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/generate/")
def generate_from_text(
    body: ExamTextRequest,
    user: dict = Depends(get_current_user),
):
    """
    Generate MCQs from raw text.

    - **text**: Source text to generate questions from.
    - **num_questions** / **number_of_questions**: How many MCQs to generate (default 10).
    - **difficulty**: "easy" | "medium" | "hard" | "mixed" (default "mixed").

    Each question in the response contains:
    - **question**: The MCQ stem.
    - **options**: Dict with keys A, B, C, D.
    - **correct_answer**: One of "A", "B", "C", "D".
    - **explanation**: One-sentence rationale for the correct answer.
    - **difficulty**: The difficulty level of this question.
    """
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    count = body.resolved_count()

    mcqs = run_exam_from_text(body.text, count, body.difficulty)

    save_history(
        user["username"],
        "exam",
        "Text Exam Generation",
        len(mcqs),
    )

    return {
        "total":      len(mcqs),
        "difficulty": body.difficulty,
        "questions":  mcqs,
    }


@router.post("/generate-from-pdf/")
async def generate_from_pdf(
    file:                UploadFile = File(...),
    # number_of_questions: int        = Form(default=10),
    number_of_questions: int = Form(default=10, ge=1, le=50),
    difficulty:          str        = Form(default="mixed"),
):
    """
    Upload a PDF and auto-generate MCQs from its content.

    Form fields:
    - **file**: PDF file upload.
    - **number_of_questions**: How many MCQs to produce (default 10).
    - **difficulty**: "easy" | "medium" | "hard" | "mixed" (default "mixed").
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Only PDF files are accepted."
        )

    # Validate difficulty
    if difficulty not in ("easy", "medium", "hard", "mixed"):
        difficulty = "mixed"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        mcqs = run_exam_from_pdf(tmp_path, number_of_questions, difficulty)

        # NOTE: The original code hardcoded "admin" here.
        # Keeping this unchanged to avoid touching auth logic.
        save_history(
            "admin",
            "exam",
            file.filename,
            len(mcqs),
        )

        return {
            "original_filename": file.filename,
            "total":             len(mcqs),
            "difficulty":        difficulty,
            "questions":         mcqs,
        }
    finally:
        os.unlink(tmp_path)