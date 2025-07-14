# 🚢 Dockmin

## Índice

- [¿Qué hace Dockmin?](#qué-hace-dockmin)
- [Tecnologías principales](#tecnologías-principales)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Documentación de la API](#documentación-de-la-api)
- [Endpoints principales](#endpoints-principales)
- [Ejemplos de body para la API](#ejemplos-de-body-para-la-api)
- [Manejo de errores y logs](#manejo-de-errores-y-logs)
- [Pruebas](#pruebas)
- [Estructura básica del proyecto](#estructura-básica-del-proyecto)
- [Próximos pasos sugeridos](#próximos-pasos-sugeridos)
- [Importante: Permisos y ejecución de Docker](#importante-permisos-y-ejecución-de-docker)
- [Preguntas frecuentes (FAQ)](#preguntas-frecuentes-faq)
- [Guía rápida de seguridad](#guía-rápida-de-seguridad)
- [Guía de despliegue](#guía-de-despliegue)

Dockmin es un sistema para gestionar ambientes Docker de múltiples clientes, permitiendo levantar/bajar entornos, ver logs y administrar ambientes desde una API REST.

---

## 🚀 ¿Qué hace Dockmin?

- Administra ambientes de desarrollo, QA y staging para varios clientes.
- Ejecuta comandos Docker personalizados por ambiente (levantar, bajar, consultar estado de contenedores).
- Centraliza logs y errores.
- Exposición de API REST documentada con Swagger y colección Postman.
- Soporta soft delete (borrado lógico) y listado de eliminados.
- Paginación y filtros en listados.
- Validación automática y unicidad de slug.
- Manejo robusto de errores y validaciones.
- **Autenticación y autorización**: soporte para JWT, roles y permisos (RBAC).
- **Pruebas de integración robustas**: cubren flujos completos de clientes, ambientes y operaciones Docker.
- **Documentación Swagger modularizada**: la documentación de los endpoints está separada en archivos externos para facilitar el mantenimiento y la extensión.

---

## ⚙️ Tecnologías principales

- **NestJS** (backend modular)
- **SQLite + TypeORM** (persistencia)
- **Swagger** (documentación interactiva y modular)
- **Winston** (logs centralizados)
- **Dotenv + @nestjs/config** (variables de entorno)
- **Filtro global de errores** (manejo uniforme de excepciones)
- **Jest + Supertest** (pruebas unitarias y de integración)
- **Autenticación JWT y OAuth** (Google OAuth integrado)
- **RBAC (Role-Based Access Control)** (roles y permisos configurables desde la base de datos)

---

## 🛠️ Instalación y puesta en marcha

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/dockmin.git
cd dockmin
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=3000
DATABASE_PATH=./data/dockmin.sqlite
LOGS_PATH=./logs
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=3600
```

### 4. Inicia la aplicación

```bash
npm run start:dev
```

La API estará disponible en [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentación de la API

Accede a la documentación interactiva en:  
[http://localhost:3000/api](http://localhost:3000/api)

También puedes usar la colección Postman incluida: `Dockmin.postman_collection.json`

### 📚 Documentación Swagger modularizada

La documentación de los endpoints principales está separada en archivos externos para facilitar su mantenimiento y extensión:
- `src/docker/docs/docker-swagger.docs.ts`
- `src/ambientes/docs/ambientes-swagger.docs.ts`
- `src/clientes/docs/clientes-swagger.docs.ts`
- `src/auth/docs/auth-swagger.docs.ts`

Puedes consultar y extender estos archivos para agregar ejemplos, descripciones y esquemas personalizados a los endpoints.

---

## 🛡️ Manejo de errores y logs

- Todos los errores son gestionados por un filtro global y registrados con Winston.
- Los logs se almacenan en la carpeta definida por `LOGS_PATH` en `.env`.
- Los errores de ejecución de comandos Docker quedan registrados en el logger central.
- Los errores de autenticación y autorización se manejan con guards y decoradores personalizados.

---

## 🧪 Pruebas

- Ejecuta las pruebas unitarias con:
  ```bash
  npm run test
  ```
- Ejecuta las pruebas de cobertura con:
  ```bash
  npm run test:cov
  ```
- Ejecuta las pruebas de integración (base de datos en memoria):
  ```bash
  npm run test:integration
  ```
  > Asegúrate de que el script `"test:integration": "NODE_ENV=test jest test/integration"` esté en tu `package.json`.

- Los directorios de logs de pruebas (`/test-logs` o similares) se eliminan automáticamente tras los tests.
- Las pruebas de integración cubren flujos completos de clientes, ambientes y operaciones Docker.

---

## 🏗️ Estructura básica del proyecto

- `src/core`: Servicios generales (logger, gestor de errores, utilidades)
- `src/clientes`: CRUD de clientes, soft delete, paginación, filtros, validaciones
- `src/ambientes`: CRUD y control de ambientes Docker, soft delete, paginación, filtros, validaciones
- `src/docker`: Módulo para operaciones Docker (up, down, ps, validación, logger)
- `src/auth`: Módulo de autenticación y autorización (JWT, OAuth, RBAC)
- `test/integration`: Pruebas de integración con base de datos en memoria

---

## 📦 Próximos pasos sugeridos

- [ ] **Seguridad:** Autenticación JWT, autorización por roles, rate limiting, validación avanzada de entradas.
- [ ] **Tokens para aplicaciones:** Soporte para generación y validación de tokens de acceso para aplicaciones externas (frontends, bots, integraciones), con permisos y expiración configurables.
- [ ] Implementar módulo central de auditoría.
- [ ] Conectar un frontend para administración visual.

---

## ⚠️ Importante: Permisos y ejecución de Docker

- **Permisos de usuario:**  
  Los comandos Docker que ejecuta Dockmin desde la API se corren con el mismo usuario del sistema que ejecuta la aplicación NestJS.  
  - Si ejecutas Dockmin como **root**, tendrás acceso completo a Docker.
  - Si ejecutas Dockmin como un usuario normal, ese usuario debe pertenecer al grupo `docker` (en Linux) para poder ejecutar comandos Docker sin sudo.
  - Si Docker requiere permisos de root y la app no se ejecuta como root, los comandos fallarán.

- **Seguridad:**  
  No se recomienda ejecutar toda la aplicación como root en producción.  
  Lo ideal es agregar el usuario de la app al grupo `docker` y restringir el acceso a la API.

- **Chequeo de estado:**  
  El módulo Docker incluye un endpoint para verificar:
  - Si Docker está instalado.
  - Si el servicio Docker está corriendo.
  - Si el usuario tiene permisos para ejecutar Docker.

---

## ❓ Preguntas frecuentes (FAQ)

- **¿Puedo usar login tradicional y Google a la vez?**
  Sí, puedes ofrecer ambos métodos de autenticación en paralelo. El backend valida ambos y genera un JWT propio para tu app.
- **¿Cómo agrego un nuevo rol o permiso?**
  Solo debes actualizar la entidad usuario y los guards de autorización.
- **¿Cómo genero un token para un bot o integración?**
  Usa el endpoint de generación de tokens para aplicaciones externas (ver próximos pasos).

---

## 🛡️ Guía rápida de seguridad

- **Autenticación JWT**: Todos los endpoints sensibles requieren autenticación mediante JWT. Los tokens se generan al iniciar sesión y deben enviarse en el header `Authorization: Bearer <token>`.
- **Roles y permisos**: El sistema soporta roles (`user`, `admin`). Los endpoints críticos requieren rol `admin`.
- **Rate limiting**: Se recomienda habilitar rate limiting en producción para evitar ataques de fuerza bruta.
- **CORS**: Configura CORS para restringir el acceso solo a dominios autorizados.
- **Validación estricta**: Todas las entradas son validadas con `class-validator` y los comandos Docker pasan por validación adicional.
- **Logs y auditoría**: Todos los accesos y errores quedan registrados. Se recomienda centralizar logs en sistemas como Sentry o ELK.
- **No ejecutar como root**: Ejecuta Dockmin con un usuario limitado y agrégalo al grupo `docker`.
- **Variables sensibles**: Usa `.env` y nunca subas este archivo al repositorio.

---

## 🚀 Guía de despliegue en producción

1. **Configura las variables de entorno** (`.env`):
   - PORT, DATABASE_PATH, LOGS_PATH, JWT_SECRET, JWT_EXPIRES_IN, etc.
2. **Prepara la base de datos**: Usa SQLite para pruebas o PostgreSQL/MySQL para producción.
3. **Configura logs externos**: Integra con Sentry, ELK o similar para monitoreo.
4. **Habilita HTTPS**: Usa un proxy inverso (Nginx, Caddy) para servir la API por HTTPS.
5. **Backups**: Programa backups automáticos de la base de datos y logs.
6. **Despliega con PM2 o Docker**: Usa PM2 para procesos Node o crea un contenedor Docker para Dockmin.
7. **Actualizaciones**: Haz pull de cambios, ejecuta migraciones y reinicia el servicio.

---

## 🔑 Tokens para aplicaciones externas (front/bots)

- Dockmin permite generar tokens de acceso para aplicaciones externas (frontends, bots, integraciones).
- Los tokens pueden tener permisos y expiración configurables.
- Ejemplo de generación (próximamente):
  ```json
  {
    "nombre": "bot-monitor",
    "permisos": ["docker:ps", "docker:up"],
    "expiraEn": "2h"
  }
  ```
- Los tokens deben enviarse en el header `Authorization`.
- Consulta la documentación de los endpoints `/auth/token` para más detalles.

---

## ❓ FAQ (Preguntas frecuentes)

- **¿Por qué recibo 'Permiso denegado' al ejecutar comandos Docker?**
  - El usuario que ejecuta Dockmin debe pertenecer al grupo `docker`.
- **¿Cómo agrego un usuario al grupo docker?**
  - En Linux: `sudo usermod -aG docker <usuario>`
- **¿Puedo usar otra base de datos?**
  - Sí, puedes configurar TypeORM para usar PostgreSQL o MySQL.
- **¿Cómo agrego nuevos roles o permisos?**
  - Modifica el guard de roles y la lógica de autorización en el módulo de autenticación.
- **¿Cómo reporto un bug o contribuyo?**
  - Abre un issue o pull request en el repositorio de GitHub.

---

## 🛣️ Roadmap y contribución

- [ ] Autenticación JWT y OAuth (Google)
- [ ] Módulo de auditoría y logs centralizados
- [ ] Generación de tokens para apps externas
- [ ] Frontend visual de administración
- [ ] Mejoras en la documentación y ejemplos avanzados

¿Quieres contribuir? ¡Toda ayuda es bienvenida! Lee las normas de contribución y abre un PR.

---

## 📚 Referencias y recursos

- [NestJS](https://docs.nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Swagger](https://swagger.io/)
- [Docker](https://docs.docker.com/)
- [JWT.io](https://jwt.io/)
- [Guía de seguridad Node.js](https://nodejs.org/en/docs/guides/security/)
- [Sentry](https://sentry.io/welcome/)

---