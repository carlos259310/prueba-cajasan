# FastAPI JWT Authentication

API REST construida con **FastAPI** y autenticación mediante **JSON Web Tokens (JWT)** usando la librería `python-jose`. Todos los datos (usuarios y productos) se almacenan en memoria, sin base de datos.

---

## Requisitos previos

- Python 3.11 o superior
- pip

---

## Instalación y ejecución

```bash
# 1. Clonar o descargar el proyecto
cd fastapi-jwt

# 2. (Opcional) Crear un entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Levantar el servidor de desarrollo
uvicorn app.main:app --reload
```

El servidor quedará disponible en: **http://127.0.0.1:8000**

---

## Documentación interactiva

| Interfaz  | URL                          |
|-----------|------------------------------|
| Swagger UI | http://127.0.0.1:8000/docs  |
| ReDoc      | http://127.0.0.1:8000/redoc |

---

## Usuarios disponibles (en memoria)

| Username | Password  | Rol   |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| user     | user123   | USER  |

---

## Estructura del proyecto

```
fastapi-jwt/
├── app/
│   ├── main.py               # Punto de entrada, configuración de la app y CORS
│   ├── core/
│   │   ├── config.py         # Configuración global (SECRET_KEY, tiempos de expiración)
│   │   ├── security.py       # Lógica JWT: crear, decodificar y blacklistear tokens
│   │   └── dependencies.py   # Dependencia get_current_user para proteger rutas
│   ├── routers/
│   │   ├── auth.py           # Endpoints de autenticación (login, refresh, logout)
│   │   └── products.py       # CRUD de productos (sin delete)
│   └── schemas/
│       ├── auth.py           # Modelos Pydantic para tokens y respuestas de auth
│       └── product.py        # Modelos Pydantic para productos
├── requirements.txt
└── README.md
```

---

## Endpoints de autenticación

### `POST /auth/login`

Autentica al usuario y retorna los tokens.

**Body** (`application/x-www-form-urlencoded`):
```
username=admin&password=admin123
```

**Respuesta exitosa** `200 OK`:
```json
{
  "access_token": "<token>",
  "refresh_token": "<token>",
  "token_type": "bearer"
}
```

> El `access_token` expira en **3 minutos**.  
> El `refresh_token` expira en **1 día**.

---

### `POST /auth/refresh`

Genera un nuevo `access_token` a partir de un `refresh_token` válido.

**Body** (`application/json`):
```json
{
  "refresh_token": "<refresh_token>"
}
```

**Respuesta exitosa** `200 OK`:
```json
{
  "access_token": "<nuevo_token>",
  "token_type": "bearer"
}
```

---

### `POST /auth/logout`

Invalida el `access_token` actual. El token se añade a una lista negra en memoria (set de Python), por lo que no podrá reutilizarse aunque no haya expirado.

**Header requerido**:
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa** `200 OK`:
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## Endpoints de productos

Todos los endpoints requieren el header de autorización:
```
Authorization: Bearer <access_token>
```

### `GET /products`

Retorna la lista completa de productos en memoria (incluye 5 productos de ejemplo al iniciar).

**Respuesta** `200 OK`:
```json
[
  { "id": 1, "name": "Laptop Pro 15", "category": "Electrónica", "price": 1299.99, "stock": 15 },
  ...
]
```

---

### `GET /products/{id}`

Retorna un producto por su ID.

**Respuesta** `200 OK`:
```json
{ "id": 1, "name": "Laptop Pro 15", "category": "Electrónica", "price": 1299.99, "stock": 15 }
```

**Error** `404 Not Found` si el producto no existe.

---

### `POST /products`

Crea un nuevo producto.

**Body** (`application/json`):
```json
{
  "name": "Monitor 4K",
  "category": "Electrónica",
  "price": 499.99,
  "stock": 30
}
```

**Respuesta** `201 Created`:
```json
{ "id": 6, "name": "Monitor 4K", "category": "Electrónica", "price": 499.99, "stock": 30 }
```

---

### `PUT /products/{id}`

Actualización completa de un producto. Todos los campos son obligatorios.

**Body** (`application/json`):
```json
{
  "name": "Monitor 4K UHD",
  "category": "Electrónica",
  "price": 549.99,
  "stock": 25
}
```

**Respuesta** `200 OK`:
```json
{ "id": 6, "name": "Monitor 4K UHD", "category": "Electrónica", "price": 549.99, "stock": 25 }
```

**Error** `404 Not Found` si el producto no existe.

---

## Seguridad

- Los tokens JWT se firman con el algoritmo **HS256**.
- Cada token contiene un campo `jti` (JWT ID) único generado con `uuid4`.
- Al hacer logout, el `jti` del token se guarda en un `set` de Python (`token_blacklist`), invalidando el token de forma inmediata sin necesidad de esperar su expiración.
- Para usar los endpoints protegidos en **Swagger UI**, haz clic en el botón **Authorize** e ingresa `Bearer <tu_token>`.

---

## Códigos de error HTTP

| Código | Descripción                                           |
|--------|-------------------------------------------------------|
| 401    | Token inválido, expirado, invalidado o no proporcionado |
| 404    | Recurso no encontrado                                 |
| 422    | Error de validación en el body o parámetros           |

---

## Configuración

Los valores por defecto se encuentran en [app/core/config.py](app/core/config.py):

| Variable                     | Valor por defecto                           | Descripción                    |
|------------------------------|---------------------------------------------|--------------------------------|
| `SECRET_KEY`                 | `super-secret-key-change-this-in-production`| Clave para firmar los JWT      |
| `ALGORITHM`                  | `HS256`                                     | Algoritmo de firma             |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `3`                                         | Expiración del access token    |
| `REFRESH_TOKEN_EXPIRE_DAYS`  | `1`                                         | Expiración del refresh token   |
| `CORS_ORIGINS`               | `["*"]`                                     | Orígenes permitidos para CORS  |

> **Nota:** En producción, cambia el `SECRET_KEY` por un valor secreto seguro y restringe `CORS_ORIGINS` a los dominios autorizados.
