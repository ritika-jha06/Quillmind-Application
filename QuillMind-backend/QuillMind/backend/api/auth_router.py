"""
QuillMind — User Authentication Router
Handles user registration, login, profile and password reset.
"""

import hashlib
from fastapi import UploadFile, File
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from database.db import get_db
from shared.utils.auth import create_token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class UpdateProfileRequest(BaseModel):
    full_name: str = ""
    bio: str = ""
    institution: str = ""


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ──────────────────────────────────────────────
# Register
# ──────────────────────────────────────────────

@router.post("/register/")
def register(data: RegisterRequest):

    with get_db() as conn:

        existing_user = conn.execute(
            """
            SELECT id
            FROM users
            WHERE username=? OR email=?
            """,
            (data.username, data.email)
        ).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username or Email already exists."
            )

        conn.execute(
            """
            INSERT INTO users
            (username, email, password)
            VALUES (?, ?, ?)
            """,
            (
                data.username,
                data.email,
                hash_password(data.password)
            )
        )

    return {
        "message": "User registered successfully."
    }


# ──────────────────────────────────────────────
# Login
# ──────────────────────────────────────────────

@router.post("/login/")
def login(data: LoginRequest):

    with get_db() as conn:

        user = conn.execute(
            """
            SELECT username,email
            FROM users
            WHERE email=? AND password=?
            """,
            (
                data.email,
                hash_password(data.password)
            )
        ).fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    token = create_token(user["username"], "user")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "role": "user"
        }
    }


# ──────────────────────────────────────────────
# Profile
# ──────────────────────────────────────────────

# @router.get("/me/")
# def get_profile(
#     username: str = Depends(get_current_user)
# ):

#     with get_db() as conn:

#         user = conn.execute(
#             """
#             SELECT id,
#                    username,
#                    email,
#                    created_at
#             FROM users
#             WHERE username=?
#             """,
#             (username,)
#         ).fetchone()

#     if not user:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found."
#         )

#     return dict(user)

@router.get("/me/")
def get_profile(
    current_user = Depends(get_current_user)
):

    username = current_user["username"]

    with get_db() as conn:

        user = conn.execute(
            """
            SELECT id,
                username,
                email,
                full_name,
                bio,
                institution,
                avatar,
                created_at
            FROM users
            WHERE username=?
            """,
            (username,)
        ).fetchone()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        **dict(user),
        "role": current_user["role"]
    }


@router.put("/me/")
def update_profile(
    data: UpdateProfileRequest,
    current_user=Depends(get_current_user)
):
    with get_db() as conn:
        conn.execute(
            """
            UPDATE users
            SET full_name=?,
                bio=?,
                institution=?
            WHERE username=?
            """,
            (
                data.full_name,
                data.bio,
                data.institution,
                current_user["username"]
            )
        )

    return {
        "message": "Profile updated successfully"
    }


#----------------------------------------------
# Avatar
#----------------------------------------------

@router.post("/avatar/")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    avatar_dir = "uploads/avatars"
    os.makedirs(avatar_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    filename = f"{current_user['username']}{ext}"
    filepath = os.path.join(avatar_dir, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with get_db() as conn:
        conn.execute(
            """
            UPDATE users
            SET avatar=?
            WHERE username=?
            """,
            (
                filepath,
                current_user["username"]
            )
        )

    return {
        "avatar": filepath
    }



# ──────────────────────────────────────────────
# Forgot Password
# ──────────────────────────────────────────────

@router.post("/forgot-password/")
def forgot_password(
    data: ForgotPasswordRequest
):

    with get_db() as conn:

        user = conn.execute(
            """
            SELECT id
            FROM users
            WHERE email=?
            """,
            (data.email,)
        ).fetchone()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Email not found."
            )

        conn.execute(
            """
            UPDATE users
            SET password=?
            WHERE email=?
            """,
            (
                hash_password(data.new_password),
                data.email
            )
        )

    return {
        "message": "Password updated successfully."
    }