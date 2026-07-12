"""
QuillMind — Summary API Router
"""

import os
import shutil
import tempfile

from fastapi import APIRouter, File, Form, UploadFile, Depends
from shared.utils.auth import get_current_user
from pydantic import BaseModel
from fastapi import HTTPException

from workflows.summary_workflow import run_summary_text, run_summary_pdf
from shared.utils.history import save_history

router = APIRouter(prefix="/summary", tags=["Summary"])


class SummaryTextRequest(BaseModel):
    text: str


@router.post("/text/")
def summarize_text(
    body: SummaryTextRequest,
    user: dict = Depends(get_current_user)
):
    if not body.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty."
        )

    result = run_summary_text(body.text)

    save_history(
        user["username"],
        "summary",
        "Text Summary"
    )

    return result


@router.post("/pdf/")
async def summarize_pdf(file: UploadFile = File(...)):
    """Upload a PDF and receive its AI-generated summary."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = run_summary_pdf(tmp_path)
        save_history(
            "admin",
            "summary",
            file.filename
        )
        result["original_filename"] = file.filename
        return result
    finally:
        os.unlink(tmp_path)
