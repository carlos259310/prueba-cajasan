# API de Órdenes — fastapi-orders

Este servicio gestiona órdenes de compra. Cada orden tiene un cliente, una lista de artículos y un estado. Todos los datos viven en memoria (no hay base de datos), lo que lo hace ideal para aprender y hacer pruebas rápidas.

> **Importante:** Este servicio NO tiene su propio login. Usa los tokens JWT que genera el servicio `fastapi-jwt` (puerto 8000). Ambos comparten la misma clave secreta, así que el mismo token funciona en los dos.

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

| Campo          | Tipo           | Descripción                                              |
|----------------|----------------|----------------------------------------------------------|
| `id`           | número entero  | Se asigna automáticamente, no lo envías al crear         |
| `customerName` | texto          | Nombre completo del cliente                              |
| `items`        | lista de texto | Artículos que incluye la orden                           |
| `status`       | texto fijo     | Se crea siempre como `pending`. Valores posibles: `pending`, `processing`, `completed`, `cancelled` |

---

## Instalación y ejecución

```bash
cd fastapi-orders

# (Opcional) entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

El servicio corre en: **http://127.0.0.1:8001**
Documentación interactiva: **http://127.0.0.1:8001/docs**

> Debes tener `fastapi-jwt` corriendo en el puerto 8000 antes de usar este servicio, porque necesitas un token para autenticarte.

---

## Cómo obtener un token para probar en Swagger

1. Arranca `fastapi-jwt`: `uvicorn app.main:app --reload` (puerto 8000)
2. Ve a http://127.0.0.1:8000/docs → POST `/auth/login`
3. Ingresa `admin` / `admin123` → copia el `access_token`
4. Ve a http://127.0.0.1:8001/docs → haz clic en **Authorize** → pega el token

---

## Endpoints

### `GET /orders` — Listar todas las órdenes

No necesitas enviar nada en el body. Solo el header de autorización.

**Respuesta `200 OK`:**
```json
[
  { "id": 1, "customerName": "Juan Pérez", "items": ["Camiseta", "Zapatos"], "status": "pending" },
  { "id": 2, "customerName": "María García", "items": ["Laptop Pro 15"], "status": "processing" }
]
```

---

### `GET /orders/{id}` — Obtener una orden por su ID

**Ejemplo:** `GET /orders/1`

**Respuesta `200 OK`:**
```json
{ "id": 1, "customerName": "Juan Pérez", "items": ["Camiseta", "Zapatos"], "status": "pending" }
```

**Si no existe → `404 Not Found`:**
```json
{ "detail": "Orden 99 no encontrada" }
```

---

### `POST /orders` — Crear una nueva orden

Solo envías `customerName` e `items`. El `id` y el `status` se asignan automáticamente.

**Body `application/json`:**
```json
{
  "customerName": "Carlos López",
  "items": ["Pantalón", "Cinturón", "Calcetines"]
}
```

**Respuesta `201 Created`:**
```json
{
  "id": 4,
  "customerName": "Carlos López",
  "items": ["Pantalón", "Cinturón", "Calcetines"],
  "status": "pending"
}
```

---

## Códigos de respuesta HTTP

| Código | Cuándo ocurre                                         |
|--------|-------------------------------------------------------|
| 200    | Petición exitosa                                      |
| 201    | Orden creada correctamente                            |
| 401    | Token ausente, inválido o expirado                    |
| 404    | No se encontró la orden con ese ID                    |
| 422    | El body tiene campos faltantes o con formato incorrecto |

---

## Estructura del proyecto

```
fastapi-orders/
├── app/
│   ├── main.py                ← Configura la app, CORS y registra el router
│   ├── core/
│   │   ├── config.py          ← SECRET_KEY y configuración (debe coincidir con fastapi-jwt)
│   │   ├── security.py        ← Solo decodifica tokens, no los genera
│   │   └── dependencies.py    ← Dependencia get_current_user para proteger rutas
│   ├── routers/
│   │   └── orders.py          ← Los 3 endpoints de órdenes
│   └── schemas/
│       └── order.py           ← Modelos Pydantic: OrderCreate y Order
├── requirements.txt
└── README.md
```
