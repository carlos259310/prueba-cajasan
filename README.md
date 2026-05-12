# FastAPI JWT + React Client

Monorepo con dos proyectos:

| Proyecto | Descripción | Puerto |
|----------|-------------|--------|
| [`fastapi-jwt/`](fastapi-jwt/) | API REST con autenticación JWT (Python + FastAPI) | 8000 |
| [`react-jwt-client/`](react-jwt-client/) | Cliente web que consume la API (React + Vite + Tailwind) | 5173 |

---

## Inicio rápido

### 1. Levantar el backend (FastAPI)

```bash
cd fastapi-jwt
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponible en: http://127.0.0.1:8000  
Documentación Swagger: http://127.0.0.1:8000/docs

### 2. Levantar el frontend (React)

```bash
cd react-jwt-client
npm install
npm run dev
```

App disponible en: http://localhost:5173

---

## Usuarios de prueba

| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| admin   | admin123  | ADMIN |
| user    | user123   | USER  |
