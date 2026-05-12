# Monorepo — FastAPI JWT + Orders

Este repositorio tiene **4 proyectos** que trabajan juntos como un sistema real: dos backends en Python (FastAPI) y dos frontends en React (Vite + Tailwind).

---

## ¿Qué hay aquí?

```
Carlos-Rodriguez/
├── fastapi-jwt/          ← API de autenticación y productos  (puerto 8000)
├── fastapi-orders/       ← API de órdenes de compra          (puerto 8001)
├── react-jwt-client/     ← Frontend para productos           (puerto 5173)
└── react-orders-client/  ← Frontend para órdenes             (puerto 5174)
```

### La idea general

`fastapi-jwt` es el **guardián**: hace el login y emite los tokens JWT.
`fastapi-orders` es el **servicio de negocio**: gestiona órdenes y confía en esos mismos tokens.
Los dos frontends son las **interfaces visuales** de cada servicio.

Lo interesante: **el mismo usuario y contraseña funciona en los dos frontends** porque comparten el servicio de autenticación.

---

## Requisitos previos

- **Python 3.10 o superior** (el código usa la sintaxis `str | None` de Python 3.10)
- **Node.js 18 o superior**
- **pip** y **npm**

---

## Cómo levantar todo

Necesitas **4 terminales abiertas al mismo tiempo**.

### Terminal 1 — fastapi-jwt (auth + productos)

```bash
cd fastapi-jwt
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Cuando veas `Uvicorn running on http://127.0.0.1:8000`, está listo.

### Terminal 2 — fastapi-orders (órdenes)

```bash
cd fastapi-orders
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Cuando veas `Uvicorn running on http://127.0.0.1:8001`, está listo.

> **Importante:** `fastapi-jwt` debe estar corriendo antes de usar `fastapi-orders` o cualquiera de los frontends, porque el login siempre pasa por el puerto 8000.

### Terminal 3 — react-jwt-client (frontend de productos)

```bash
cd react-jwt-client
npm install
npm run dev
```

Abre http://localhost:5173 en el navegador.

### Terminal 4 — react-orders-client (frontend de órdenes)

```bash
cd react-orders-client
npm install
npm run dev
```

Abre http://localhost:5174 en el navegador.

---

## Cómo probar que todo conecta

### Opción A — Probar con los frontends (lo más fácil)

1. Abre http://localhost:5173 → te pide login → ingresa `admin` / `admin123`
2. Verás la lista de productos. Crea uno nuevo, edita otro. Todo debe funcionar.
3. Abre una pestaña nueva con http://localhost:5174 → ingresa con el mismo usuario
4. Verás las órdenes. Crea una nueva orden con artículos separados por coma.

Si ambas pantallas muestran datos y puedes crear registros, **todo está conectado correctamente**.

### Opción B — Probar con Swagger (útil para entender la API)

**Paso 1: Obtener un token desde fastapi-jwt**

1. Abre http://127.0.0.1:8000/docs
2. Busca `POST /auth/login` → haz clic en **Try it out**
3. Ingresa:
   ```
   username: admin
   password: admin123
   ```
4. Ejecuta y copia el valor de `access_token` de la respuesta

**Paso 2: Autorizar en fastapi-jwt y probar productos**

1. Haz clic en el botón **Authorize** (arriba a la derecha en Swagger)
2. Pega el token en el campo `bearerAuth` → haz clic en **Authorize**
3. Ahora puedes usar `GET /products`, `POST /products`, etc.

**Paso 3: Autorizar en fastapi-orders y probar órdenes**

1. Abre http://127.0.0.1:8001/docs en otra pestaña
2. Haz clic en **Authorize** → pega el **mismo token** que copiaste antes
3. Prueba `GET /orders` → deberías ver las 3 órdenes precargadas
4. Prueba `POST /orders` con este body:
   ```json
   {
     "customerName": "Tu Nombre",
     "items": ["Camiseta", "Zapatos"]
   }
   ```

Si los dos Swagger responden con datos, **los dos backends están funcionando con el mismo token**.

### Opción C — Probar con curl desde la terminal

```bash
# 1. Login → guarda el access_token
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"

# 2. Con ese token, consulta productos (reemplaza TOKEN por el valor real)
curl -s http://127.0.0.1:8000/products \
  -H "Authorization: Bearer TOKEN"

# 3. Con el mismo token, consulta órdenes
curl -s http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TOKEN"

# 4. Crear una orden nueva
curl -s -X POST http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Ana García", "items": ["Bolso", "Cinturón"]}'
```

---

## Usuarios disponibles

| Usuario | Contraseña | Rol   | Qué puede hacer |
|---------|-----------|-------|-----------------|
| admin   | admin123  | ADMIN | Todo            |
| user    | user123   | USER  | Todo (mismos permisos en esta demo) |

---

## Cómo funciona el token JWT (explicado simple)

1. El usuario hace login → `fastapi-jwt` genera dos tokens:
   - **access_token**: dura **3 minutos**, se usa en cada petición
   - **refresh_token**: dura **1 día**, solo sirve para renovar el access_token

2. Cuando el access_token expira, el frontend lo renueva automáticamente con el refresh_token (el usuario no nota nada)

3. Al hacer logout, el access_token se agrega a una **lista negra** en memoria: aunque no haya expirado, ya no funciona

4. `fastapi-orders` **no tiene login propio**: valida los tokens con la misma clave secreta que `fastapi-jwt`

---

## Resumen de endpoints

### fastapi-jwt — http://127.0.0.1:8000

| Método | Ruta              | Auth | Descripción               |
|--------|-------------------|------|---------------------------|
| POST   | /auth/login       | No   | Login, retorna tokens     |
| POST   | /auth/refresh     | No   | Renueva el access_token   |
| POST   | /auth/logout      | Sí   | Invalida el access_token  |
| GET    | /products         | Sí   | Lista todos los productos |
| GET    | /products/{id}    | Sí   | Un producto por ID        |
| POST   | /products         | Sí   | Crea un producto          |
| PUT    | /products/{id}    | Sí   | Actualiza un producto     |

### fastapi-orders — http://127.0.0.1:8001

| Método | Ruta           | Auth | Descripción            |
|--------|----------------|------|------------------------|
| GET    | /orders        | Sí   | Lista todas las órdenes |
| GET    | /orders/{id}   | Sí   | Una orden por ID       |
| POST   | /orders        | Sí   | Crea una orden nueva   |

---

## Problemas frecuentes

**"No se pudo conectar" o error de red en el frontend**
→ Verifica que los dos backends estén corriendo. Revisa las 4 terminales.

**401 Unauthorized al usar Swagger en fastapi-orders**
→ El token dura solo 3 minutos. Si tardaste más de 3 min, vuelve a fastapi-jwt, haz login de nuevo y copia el token fresco.

**Puerto ya en uso (address already in use)**
→ Otro proceso ocupa ese puerto. Cambia el puerto: `uvicorn app.main:app --reload --port 8002`

**Error al instalar dependencias de Python**
→ Asegúrate de estar dentro del entorno virtual (`venv\Scripts\activate`) antes de correr `pip install`.

**El frontend no carga los datos aunque el backend esté corriendo**
→ Abre las DevTools del navegador (F12) → pestaña Console → revisa si hay errores de CORS o de red.
