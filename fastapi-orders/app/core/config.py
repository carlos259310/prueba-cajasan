class Settings:
    # Debe coincidir con el SECRET_KEY de fastapi-jwt para aceptar los mismos tokens
    SECRET_KEY: str = "super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: list = ["*"]


settings = Settings()
