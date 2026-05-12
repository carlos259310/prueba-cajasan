from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError

from app.core.dependencies import get_current_user
from app.core.security import (
    authenticate_user,
    blacklist_token,
    create_access_token,
    create_refresh_token,
    decode_token,
    is_blacklisted,
)
from app.schemas.auth import AccessToken, LogoutResponse, RefreshRequest, Token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión",
    description="Autentica al usuario con username y password. Retorna access_token (3 min) y refresh_token (1 día).",
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {"sub": user["username"], "role": user["role"]}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        token_type="bearer",
    )


@router.post(
    "/refresh",
    response_model=AccessToken,
    summary="Renovar access token",
    description="Genera un nuevo access_token a partir de un refresh_token válido.",
)
async def refresh_token(request: RefreshRequest):
    invalid_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(request.refresh_token)
    except JWTError:
        raise invalid_exc

    if payload.get("type") != "refresh":
        raise invalid_exc

    jti: str | None = payload.get("jti")
    if jti and is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El refresh token ha sido invalidado",
        )

    username: str | None = payload.get("sub")
    role: str | None = payload.get("role")
    if not username:
        raise invalid_exc

    return AccessToken(
        access_token=create_access_token({"sub": username, "role": role}),
        token_type="bearer",
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Cerrar sesión",
    description="Invalida el access token actual añadiendo su JTI a la lista negra en memoria.",
)
async def logout(current_user: dict = Depends(get_current_user)):
    blacklist_token(current_user["jti"])
    return LogoutResponse(message="Sesión cerrada exitosamente")
