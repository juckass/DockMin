# 🚢 Dockmin

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
- Pruebas unitarias y de integración con base de datos en memoria.
- **Módulo Docker desacoplado y seguro**: validación de comandos, logger centralizado, integración con ambientes.
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

Puedes consultar y extender estos archivos para agregar ejemplos, descripciones y esquemas personalizados a los endpoints.

#### Ejemplo de respuesta enriquecida (endpoint Docker):

```json
{
  "success": true,
  "stdout": "Nombre   Estado   Puertos\nweb_1   running   80/tcp",
  "stderr": "",
  "parsed": [
    { "Nombre": "web_1", "Estado": "running", "Puertos": "80/tcp" }
  ]
}
```

#### Ejemplo de error:

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "Ruta de ambiente fuera del directorio permitido",
  "errorType": "VALIDATION",
  "parsed": []
}
```

---

## 📬 Endpoints principales

### Clientes

- `GET /clientes` — Listar clientes (paginación y filtros)
- `GET /clientes/:id` — Obtener cliente por ID
- `POST /clientes` — Crear cliente
- `PUT /clientes/:id` — Actualizar cliente
- `DELETE /clientes/:id` — Eliminar (soft delete) cliente
- `GET /clientes/:id/ambientes/eliminados` — Listar ambientes eliminados de un cliente

### Ambientes

- `GET /ambientes` — Listar ambientes (paginación y filtros)
- `GET /ambientes/:id` — Obtener ambiente por ID
- `POST /ambientes` — Crear ambiente
- `PUT /ambientes/:id` — Actualizar ambiente
- `DELETE /ambientes/:id` — Eliminar (soft delete) ambiente
- `GET /ambientes/cliente/:clienteId` — Listar ambientes por cliente
- `GET /ambientes/cliente/:clienteId/eliminados` — Listar ambientes eliminados por cliente

### Docker

- `GET /docker/status` — Estado general de Docker (instalación, permisos, versión)
- `POST /docker/up/:id` — Levantar ambiente Docker
- `POST /docker/ps/:id` — Consultar contenedores del ambiente
- `POST /docker/down/:id` — Bajar ambiente Docker

---

## 📝 Ejemplos de body para la API

### Crear cliente

```json
{
  "nombre": "DemoCorp"
}
```

### Crear ambiente

```json
{
  "clienteId": 1,
  "nombre": "qa",
  "path": "/proyectos/demo/qa",
  "prefijo": "demo_qa",
  "comandoUp": "docker compose --profile=nginx up -d",
  "comandoDown": "docker compose down",
  "perfiles": ["nginx", "php", "mysql"],
  "autostart": true,
  "orden": 1
}
```

---

## 🛡️ Manejo de errores y logs

- Todos los errores son gestionados por un filtro global y registrados con Winston.
- Los logs se almacenan en la carpeta definida por `LOGS_PATH` en `.env`.
- Los logs de pruebas pueden ser eliminados automáticamente tras la ejecución de los tests.
- Los errores de ejecución de comandos Docker quedan registrados en el logger central.

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
- `test/integration`: Pruebas de integración con base de datos en memoria

---

## 📦 Próximos pasos sugeridos

- [ ] **Seguridad:** Autenticación JWT, autorización por roles, rate limiting, validación avanzada de entradas.

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