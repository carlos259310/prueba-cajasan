from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from app.core.security import decode_token

# El tokenUrl apunta al servicio de auth (fastapi-jwt) para que Swagger muestre el botón Authorize
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_token(token)
        username: str | None = payload.get("sub")
        if not username or payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username, "role": payload.get("role")}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
