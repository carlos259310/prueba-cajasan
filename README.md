# Sistema de Autenticación y Órdenes — FastAPI + React

Este repositorio tiene cuatro proyectos que trabajan juntos: dos backends en Python y dos frontends en React. La idea es simple: te autenticas una sola vez y ese mismo token te sirve para usar los dos servicios.

---

## Clonar e iniciar desde cero

```powershell
git clone https://github.com/carlos259310/prueba-cajasan.git
cd prueba-cajasan
```

Luego sigue las instrucciones de la sección **Cómo levantar el sistema** más abajo. En total necesitas Python 3.10+ y Node.js 18+ instalados en tu máquina.

```
Carlos-Rodriguez/
├── fastapi-jwt/          → API de login y productos    (puerto 8000)
├── fastapi-orders/       → API de órdenes de compra   (puerto 8001)
├── react-jwt-client/     → Interfaz de productos       (puerto 5173)
└── react-orders-client/  → Interfaz de órdenes         (puerto 5174)
```

---

## Lo que hace cada parte

**fastapi-jwt** es el punto de entrada. Aquí se hace login, se emiten los tokens JWT y se gestiona el catálogo de productos.

**fastapi-orders** es el servicio de negocio. Recibe y lista órdenes de compra. No tiene login propio: confía en los tokens que emitió `fastapi-jwt`, así que no tienes que autenticarte dos veces.

**react-jwt-client** es la pantalla de productos. Muestra la tabla de inventario y permite crear o editar artículos.

**react-orders-client** es la pantalla de órdenes. Permite ver y crear órdenes de compra. Usa el mismo login que el frontend de productos.

---

## Antes de empezar

Necesitas tener instalado:

- **Python 3.10 o superior** — verifica con `python --version`
- **Node.js 18 o superior** — verifica con `node --version`

Si no tienes Python instalado en Windows, la forma más rápida es:
```powershell
winget install Python.Python.3.12 --accept-package-agreements
```

Después cierra y abre la terminal para que se actualice el PATH.

---

## Cómo levantar el sistema

Necesitas **cuatro terminales abiertas al mismo tiempo**. Sigue el orden: primero los backends, luego los frontends.

### Terminal 1 — fastapi-jwt

```powershell
cd fastapi-jwt
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Espera hasta ver: `Uvicorn running on http://127.0.0.1:8000`

### Terminal 2 — fastapi-orders

```powershell
cd fastapi-orders
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Espera hasta ver: `Uvicorn running on http://127.0.0.1:8001`

### Terminal 3 — react-jwt-client

```powershell
cd react-jwt-client
npm install
npm run dev
```

Abre http://localhost:5173

### Terminal 4 — react-orders-client

```powershell
cd react-orders-client
npm install
npm run dev
```

Abre http://localhost:5174

> **Nota Windows:** Si el primer `Activate.ps1` falla con un error de permisos, ejecuta esto una sola vez y vuelve a intentarlo:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## Usuarios disponibles

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin123   | ADMIN |
| user    | user123    | USER  |

El mismo usuario funciona en los dos frontends.

---

## Cómo probar que todo conecta

### Opción 1 — Desde los frontends (la más fácil)

1. Abre http://localhost:5173 → ingresa `admin` / `admin123`
2. Deberías ver la lista de productos. Intenta crear uno nuevo.
3. Abre http://localhost:5174 en otra pestaña → ingresa con el mismo usuario
4. Deberías ver las órdenes precargadas. Crea una nueva.

Si ambas pantallas cargan datos y puedes crear registros, el sistema está funcionando completo.

### Opción 2 — Desde Swagger (para ver cómo funciona la API)

Swagger es la documentación interactiva que genera FastAPI automáticamente. Puedes probar los endpoints directamente desde el navegador, sin escribir código.

**Paso 1: Obtén un token**

1. Abre http://127.0.0.1:8000/docs
2. Haz clic en `POST /auth/login` → **Try it out**
3. Escribe `admin` en username y `admin123` en password → **Execute**
4. Copia el valor de `access_token` de la respuesta (el string largo que empieza con `eyJ`)

