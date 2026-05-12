from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, products

app = FastAPI(
    title="FastAPI JWT Auth",
    description=(
        "API REST con autenticación JWT usando python-jose. "
        "Incluye login, refresh token, logout y CRUD de productos en memoria."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)


@app.get("/", tags=["Root"], summary="Health check")
async def root():
    return {
        "message": "FastAPI JWT Authentication API",
        "docs": "/docs",
        "redoc": "/redoc",
    }
