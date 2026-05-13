# react-orders-client — Frontend de Órdenes

Interfaz web para gestionar órdenes de compra. Se conecta a `fastapi-jwt` (puerto 8000) para el login y a `fastapi-orders` (puerto 8001) para crear y listar órdenes.

Construido con **React + TypeScript + Vite + Tailwind CSS**.

---

## Requisitos

- Node.js 18 o superior
- `fastapi-jwt` corriendo en http://127.0.0.1:8000
- `fastapi-orders` corriendo en http://127.0.0.1:8001

---

## Instalación y arranque

```powershell
cd react-orders-client
npm install
npm run dev
```

Abre http://localhost:5174 en el navegador.

---

## Qué puedes hacer

- **Login**: ingresa con `admin` / `admin123` o `user` / `user123`
- **Ver órdenes**: lista de todas las órdenes con su cliente, artículos y estado
- **Crear orden**: botón "Nueva Orden" → completa nombre del cliente y artículos (separados por coma)
- **Ver el estado**: cada orden muestra su estado con un color distinto (PENDING, CONFIRMED, SHIPPED, DELIVERED)
- **Cambiar estado**: botón "Editar" en cada orden → selector de estado → Actualizar
- **Logout**: botón en la barra superior

---

## Usuarios de prueba

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin123   | ADMIN |
| user    | user123    | USER  |

Son los mismos que en react-jwt-client. El login siempre va al puerto 8000 de fastapi-jwt.

---

## Estados de una orden

| Estado       | Color   | Significado                        |
|--------------|---------|------------------------------------|
| `PENDING`    | Amarillo | Recién creada, sin procesar       |
| `CONFIRMED`  | Azul     | Confirmada y en preparación       |
| `SHIPPED`    | Morado   | Enviada, en camino al cliente     |
| `DELIVERED`  | Verde    | Entregada y finalizada            |

Las nuevas órdenes siempre se crean en estado `PENDING`. El estado se puede cambiar desde el botón Editar de cada orden.

---

## Cómo funciona por dentro

**Autenticación**
El login llama a `POST /auth/login` en fastapi-jwt (puerto 8000), no en fastapi-orders. El token recibido se guarda en `sessionStorage` (nunca en `localStorage`) y se usa para todas las peticiones a fastapi-orders.

**Renovación automática del token**
Si el access_token expira (dura 3 minutos), el interceptor de Axios lo detecta, lo renueva con el refresh_token y reintenta la petición automáticamente.

**Rutas protegidas**
Sin token válido en sessionStorage, la app redirige al login. Al hacer logout, también se redirige.

---

## Estructura del proyecto

```
react-orders-client/
├── src/
│   ├── api/
│   │   └── client.ts         ← Axios apuntando a fastapi-orders, con interceptores
│   ├── components/
│   │   ├── Navbar.tsx         ← Barra superior con nombre de usuario y logout
│   │   ├── OrderModal.tsx     ← Modal para crear orden o cambiar su estado
│   │   └── PrivateRoute.tsx   ← Redirige al login si no hay sesión activa
│   ├── context/
│   │   └── AuthContext.tsx    ← Estado global de autenticación
│   ├── pages/
│   │   ├── LoginPage.tsx      ← Formulario de login
│   │   └── OrdersPage.tsx     ← Lista de órdenes
│   ├── types.ts               ← Tipos TypeScript compartidos
│   └── main.tsx               ← Punto de entrada, define las rutas
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Scripts disponibles

| Comando           | Descripción                           |
|-------------------|---------------------------------------|
| `npm run dev`     | Servidor de desarrollo con hot reload |
| `npm run build`   | Compilación para producción           |
| `npm run preview` | Vista previa del build                |
