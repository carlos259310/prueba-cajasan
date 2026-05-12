# fastapi-orders — API de Gestión de Órdenes

Este servicio permite crear y consultar órdenes de compra. Cada orden tiene un cliente, una lista de artículos y un estado.

No tiene login propio: usa el **mismo token** que emite `fastapi-jwt`. Ambos servicios comparten la clave secreta, así que no necesitas autenticarte dos veces.

> Todos los datos viven en memoria. Al reiniciar el servidor, todo vuelve al estado inicial.

---

## Requisitos

- Python 3.10 o superior
- `fastapi-jwt` corriendo en el puerto 8000 (necesitas un token para autenticarte)

---

## Instalación y arranque

```bash
cd fastapi-orders

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Disponible en: **http://127.0.0.1:8001**
Swagger UI: **http://127.0.0.1:8001/docs**

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

| Campo          | Descripción                                                          |
|----------------|----------------------------------------------------------------------|
| `id`           | Número entero, se asigna automáticamente al crear                    |
| `customerName` | Nombre del cliente, mínimo 1 carácter                                |
| `items`        | Lista de strings con los artículos, mínimo 1 elemento                |
| `status`       | Estado de la orden. Se crea siempre como `pending`. Valores posibles: `pending`, `processing`, `completed`, `cancelled` |

---

## Cómo probarlo paso a paso

### Paso 1: Obtener un token desde fastapi-jwt

Tienes dos opciones:

**Desde Swagger** (más visual):
1. Abre http://127.0.0.1:8000/docs → `POST /auth/login` → **Try it out**
2. Ingresa `admin` / `admin123` → copia el `access_token`

**Desde la terminal**:
```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Paso 2: Autorizar en el Swagger de fastapi-orders

1. Abre http://127.0.0.1:8001/docs
2. Haz clic en **Authorize** (arriba a la derecha)
3. Pega el `access_token` en el campo → **Authorize** → **Close**

### Paso 3: Probar los endpoints

**Listar todas las órdenes:**
```bash
curl -s http://127.0.0.1:8001/orders \
  -H "Authorization: Bearer TU_TOKEN"
```

**Obtener la orden con id 1:**
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
Respuesta esperada (`404`):
```json
{ "detail": "Orden 99 no encontrada" }
```

---

## Endpoints

| Método | Ruta          | Auth | Descripción                              |
|--------|---------------|------|------------------------------------------|
| GET    | /orders       | Sí   | Retorna todas las órdenes                |
| GET    | /orders/{id}  | Sí   | Retorna una orden específica por su ID   |
| POST   | /orders       | Sí   | Crea una orden nueva (status = pending)  |

---

## Órdenes precargadas al iniciar

El servidor arranca con 3 órdenes de ejemplo para que tengas datos inmediatamente:

| ID | Cliente       | Artículos                           | Estado      |
|----|---------------|-------------------------------------|-------------|
| 1  | Juan Pérez    | Camiseta, Zapatos                   | pending     |
| 2  | María García  | Laptop Pro 15                       | processing  |
| 3  | Carlos López  | Mouse Inalámbrico, Teclado Mecánico | completed   |

---

## Estructura del proyecto

```
fastapi-orders/
├── app/
│   ├── main.py               ← Crea la app, configura CORS y registra rutas
│   ├── core/
│   │   ├── config.py         ← SECRET_KEY (debe coincidir con fastapi-jwt)
│   │   ├── security.py       ← Solo decodifica tokens, no los genera
│   │   └── dependencies.py   ← get_current_user: valida token en cada request
│   ├── routers/
│   │   └── orders.py         ← Los 3 endpoints de órdenes + datos en memoria
│   └── schemas/
│       └── order.py          ← OrderCreate (lo que envías) y Order (lo que recibes)
└── requirements.txt
```

---

## Nota sobre los estados

El servicio recibe las órdenes siempre en estado `pending`. En un sistema real, otro proceso (o endpoint adicional) se encargaría de cambiar el estado a `processing`, `completed` o `cancelled`. En esta demo los estados están en el código solo como referencia.
