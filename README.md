
# 🚢 Dockmin

Dockmin es una API REST pensada para facilitar la gestión de ambientes Docker de múltiples clientes desde un solo lugar. Permite levantar, bajar, consultar el estado y administrar entornos de desarrollo, QA y staging de manera centralizada y segura.

## 🎯 Objetivo

El objetivo principal de Dockmin es simplificar la administración de ambientes Docker, brindando a equipos de desarrollo y operaciones una herramienta robusta, segura y extensible para automatizar tareas comunes y reducir errores manuales.


# 📑 Índice

1. [Objetivo](#objetivo)
2. [¿Cómo está construido?](#cómo-está-construido)
3. [Instalación y requisitos](#instalación-y-requisitos)
4. [Seed automático de roles y usuario admin](#seed-automático-de-roles-y-usuario-admin)
5. [Sincronización automática de permisos](#sincronización-automática-de-permisos)
6. [Limpieza automática de refresh tokens expirados](#limpieza-automática-de-refresh-tokens-expirados)
7. [Módulo Clientes](#módulo-clientes)
8. [Módulo Usuarios](#módulo-usuarios)
9. [Módulo Auth](#módulo-auth)
10. [Módulo Ambientes](#módulo-ambientes)
11. [Módulo Docker](#módulo-docker)
12. [Pendientes por hacer](#pendientes-por-hacer)

---

---

## 📋 Pendientes por hacer

### Módulo Clientes
- [ ] Desarrollar funcionalidad de `PATCH /clientes/:id/restaurar` — Restaura un cliente eliminado.
- [ ] Desarrollar funcionalidad de `DELETE /clientes/:id` — Elimina lógicamente (soft delete) un cliente.
- [ ] Validar si existe un cliente registrado con el mismo slug antes de crear uno nuevo y retornar una respuesta clara de error.
## 📋 Pendientes por hacer

### Módulo Clientes
- [ ] Desarrollar funcionalidad de `PATCH /clientes/:id/restaurar` — Restaura un cliente eliminado.
- [ ] Desarrollar funcionalidad de `DELETE /clientes/:id` — Elimina lógicamente (soft delete) un cliente.

## 🏗️ ¿Cómo está construido?

Dockmin está desarrollado con un enfoque modular y seguro, utilizando las siguientes tecnologías principales:

- **NestJS**: Framework backend Node.js que facilita la arquitectura modular, la inyección de dependencias y la escalabilidad.
- **TypeORM + SQLite**: ORM para la persistencia de datos, usando SQLite por defecto para facilitar pruebas y despliegues rápidos (puede adaptarse a otros motores).
- **Swagger**: Documentación interactiva y modular de la API.
- **JWT + RBAC**: Autenticación basada en tokens JWT y control de acceso por roles y permisos.
- **Winston**: Sistema de logs centralizados y configurables.
- **Jest + Supertest**: Pruebas unitarias y de integración para asegurar la calidad del código.
- **@nestjs/config**: Manejo de variables de entorno y configuración segura.

El proyecto está pensado para ser fácilmente extensible, integrable con otros sistemas y adaptable a distintos entornos (desarrollo, QA, producción).

---

## ⚙️ Instalación y requisitos

### Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior (incluido con Node.js)
- **Docker** (opcional, solo si vas a gestionar contenedores reales)

### Paso a paso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/dockmin.git
   cd dockmin
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con al menos:
   ```env
   PORT=3000
   DATABASE_PATH=./data/dockmin.sqlite
   LOGS_PATH=./logs
   JWT_SECRET=supersecretkey
   JWT_EXPIRES_IN=3600
   ```

4. **Inicia la aplicación:**
   ```bash
   npm run start:dev
   ```
   La API estará disponible en [http://localhost:3000](http://localhost:3000)

### Librerías principales utilizadas

- `@nestjs/core`, `@nestjs/common`, `@nestjs/typeorm`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`
- `typeorm`, `sqlite3`
- `swagger-ui-express`, `@nestjs/swagger`
- `winston`, `dotenv`
- `jest`, `supertest` (para testing)

Puedes ver todas las dependencias exactas en el archivo `package.json`.

---

## ⏰ Limpieza automática de refresh tokens expirados

Dockmin ejecuta un proceso automático (cron job) que elimina diariamente todos los refresh tokens expirados de la base de datos.

### ¿Cómo funciona?

- Cada día a la medianoche, el sistema busca usuarios cuyos refresh tokens hayan expirado y los elimina de forma segura.
- Esto ayuda a mantener la base de datos limpia y mejora la seguridad, evitando que tokens antiguos puedan ser reutilizados.
- El proceso queda registrado en los logs con la cantidad de tokens eliminados.

### ¿Dónde está implementado?

- Servicio: `src/auth/crons/refresh-token-cleaner.service.ts`
- Método: `UsuariosService.cleanExpiredRefreshTokens()`

No requiere intervención manual y funciona automáticamente en segundo plano.

---

## 🌱 Seed automático de roles y usuario admin

Dockmin incluye un proceso de seed automático que garantiza que siempre existan los roles y el usuario administrador necesarios para operar el sistema.

### ¿Qué hace el seed?

- Crea los roles `admin` y `user` si no existen.
- Crea un usuario administrador con email `admin@dockmin.com` y contraseña `admin123` si no existe.
- Asigna el rol `admin` al usuario administrador.

### ¿Cuándo se ejecuta?

- El seed se ejecuta automáticamente al iniciar la aplicación (en desarrollo y pruebas).
- Así, siempre tendrás un usuario y roles mínimos para acceder y probar la API.

### Credenciales por defecto

- **Email:** `admin@dockmin.com`
- **Contraseña:** `admin123`

> Se recomienda cambiar la contraseña del usuario admin en producción.

---

## � Sincronización automática de permisos

Dockmin implementa un proceso automático para mantener sincronizados los permisos definidos en el código con los almacenados en la base de datos. Este proceso ocurre al iniciar la aplicación y funciona así:

### ¿Cómo funciona?

1. **Detección de permisos en el código:**
   - Se escanean todos los controladores y métodos decorados con el decorador `@HasPermission('permiso.ejemplo')`.
   - Se recopilan todos los nombres de permisos usados en el código fuente.

2. **Creación automática:**
   - Si un permiso decorado no existe en la base de datos, se crea automáticamente con una descripción genérica.
   - Esto asegura que todos los permisos requeridos por el código estén disponibles para asignar a roles.

3. **Eliminación de permisos huérfanos:**
   - Si existen permisos en la base de datos que ya no están presentes en el código ("huérfanos"), se detectan y se muestra una advertencia en logs.
   - Para eliminarlos automáticamente, debes establecer la variable de entorno `PERMISSIONS_DELETE_ORPHANS=true`.
   - Al eliminar un permiso huérfano, también se remueve de todos los roles que lo tuvieran asignado.

### ¿Cuándo ocurre?

- La sincronización se ejecuta automáticamente cada vez que inicia la aplicación.
- Así, el sistema siempre refleja los permisos realmente utilizados en el código, evitando inconsistencias y facilitando el mantenimiento.

> **Nota:** Este proceso es seguro y no elimina permisos sin confirmación (requiere la variable de entorno para eliminar huérfanos).

---




## 🏢 Módulo Clientes

El módulo **Clientes** permite gestionar las entidades cliente de Dockmin, representando empresas, organizaciones o grupos que pueden tener ambientes Docker asociados. Incluye operaciones CRUD, paginación, filtrado y eliminación/restauración lógica (soft delete).

### Endpoints principales

- `POST /clientes` — Crea un nuevo cliente.
- `GET /clientes` — Lista clientes activos con paginación y filtros (`?page=1&limit=10&nombre=Acme`).
- `GET /clientes/:id` — Obtiene un cliente por su ID.
- `PATCH /clientes/:id` — Actualiza parcialmente un cliente.
- `DELETE /clientes/:id` — Elimina un cliente.


### Ejemplo de creación de cliente

```json
{
  "nombre": "Empresa prueba"
}
```

### Ejemplo de respuesta (creación)

```json
{
  "id": 1,
  "nombre": "Empresa prueba",
  "slug": "empresa-prueba",
  "createdAt": "2025-07-18T12:00:00.000Z"
}
```

### Consideraciones y buenas prácticas

- El campo `nombre` es obligatorio y único por cliente.
- El campo `slug` se genera automáticamente a partir del nombre y es único.
- La eliminación es lógica (soft delete): los clientes pueden restaurarse.
- Todos los endpoints requieren autenticación y permisos adecuados.
- Los clientes eliminados no pueden asociar ambientes ni ser modificados hasta ser restaurados.
- El sistema registra en logs todas las operaciones sensibles sobre clientes.

### Estructura básica

- `src/clientes/clientes.controller.ts` — Controlador de endpoints de clientes.
- `src/clientes/clientes.service.ts` — Lógica de negocio y acceso a datos.
- `src/clientes/dto/` — DTOs para validación y documentación de datos de entrada/salida.
- `src/clientes/entities/` — Entidad de cliente y mapeo ORM.

---

## 👤 Módulo Usuarios


### Usuario por defecto creado por el seed inicial

Al iniciar la aplicación por primera vez, Dockmin crea automáticamente un usuario administrador por defecto para que puedas acceder y probar la API de inmediato:

- **Email:** `admin@dockmin.com`
- **Contraseña:** `admin123`

> Se recomienda cambiar la contraseña del usuario admin en producción.

El módulo **Usuarios** permite la gestión completa de usuarios en Dockmin, incluyendo creación, consulta, actualización, eliminación lógica (soft delete) y restauración. Todos los endpoints están protegidos por autenticación JWT y control de permisos (RBAC).

### Endpoints principales

- `POST /usuarios` — Crea un nuevo usuario.
- `GET /usuarios` — Lista usuarios activos con paginación (`?page=1&limit=10`).
- `GET /usuarios/eliminados` — Lista usuarios eliminados (soft delete) con paginación.
- `GET /usuarios/:id` — Obtiene un usuario por su ID.
- `PATCH /usuarios/:id` — Actualiza parcialmente un usuario.
- `DELETE /usuarios/:id` — Elimina lógicamente (soft delete) un usuario.
- `PATCH /usuarios/:id/restaurar` — Restaura un usuario eliminado.

### Ejemplo de creación de usuario

```json
{
  "email": "nuevo@cliente.com",
  "nombreCompleto": "Cliente Nuevo",
  "password": "password123"
}
```

### Ejemplo de respuesta (creación)

```json
{
  "id": 2,
  "email": "nuevo@cliente.com",
  "nombreCompleto": "Cliente Nuevo",
  "rol": "user",
  "createdAt": "2025-07-18T12:00:00.000Z"
}
```

### Consideraciones y buenas prácticas

- Todos los endpoints requieren autenticación y permisos adecuados.
- La eliminación de usuarios es lógica (soft delete): los datos no se borran físicamente y pueden restaurarse.
- Los usuarios eliminados no pueden autenticarse ni operar hasta ser restaurados.
- El email es único y obligatorio.
- La contraseña debe tener al menos 6 caracteres y se almacena de forma segura (hash).
- Los cambios de contraseña invalidan automáticamente el refresh token del usuario.
- El sistema registra en logs todas las operaciones sensibles sobre usuarios.

### Estructura básica

- `src/usuarios/usuarios.controller.ts` — Controlador de endpoints de usuarios.
- `src/usuarios/usuarios.service.ts` — Lógica de negocio y acceso a datos.
- `src/usuarios/dto/` — DTOs para validación y documentación de datos de entrada/salida.
- `src/usuarios/entities/` — Entidad de usuario y mapeo ORM.

---

El módulo **Usuarios** permite la gestión completa de usuarios en Dockmin, incluyendo creación, consulta, actualización, eliminación lógica (soft delete) y restauración. Todos los endpoints están protegidos por autenticación JWT y control de permisos (RBAC).

### Endpoints principales

- `POST /usuarios` — Crea un nuevo usuario.
- `GET /usuarios` — Lista usuarios activos con paginación (`?page=1&limit=10`).
- `GET /usuarios/eliminados` — Lista usuarios eliminados (soft delete) con paginación.
- `GET /usuarios/:id` — Obtiene un usuario por su ID.
- `PATCH /usuarios/:id` — Actualiza parcialmente un usuario.
- `DELETE /usuarios/:id` — Elimina lógicamente (soft delete) un usuario.
- `PATCH /usuarios/:id/restaurar` — Restaura un usuario eliminado.

### Ejemplo de creación de usuario

```json
{
  "email": "nuevo@cliente.com",
  "nombreCompleto": "Cliente Nuevo",
  "password": "password123"
}
```

### Ejemplo de respuesta (creación)

```json
{
  "id": 2,
  "email": "nuevo@cliente.com",
  "nombreCompleto": "Cliente Nuevo",
  "rol": "user",
  "createdAt": "2025-07-18T12:00:00.000Z"
}
```

### Consideraciones y buenas prácticas

- Todos los endpoints requieren autenticación y permisos adecuados.
- La eliminación de usuarios es lógica (soft delete): los datos no se borran físicamente y pueden restaurarse.
- Los usuarios eliminados no pueden autenticarse ni operar hasta ser restaurados.
- El email es único y obligatorio.
- La contraseña debe tener al menos 6 caracteres y se almacena de forma segura (hash).
- Los cambios de contraseña invalidan automáticamente el refresh token del usuario.
- El sistema registra en logs todas las operaciones sensibles sobre usuarios.

### Estructura básica

- `src/usuarios/usuarios.controller.ts` — Controlador de endpoints de usuarios.
- `src/usuarios/usuarios.service.ts` — Lógica de negocio y acceso a datos.
- `src/usuarios/dto/` — DTOs para validación y documentación de datos de entrada/salida.
- `src/usuarios/entities/` — Entidad de usuario y mapeo ORM.

---

El módulo **Auth** gestiona la autenticación y autorización de usuarios en Dockmin. Implementa JWT para sesiones seguras, refresh tokens y control de acceso por roles (RBAC).

### Endpoints principales

- `POST /auth/login` — Login con email y contraseña. Devuelve `accessToken`, `refreshToken` y datos del usuario.
- `POST /auth/refresh` — Renueva el `accessToken` usando un `refreshToken` válido.
- `POST /auth/logout` — Cierra la sesión e invalida el refresh token del usuario autenticado.

### Flujos principales

**Login:**
```json
{
  "email": "admin@dockmin.com",
  "password": "admin123"
}
```
Respuesta:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "user": {
    "id": 1,
    "email": "admin@dockmin.com",
    "rol": "admin"
  }
}
```

**Refresh token:**
```json
{
  "refreshToken": "<refresh-token>"
}
```
Respuesta:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<nuevo-refresh-token>"
}
```

**Logout:**
```http
POST /auth/logout
Authorization: Bearer <accessToken>
```
Respuesta:
```json
{
  "message": "Logout exitoso"
}
```

### Consideraciones de seguridad

- Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>`.
- Los refresh tokens expiran y se limpian automáticamente.
- Los roles y permisos se gestionan desde la base de datos.
- El login y refresh devuelven siempre un nuevo accessToken y refreshToken.

### Estructura básica

- `src/auth/auth.controller.ts` — Controlador de endpoints de autenticación.
- `src/auth/auth.service.ts` — Lógica de login, logout, refresh y validación de tokens.
- `src/auth/guards/` — Guards para proteger rutas según JWT y roles.

### Buenas prácticas y recomendaciones de seguridad

- Usa siempre HTTPS en producción para proteger los tokens en tránsito.
- Nunca almacenes el refresh token en localStorage en aplicaciones web; usa httpOnly cookies o almacenamiento seguro.
- El refresh token es de un solo uso: si se detecta uso indebido, se revoca automáticamente.
- Si un refresh token es inválido o expirado, el usuario debe volver a autenticarse.
- Cambia la contraseña del usuario admin por defecto antes de exponer la API.
- Puedes extender el sistema para soportar OAuth u otros proveedores agregando nuevas estrategias en el módulo Auth.
- Todos los intentos de uso de refresh token inválido quedan registrados en logs para auditoría.


