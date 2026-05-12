# react-jwt-client — Frontend de Productos

Interfaz web para gestionar el catálogo de productos. Se conecta a `fastapi-jwt` (puerto 8000) para autenticación y para el CRUD de productos.

Construido con **React + TypeScript + Vite + Tailwind CSS**.

---

## Requisitos

- Node.js 18 o superior
- `fastapi-jwt` corriendo en http://127.0.0.1:8000

---

## Instalación y arranque

```powershell
cd react-jwt-client
npm install
npm run dev
```

Abre http://localhost:5173 en el navegador.

---

## Qué puedes hacer

- **Login**: ingresa con `admin` / `admin123` o `user` / `user123`
- **Ver productos**: tabla con todos los productos del inventario
- **Crear producto**: botón "Nuevo Producto" → completa el formulario
- **Editar producto**: botón "Editar" en cualquier fila de la tabla
- **Logout**: botón en la barra superior, invalida el token en el backend

---

## Usuarios de prueba

| Usuario | Contraseña | Rol   |
|---------|------------|-------|
| admin   | admin123   | ADMIN |
| user    | user123    | USER  |

---

## Cómo funciona por dentro

**Autenticación**
El login envía `username` y `password` al endpoint `POST /auth/login` de fastapi-jwt. Si es correcto, el backend devuelve un `access_token` (dura 3 minutos) y un `refresh_token` (dura 1 día). Ambos se guardan en `localStorage`.

**Renovación automática del token**
Cuando el access_token expira, el interceptor de Axios lo detecta (respuesta 401), pide un token nuevo usando el refresh_token y reintenta la petición original. El usuario no nota nada, todo sucede en segundo plano.

**Rutas protegidas**
Si no hay token en localStorage al entrar, la app redirige automáticamente al login. Al hacer logout, también se redirige al login.

---

## Estructura del proyecto

```
react-jwt-client/
├── src/
│   ├── api/
│   │   └── client.ts         ← Axios configurado con interceptores de token
│   ├── components/
│   │   ├── Navbar.tsx         ← Barra superior con nombre de usuario y logout
│   │   ├── ProductModal.tsx   ← Modal para crear y editar productos
│   │   └── PrivateRoute.tsx   ← Redirige al login si no hay sesión activa
│   ├── context/
│   │   └── AuthContext.tsx    ← Estado global de autenticación
│   ├── pages/
│   │   ├── LoginPage.tsx      ← Formulario de login
│   │   └── ProductsPage.tsx   ← Tabla de productos
│   ├── types.ts               ← Tipos TypeScript compartidos
│   └── main.tsx               ← Punto de entrada, define las rutas
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Scripts disponibles

| Comando         | Descripción                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Servidor de desarrollo con hot reload |
| `npm run build` | Compilación para producción          |
| `npm run preview` | Vista previa del build             |
