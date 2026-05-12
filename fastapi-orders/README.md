# fastapi-orders — Gestión de Órdenes

Este servicio permite crear y consultar órdenes de compra. No tiene login propio: usa el **mismo token** que emite `fastapi-jwt`. Ambos servicios comparten la clave secreta, así que te autenticas una sola vez y el token funciona en los dos.

> Los datos viven en memoria. Al reiniciar el servidor, todo vuelve al estado inicial.

---

## Requisitos

- Python 3.10 o superior
- `fastapi-jwt` corriendo en el puerto 8000 (necesitas un token para autenticarte)

---

## Instalación

```powershell
cd fastapi-orders

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
uvicorn app.main:app --reload --port 8001
```

Cuando aparezca `Uvicorn running on http://127.0.0.1:8001`, el servidor está listo.

- API: http://127.0.0.1:8001
- Swagger (documentación interactiva): http://127.0.0.1:8001/docs

---

## ¿Cómo se ve una orden?

```json
{
  "id": 1,
  "customerName": "Juan Pérez",
  "items": ["Camiseta", "Zapatos"],
  "status": "pending"
}
```

| Campo          | Descripción                                                                              |
|----------------|------------------------------------------------------------------------------------------|
| `id`           | Número entero asignado automáticamente al crear                                          |
| `customerName` | Nombre del cliente (mínimo 1 carácter)                                                   |
| `items`        | Lista de artículos (mínimo 1 elemento)                                                   |
| `status`       | Estado de la orden. Valores posibles: `pending`, `processing`, `completed`, `cancelled`. Siempre empieza en `pending` |

---

## Cómo probarlo paso a paso

### Paso 1: Obtén un token desde fastapi-jwt

**Desde Swagger (más fácil):**

1. Abre http://127.0.0.1:8000/docs
2. Busca `POST /auth/login` → **Try it out**
3. Ingresa `admin` / `admin123` → **Execute**
4. Copia el valor de `access_token`

**Desde la terminal:**
```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Paso 2: Autorízate en el Swagger de fastapi-orders

1. Abre http://127.0.0.1:8001/docs
2. Haz clic en **Authorize** (arriba a la derecha)
3. Pega el `access_token` → **Authorize** → **Close**

### Paso 3: Prueba los endpoints

**Listar todas las órdenes:**
```bash
curl -s http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TU_TOKEN"
```

**Obtener una orden por ID:**
```bash
curl -s http://127.0.0.1:8001/orders/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

**Crear una orden nueva:**
```bash
curl -s -X POST http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Ana García", "items": ["Bolso", "Cinturón", "Gorra"]}'
```

Respuesta esperada (`201 Created`):
```json
{
  "id": 4,
  "customerName": "Ana García",
  "items": ["Bolso", "Cinturón", "Gorra"],
  "status": "pending"
}
```

**Pedir un ID que no existe:**
```bash
curl -s http://127.0.0.1:8001/orders/99 \
  -H "Authorization: Bearer TU_TOKEN"
```

Respuesta esperada (`404 Not Found`):
```json
{ "detail": "Orden 99 no encontrada" }
```

---

## Endpoints

| Método | Ruta          | Token | Descripción                             |
|--------|---------------|-------|-----------------------------------------|
| GET    | /orders       | Sí    | Devuelve todas las órdenes              |
| GET    | /orders/{id}  | Sí    | Devuelve una orden específica por su ID |
| POST   | /orders       | Sí    | Crea una orden nueva (status = pending) |

---

## Datos precargados al iniciar

El servidor arranca con 3 órdenes de ejemplo:

| ID | Cliente        | Artículos                           | Estado      |
|----|----------------|-------------------------------------|-------------|
| 1  | Juan Pérez     | Camiseta, Zapatos                   | pending     |
| 2  | María García   | Laptop Pro 15                       | processing  |
| 3  | Carlos López   | Mouse Inalámbrico, Teclado Mecánico | completed   |

---

## Cómo está organizado el código

```
fastapi-orders/
├── app/
│   ├── main.py               ← Crea la app, configura CORS y registra las rutas
│   ├── core/
│   │   ├── config.py         ← SECRET_KEY (debe coincidir con fastapi-jwt)
│   │   ├── security.py       ← Solo decodifica tokens, no los genera
│   │   └── dependencies.py   ← get_current_user: valida el token en cada request
│   ├── routers/
│   │   └── orders.py         ← Los 3 endpoints de órdenes + datos en memoria
│   └── schemas/
│       └── order.py          ← OrderCreate (lo que envías) y Order (lo que recibes)
└── requirements.txt
```

---

## Nota sobre el SECRET_KEY

El `SECRET_KEY` en `app/core/config.py` debe ser idéntico al de `fastapi-jwt`. Así, el token que generó un servicio puede ser validado por el otro sin necesidad de una base de datos compartida ni comunicación entre servicios.

Si cambias el `SECRET_KEY` en uno, cámbialo también en el otro.
