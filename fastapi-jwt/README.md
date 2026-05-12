# fastapi-jwt — API de Autenticación y Productos

Este servicio hace dos cosas: **autenticar usuarios** con JWT y **gestionar un catálogo de productos**. Es el punto de entrada del sistema: todos los demás servicios y frontends dependen de él para obtener los tokens.

> Todos los datos viven en memoria. Al reiniciar el servidor, todo vuelve al estado inicial.

---

## Requisitos

- Python 3.10 o superior
- pip

---

## Instalación y arranque

```bash
cd fastapi-jwt

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Disponible en: **http://127.0.0.1:8000**
Swagger UI: **http://127.0.0.1:8000/docs**

---

## Cómo probarlo paso a paso

### 1. Login

Abre http://127.0.0.1:8000/docs → `POST /auth/login` → **Try it out**

```
username: admin
password: admin123
```

Respuesta:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### 2. Autorizar en Swagger

Haz clic en **Authorize** → pega el `access_token` → haz clic en **Authorize** → **Close**.
Ahora todos los candados están abiertos y puedes usar los endpoints protegidos.

### 3. Probar productos

- `GET /products` → lista los 5 productos precargados
- `GET /products/1` → devuelve solo el producto con id 1
- `POST /products` → crea un producto nuevo:
  ```json
  { "name": "Monitor 4K", "category": "Electrónica", "price": 499.99, "stock": 8 }
  ```
- `PUT /products/1` → reemplaza todos los campos del producto 1

### 4. Probar logout

- `POST /auth/logout` → el token actual queda invalidado
- Intenta usar `GET /products` con ese mismo token → recibirás **401**
- Haz login de nuevo y verás que todo funciona

### 5. Probar renovación de token

El access_token dura **3 minutos**. Espera a que expire y luego:

```bash
curl -s -X POST http://127.0.0.1:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "TU_REFRESH_TOKEN"}'
```

Recibirás un nuevo `access_token` sin tener que hacer login de nuevo.

---

## Usuarios disponibles

| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| admin   | admin123  | ADMIN |
| user    | user123   | USER  |

---

## Endpoints

| Método | Ruta           | Auth | Descripción                         |
|--------|----------------|------|-------------------------------------|
| POST   | /auth/login    | No   | Login con form (username + password)|
| POST   | /auth/refresh  | No   | Renueva el access_token             |
| POST   | /auth/logout   | Sí   | Invalida el access_token actual     |
| GET    | /products      | Sí   | Lista todos los productos           |
| GET    | /products/{id} | Sí   | Obtiene un producto por su ID       |
| POST   | /products      | Sí   | Crea un producto nuevo              |
| PUT    | /products/{id} | Sí   | Actualiza todos los campos          |

---

## Estructura del proyecto

```
fastapi-jwt/
├── app/
│   ├── main.py               ← Crea la app, configura CORS y registra rutas
│   ├── core/
│   │   ├── config.py         ← SECRET_KEY, tiempos de expiración, CORS
│   │   ├── security.py       ← Crear/verificar tokens, lista negra, usuarios
│   │   └── dependencies.py   ← get_current_user: valida token en cada request
│   ├── routers/
│   │   ├── auth.py           ← /auth/login, /auth/refresh, /auth/logout
│   │   └── products.py       ← CRUD de productos
│   └── schemas/
│       ├── auth.py           ← Modelos de token y respuestas de auth
│       └── product.py        ← Modelos de producto con validación Pydantic
└── requirements.txt
```

---

## Notas técnicas

- El `access_token` incluye un campo `jti` (UUID único). Al hacer logout, ese `jti` se guarda en un `set` de Python. Cualquier request posterior con ese token recibe 401 aunque el token no haya expirado.
- El login usa `OAuth2PasswordRequestForm`, que espera los datos como `application/x-www-form-urlencoded`, no como JSON. Los frontends y curl deben tenerlo en cuenta.
- El `SECRET_KEY` en `app/core/config.py` debe coincidir con el de `fastapi-orders` para que el token funcione en ambos servicios.
