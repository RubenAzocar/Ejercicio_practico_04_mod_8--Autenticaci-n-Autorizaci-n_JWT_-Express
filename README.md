# API JWT Express MVC

API REST de autenticacion y autorizacion con JSON Web Tokens (JWT), construida con Node.js y Express bajo arquitectura MVC para separar responsabilidades y simplificar el mantenimiento.
Incluye registro seguro con hash de contrasena, inicio de sesion con emision de token, proteccion de rutas mediante middleware y control de acceso por roles, aplicando respuestas HTTP consistentes y buenas practicas de seguridad.

## Objetivo

Implementar un flujo seguro y claro para:

- registro de usuarios con hash de contrasena
- inicio de sesion y emision de token JWT
- proteccion de rutas con middleware de autenticacion
- autorizacion por roles en endpoints restringidos
- respuestas JSON consistentes con codigos HTTP correctos

## Stack tecnico

- Node.js
- Express
- jsonwebtoken
- bcryptjs
- dotenv
- helmet

## Estructura del proyecto

```text
.
|- config/
|  |- variablesEntorno.js
|- controladores/
|  |- autenticacionControlador.js
|  |- perfilControlador.js
|- datos/
|  |- usuarios.json
|- middleware/
|  |- autenticacionJwt.js
|  |- autorizarRoles.js
|  |- manejoErrores.js
|- modelos/
|  |- usuarioModelo.js
|- rutas/
|  |- autenticacionRutas.js
|  |- perfilRutas.js
|- .env
|- .env.example
|- .gitignore
|- index.js
|- package.json
```

## Requisitos

- Node.js 18 o superior

## Configuracion

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno en `.env`:

```env
PORT=3000
JWT_SECRET=clave_larga_de_desarrollo_cambiar_antes_de_produccion_2026
JWT_EXPIRES=15m
BCRYPT_RONDAS=10
```

3. Ejecutar en desarrollo:

```bash
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion | Proteccion |
|---|---|---|---|
| POST | /auth/register | Registra usuario nuevo | Publica |
| POST | /auth/login | Valida credenciales y entrega JWT | Publica |
| GET | /api/perfil | Retorna perfil autenticado | JWT Bearer |
| GET | /api/admin | Recurso restringido por rol | JWT Bearer + rol admin |

## Formato de respuestas

- Exito:

```json
{ "ok": true }
```

- Error:

```json
{ "ok": false, "mensaje": "..." }
```

## Codigos HTTP usados

- 200 OK: solicitud exitosa
- 201 Created: usuario registrado
- 400 Bad Request: datos obligatorios faltantes o invalidos
- 401 Unauthorized: token ausente, invalido o expirado; credenciales invalidas
- 403 Forbidden: token valido sin permisos suficientes
- 404 Not Found: ruta inexistente
- 500 Internal Server Error: error no controlado

## Flujo rapido de prueba

### 1) Registrar usuario

```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mail.com","password":"123456"}'
```

### 2) Iniciar sesion

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mail.com","password":"123456"}'
```

### 3) Consumir ruta protegida

```bash
curl -s http://localhost:3000/api/perfil \
  -H "Authorization: Bearer <TOKEN>"
```

## Seguridad implementada

- hash de contrasena con bcryptjs
- JWT firmado con secreto en variable de entorno
- expiracion de token configurable
- middleware de autenticacion para rutas privadas
- autorizacion por rol para recursos restringidos
- headers de seguridad con helmet
- limitacion de tamano de payload JSON

## Scripts disponibles

- `npm run dev`: inicia servidor con nodemon
- `npm start`: inicia servidor con node
# Ejercicio_practico_04_mod_8--Autenticaci-n-Autorizaci-n_JWT_-Express
