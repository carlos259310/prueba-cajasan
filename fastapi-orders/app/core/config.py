class Settings:
    # Debe coincidir con el SECRET_KEY de fastapi-jwt para aceptar los mismos tokens
    SECRET_KEY: str = "super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]


settings = Settings()
