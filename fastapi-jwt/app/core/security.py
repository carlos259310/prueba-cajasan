import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt

from app.core.config import settings

# ── In-memory stores ──────────────────────────────────────────────────────────

token_blacklist: set[str] = set()

USERS_DB: dict[str, dict] = {
    "admin": {"username": "admin", "password": "admin123", "role": "ADMIN"},
    "user":  {"username": "user",  "password": "user123",  "role": "USER"},
}

# ── User helpers ──────────────────────────────────────────────────────────────

def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = USERS_DB.get(username)
    if not user or user["password"] != password:
        return None
    return user

# ── Token helpers ─────────────────────────────────────────────────────────────

def _build_token(data: dict, expires_delta: timedelta, token_type: str) -> str:
    payload = data.copy()
    payload.update({
        "exp": datetime.now(timezone.utc) + expires_delta,
        "jti": str(uuid.uuid4()),
        "type": token_type,
    })
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: dict) -> str:
    return _build_token(
        data,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access",
    )


def create_refresh_token(data: dict) -> str:
    return _build_token(
        data,
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "refresh",
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

# ── Blacklist helpers ─────────────────────────────────────────────────────────

def blacklist_token(jti: str) -> None:
    token_blacklist.add(jti)


def is_blacklisted(jti: str) -> bool:
    return jti in token_blacklist
