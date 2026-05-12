# Monorepo — FastAPI JWT + Orders

Este repositorio contiene **4 proyectos** que trabajan juntos: dos backends en Python y dos frontends en React.

---

## ¿Qué hace cada proyecto?

| Proyecto | Tecnología | Puerto | Qué resuelve |
|---|---|---|---|
| `fastapi-jwt` | Python + FastAPI | **8000** | Autenticación (login/logout/refresh) y CRUD de productos |
| `fastapi-orders` | Python + FastAPI | **8001** | Gestión de órdenes de compra |
| `react-jwt-client` | React + Vite | **5173** | Interfaz para gestionar productos |
| `react-orders-client` | React + Vite | **5174** | Interfaz para gestionar órdenes |

---

## ¿Cómo se conectan?

```
react-jwt-client (5173)
    │  login / productos
    └──────────────────► fastapi-jwt (8000)
                              │  emite token JWT
                              └──────────────────► comparte SECRET_KEY
                                                        │
react-orders-client (5174)                              │
    │  login ─────────────────────────────────────────►│
    │  órdenes                                          │
    └──────────────────► fastapi-orders (8001) ─────────┘
                         (valida el mismo token)
```

La clave importante: **el token que genera `fastapi-jwt` sirve también para `fastapi-orders`** porque comparten la misma `SECRET_KEY`. No necesitas loguearte dos veces.

---

## Inicio rápido

Abre **4 terminales** y ejecuta uno en cada una:

### Terminal 1 — API de autenticación y productos
```bash
cd fastapi-jwt
pip install -r requirements.txt
uvicorn app.main:app --reload
# Corre en http://127.0.0.1:8000
```

### Terminal 2 — API de órdenes
```bash
cd fastapi-orders
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
# Corre en http://127.0.0.1:8001
```

### Terminal 3 — Frontend de productos
```bash
cd react-jwt-client
npm install
npm run dev
# Corre en http://localhost:5173
```

### Terminal 4 — Frontend de órdenes
```bash
cd react-orders-client
npm install
npm run dev
# Corre en http://localhost:5174
```

---

## Usuarios disponibles

Ambos frontends usan los mismos usuarios (definidos en `fastapi-jwt`):

| Usuario | Contraseña | Rol   |
|---------|-----------|-------|
| admin   | admin123  | ADMIN |
| user    | user123   | USER  |

---

## Documentación interactiva (Swagger)

Cada API tiene su propio Swagger donde puedes probar los endpoints directamente desde el navegador:

| API | Swagger UI |
|-----|-----------|
| fastapi-jwt | http://127.0.0.1:8000/docs |
| fastapi-orders | http://127.0.0.1:8001/docs |

Para usar Swagger en `fastapi-orders`: primero obtén un token desde el Swagger de `fastapi-jwt` → luego haz clic en **Authorize** en el Swagger de `fastapi-orders` y pégalo.

---

## Estructura del repositorio

```
Carlos-Rodriguez/
├── fastapi-jwt/              ← Backend: auth + productos
│   ├── app/
│   │   ├── main.py
│   │   ├── core/             ← config, security, dependencies
│   │   ├── routers/          ← auth.py, products.py
│   │   └── schemas/          ← auth.py, product.py
│   └── requirements.txt
│
├── fastapi-orders/           ← Backend: órdenes
│   ├── app/
│   │   ├── main.py
│   │   ├── core/             ← config, security, dependencies
│   │   ├── routers/          ← orders.py
│   │   └── schemas/          ← order.py
│   └── requirements.txt
│
├── react-jwt-client/         ← Frontend: gestión de productos
│   └── src/
│       ├── api/client.js     ← Axios apuntando a puerto 8000
│       ├── context/          ← AuthContext (login/logout)
│       ├── components/       ← Navbar, ProductModal, PrivateRoute
│       └── pages/            ← LoginPage, ProductsPage
│
└── react-orders-client/      ← Frontend: gestión de órdenes
    └── src/
        ├── api/client.js     ← Axios apuntando a puerto 8001
        ├── context/          ← AuthContext (login usa puerto 8000)
        ├── components/       ← Navbar, OrderModal, PrivateRoute
        └── pages/            ← LoginPage, OrdersPage
```
