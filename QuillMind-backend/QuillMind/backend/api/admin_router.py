"""
QuillMind — Admin Router
Handles authentication, sub-admin management, and PDF file operations.
"""

import base64
import hashlib
import os
import shutil
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from config.settings import UPLOAD_DIR
from database.db import get_db
from shared.utils.auth import create_token, get_current_user
from shared.vectorstore.folder_store import build_store
from shared.utils.logger import logger
from shared.utils.auth import (
    create_token,
    get_current_user,
    require_role
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Pydantic Models ────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class SubAdminCreate(BaseModel):
    name: str
    email: str
    password: str


class SubAdminDelete(BaseModel):
    id: int | None = None
    username: str | None = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


# ── Auth Endpoints ─────────────────────────────────────────────────────────────

@router.post("/login/")
def login(data: LoginRequest):
    print("USERNAME:", data.username)
    print("PASSWORD:", data.password)
    print("HASH:", _hash(data.password))

    with get_db() as conn:
        rows = conn.execute(
            "SELECT username, password, role FROM admins"
        ).fetchall()

    print("ALL ADMINS:")
    for r in rows:
        print(dict(r))

    with get_db() as conn:
        row = conn.execute(
            "SELECT username, role FROM admins WHERE username=? AND password=?",
            (data.username, _hash(data.password)),
        ).fetchone()

    print("DB RESULT:", row)

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_token(row["username"], row["role"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": row["username"],
            "role": row["role"]
        }
    }

@router.post("/token/")
def get_token(data: LoginRequest):
    """Return only the JWT token string."""
    return login(data)


# ── Sub-Admin Management ───────────────────────────────────────────────────────

@router.post("/sub-admins/add/")
def add_sub_admin(
    data: SubAdminCreate,
    _: dict = Depends(require_role("admin")),
):
    """Create a new sub-admin account."""

    username = data.name.strip()

    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM admins WHERE username=?",
            (username,),
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username already exists."
            )

        conn.execute(
            "INSERT INTO admins (username, password, role) VALUES (?,?,?)",
            (
                username,
                _hash(data.password),
                "sub_admin"
            ),
        )

    logger.info("Sub-admin '%s' created.", username)

    return {
        "message": f"Sub-admin '{username}' created successfully.",
        "username": username,
        "email": data.email
    }


@router.delete("/sub-admins/delete/")
def delete_sub_admin(
    data: SubAdminDelete,
    _: dict = Depends(require_role("admin"))
):
    """Delete a sub-admin account."""

    with get_db() as conn:

        if data.username:
            conn.execute(
                "DELETE FROM admins WHERE username=? AND role='sub_admin'",
                (data.username,),
            )

        elif data.id:
            conn.execute(
                "DELETE FROM admins WHERE id=? AND role='sub_admin'",
                (data.id,),
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="username or id required."
            )

    return {"message": "Sub-admin deleted."}


@router.get("/sub-admins/")
# def list_sub_admins(_: dict = Depends(get_current_user)):
def list_users():
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT
                id,
                username,
                role,
                created_at
            FROM admins
            WHERE role='sub_admin'
            """
        ).fetchall()

    return [
        {
            "id": r["id"],
            "name": r["username"],
            "email": f"{r['username']}@quillmind.ai",
            "added": r["created_at"],
            "permissions": []
        }
        for r in rows
    ]


# ── File Management ────────────────────────────────────────────────────────────

@router.post("/upload/{folder}/")
async def upload_files(
    folder: str,
    file: UploadFile = File(...),
    _: dict = Depends(require_role("admin", "sub_admin"))
):
    """Upload a PDF to a subject folder."""
    folder_path = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(folder_path, exist_ok=True)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=f"'{file.filename}' is not a PDF."
        )

    dest = os.path.join(folder_path, file.filename)

    with open(dest, "wb") as out:
        shutil.copyfileobj(file.file, out)

    logger.info(
        "Uploaded '%s' to folder '%s'.",
        file.filename,
        folder
    )

    build_store()

    return {
        "folder": folder,
        "uploaded": [file.filename]
    }


@router.delete("/delete/{folder}/{filename}/")
def delete_file(
    folder: str,
    filename: str,
    # _: str = Depends(get_current_user),
    _: dict = Depends(require_role("admin", "sub_admin"))
):
    """Delete a specific file from a subject folder."""
    path = os.path.join(UPLOAD_DIR, folder, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found.")
    os.remove(path)
    build_store()
    return {"message": f"'{filename}' deleted from '{folder}'."}


@router.post("/reload/")
def reload_store(_: dict = Depends(require_role("admin"))):
    """Manually rebuild the vector index from disk."""
    build_store()
    return {"message": "Vector store rebuilt successfully."}


@router.get("/view/")
def view_all(_: dict = Depends(require_role("admin", "sub_admin"))):
    """List all folders and files in the uploads directory."""
    result = {}
    if not os.path.exists(UPLOAD_DIR):
        return result
    for folder in os.listdir(UPLOAD_DIR):
        folder_path = os.path.join(UPLOAD_DIR, folder)
        if os.path.isdir(folder_path):
            result[folder] = os.listdir(folder_path)
    return result


@router.get("/view/{folder}/")
def view_folder(folder: str, _: dict = Depends(require_role("admin", "sub_admin"))):
    """List files in a specific subject folder."""
    folder_path = os.path.join(UPLOAD_DIR, folder)
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail=f"Folder '{folder}' not found.")
    return {"folder": folder, "files": os.listdir(folder_path)}


@router.get("/download/{folder}/{filename}")
def download_file(
    folder: str,
    filename: str,
    _: dict = Depends(require_role("admin", "sub_admin")),
):
    """Download a single file as base64-encoded content."""
    path = os.path.join(UPLOAD_DIR, folder, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found.")
    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode()
    return {"filename": filename, "folder": folder, "content_base64": encoded}


@router.post("/download/{folder}/")
def download_multiple(
    folder: str,
    filenames: List[str],
    _: dict = Depends(get_current_user),
):
    """Download multiple files as base64."""
    result = []
    for filename in filenames:
        path = os.path.join(UPLOAD_DIR, folder, filename)
        if os.path.exists(path):
            with open(path, "rb") as f:
                result.append({
                    "filename": filename,
                    "content_base64": base64.b64encode(f.read()).decode(),
                })
    return result


@router.get("/users/")
# def list_users(_: dict = Depends(get_current_user)):
def list_users():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT
                id,
                username,
                email,
                created_at
            FROM users
            ORDER BY id DESC
        """).fetchall()

    return [dict(r) for r in rows]

@router.get("/history/")
def get_history(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM activity_history
            WHERE username = ?
            ORDER BY created_at DESC
            """,
            (user["username"],)
        ).fetchall()

    return [dict(r) for r in rows]
