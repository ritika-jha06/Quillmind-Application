"""
QuillMind — JWT Authentication Utility
Handles token creation and validation.
"""

from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config.settings import JWT_SECRET, JWT_EXPIRY_HOURS
from shared.utils.logger import logger

security = HTTPBearer()
ALGORITHM = "HS256"


def create_token(username: str, role: str = "user") -> str:
    """Create a signed JWT for the given username."""
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises HTTPException on failure."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """FastAPI dependency — returns the username from a valid Bearer token."""
    payload = decode_token(credentials.credentials)
    # return payload["sub"]
    # "role": payload.get("role", "user")
    return {
        "username": payload["sub"],
        "role": payload.get("role", "user")
    }


def require_role(*roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return current_user

    return role_checker