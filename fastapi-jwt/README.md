# fastapi-jwt — Autenticación y Productos

Este servicio hace dos cosas: autenticar usuarios con JWT y gestionar un catálogo de productos. Es el núcleo del sistema: todos los demás servicios dependen de él para obtener los tokens.

> Los datos viven en memoria. Al reiniciar el servidor, todo vuelve al estado inicial.

---

## Requisitos

- Python 3.10 o superior

Para verificar: `python --version`

---

## Instalación

```powershell
cd fastapi-jwt

# Crea el entorno virtual
python -m venv .venv

# Actívalo (Windows)
.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

# Instala las dependencias
pip install -r requirements.txt
```

> Si Activate.ps1 falla por permisos de ejecución, ejecuta esto una sola vez:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## Arrancar el servidor

```powershell
uvicorn app.main:app --reload
```

Cuando aparezca `Uvicorn running on http://127.0.0.1:8000`, el servidor está listo.

- API: http://127.0.0.1:8000
- Swagger (documentación interactiva): http://127.0.0.1:8000/docs

---

## Usuarios disponibles

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin123   | ADMIN |
| user    | user123    | USER  |

---

## Cómo probarlo paso a paso

### 1. Hacer login

Abre http://127.0.0.1:8000/docs → busca `POST /auth/login` → **Try it out**

Ingresa:
```
username: admin
password: admin123
```

Recibirás:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### 2. Autorizar en Swagger

Para probar los endpoints protegidos necesitas el token:

1. Copia el valor de `access_token`
2. Haz clic en **Authorize** (arriba a la derecha)
3. Pega el token → **Authorize** → **Close**

Ahora los candados están abiertos y puedes usar todos los endpoints.

### 3. Probar los productos

Con el token activo, prueba estos endpoints:

- `GET /products` → lista los 5 productos precargados
- `GET /products/1` → devuelve el producto con id 1
- `POST /products` → crea un producto nuevo:
  ```json
  { "name": "Monitor 4K", "category": "Electrónica", "price": 499.99, "stock": 8 }
  ```
- `PATCH /products/1` → actualiza los campos del producto 1

### 4. Probar el logout

1. `POST /auth/logout` → el token queda invalidado
2. Intenta `GET /products` con ese mismo token → recibirás **401**
3. Haz login de nuevo y verás que todo funciona normalmente

### 5. Probar el refresh de token

El access_token dura solo **3 minutos**. Cuando expire, el frontend lo renueva automáticamente. Para probarlo manualmente:

```bash
curl -s -X POST http://127.0.0.1:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "TU_REFRESH_TOKEN"}'
```

Recibirás un access_token nuevo sin hacer login de nuevo.

---

## Endpoints

| Método | Ruta           | Token | Descripción                          |
|--------|----------------|-------|--------------------------------------|
| POST   | /auth/login    | No    | Login con username y password        |
| POST   | /auth/refresh  | No    | Renueva el access_token              |
| POST   | /auth/logout   | Sí    | Invalida el access_token actual      |
| GET    | /products      | Sí    | Lista todos los productos            |
| GET    | /products/{id} | Sí    | Devuelve un producto por su ID       |
| POST   | /products      | Sí    | Crea un producto nuevo               |
| PATCH  | /products/{id} | Sí    | Actualiza los campos de un producto  |

---

## Cómo está organizado el código

```
fastapi-jwt/
├── app/
│   ├── main.py               ← Crea la app, configura CORS y registra las rutas
│   ├── core/
│   │   ├── config.py         ← SECRET_KEY, duración de tokens, orígenes CORS
│   │   ├── security.py       ← Crear y verificar tokens, lista negra, usuarios
│   │   └── dependencies.py   ← get_current_user: valida el token en cada request
│   ├── routers/
│   │   ├── auth.py           ← /auth/login, /auth/refresh, /auth/logout
│   │   └── products.py       ← CRUD de productos
│   └── schemas/
│       ├── auth.py           ← Modelos de tokens y respuestas de autenticación
│       └── product.py        ← Modelo de producto con validación Pydantic
└── requirements.txt
```

---

## Detalles técnicos

- El login usa `OAuth2PasswordRequestForm`, que espera los datos como `application/x-www-form-urlencoded`, no como JSON. Los frontends ya lo manejan correctamente.
- Cada access_token lleva un campo `jti` (un UUID único). Al hacer logout, ese `jti` se guarda en un set de Python. Aunque el token no haya expirado, el backend lo rechazará si está en esa lista.
- El `SECRET_KEY` en `app/core/config.py` debe ser idéntico al de `fastapi-orders`. Si los cambias, cámbialos en los dos.