**Paso 2: Autorízate en fastapi-jwt**

1. Haz clic en el botón **Authorize** (arriba a la derecha)
2. Pega el token en el campo → **Authorize** → **Close**
3. Ahora puedes usar `GET /products`, `POST /products`, etc.

**Paso 3: Úsalo también en fastapi-orders**

1. Abre http://127.0.0.1:8001/docs en otra pestaña
2. Repite el paso 2 con el mismo token
3. Prueba `GET /orders` → verás las 3 órdenes de ejemplo
4. Prueba `POST /orders` con este body:
   ```json
   { "customerName": "Tu Nombre", "items": ["Camiseta", "Zapatos"] }
   ```

### Opción 3 — Desde la terminal con curl

```bash
# 1. Login
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"

# 2. Guarda el access_token y consulta productos (reemplaza TOKEN)
curl -s http://127.0.0.1:8000/products \
  -H "Authorization: Bearer TOKEN"

# 3. Con el mismo token, consulta órdenes
curl -s http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TOKEN"

# 4. Crea una orden
curl -s -X POST http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Ana García", "items": ["Bolso", "Cinturón"]}'
```

---

## Cómo funcionan los tokens JWT

El sistema usa dos tipos de token:

- **access_token**: dura **3 minutos**. Se envía en cada petición al backend.
- **refresh_token**: dura **1 día**. Solo se usa para renovar el access_token sin tener que hacer login de nuevo.

Cuando el access_token expira, los frontends lo renuevan automáticamente en segundo plano. El usuario no nota nada.

Al hacer logout, el access_token se añade a una lista negra en memoria. Aunque técnicamente no haya expirado, el backend lo rechaza. Al reiniciar el servidor, esa lista se vacía.

---

## Resumen de endpoints

### fastapi-jwt — http://127.0.0.1:8000

| Método | Ruta           | Requiere token | Descripción               |
|--------|----------------|----------------|---------------------------|
| POST   | /auth/login    | No             | Login, devuelve los tokens |
| POST   | /auth/refresh  | No             | Renueva el access_token   |
| POST   | /auth/logout   | Sí             | Invalida el access_token  |
| GET    | /products      | Sí             | Lista todos los productos |
| GET    | /products/{id} | Sí             | Un producto por ID        |
| POST   | /products      | Sí             | Crea un producto nuevo    |
| PUT    | /products/{id} | Sí             | Actualiza un producto     |

### fastapi-orders — http://127.0.0.1:8001

| Método | Ruta          | Requiere token | Descripción             |
|--------|---------------|----------------|-------------------------|
| GET    | /orders       | Sí             | Lista todas las órdenes |
| GET    | /orders/{id}  | Sí             | Una orden por ID        |
| POST   | /orders       | Sí             | Crea una orden nueva    |

---

## Problemas frecuentes

**"No se puede conectar al servidor" en el frontend**
Los dos backends tienen que estar corriendo. Verifica que las terminales 1 y 2 muestren el mensaje de Uvicorn sin errores.

**El token expira muy rápido**
El access_token dura solo 3 minutos a propósito (para demostrar el flujo de refresh). El frontend lo renueva solo, pero si estás probando desde Swagger y tardas más de 3 min, necesitas hacer login de nuevo y pegar el token fresco.

**Error "401 Unauthorized" en fastapi-orders aunque el token sea nuevo**
Revisa que el `SECRET_KEY` en `fastapi-jwt/app/core/config.py` y en `fastapi-orders/app/core/config.py` sea exactamente el mismo.

**PowerShell no deja activar el entorno virtual**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Solo hace falta ejecutarlo una vez.

**Puerto ya está en uso**
Cambia el puerto en el comando: `uvicorn app.main:app --reload --port 8002`

**El frontend carga pero no aparecen datos**
Abre las herramientas de desarrollo del navegador (F12) → pestaña **Console** o **Network**. Si hay errores de CORS, asegúrate de acceder al frontend por `localhost`, no por `127.0.0.1`.
