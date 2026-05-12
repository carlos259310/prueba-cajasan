from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import orders

app = FastAPI(
    title="Orders API",
    description="Servicio de gestión de órdenes. Requiere token JWT emitido por el servicio de autenticación (fastapi-jwt).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Orders API corriendo", "docs": "/docs"}
