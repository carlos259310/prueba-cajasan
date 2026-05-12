from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.security import decode_token, is_blacklisted

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_token(token)
    except JWTError:
        raise _UNAUTHORIZED

    username: str | None = payload.get("sub")
    jti: str | None = payload.get("jti")
    token_type: str | None = payload.get("type")
    role: str | None = payload.get("role")

    if not username or not jti or token_type != "access":
        raise _UNAUTHORIZED

    if is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha sido invalidado. Por favor inicia sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"username": username, "jti": jti, "role": role}
