# 🚢 Dockmin

Dockmin es un sistema para gestionar ambientes Docker de múltiples clientes, permitiendo levantar/bajar entornos, ver logs y administrar ambientes desde una API REST.

---

## 🚀 ¿Qué hace Dockmin?

- Administra ambientes de desarrollo, QA y staging para varios clientes.
- Ejecuta comandos Docker personalizados por ambiente.
- Centraliza logs y errores.
- Exposición de API REST documentada con Swagger.
- Soporta soft delete (borrado lógico) y listado de eliminados.
- Paginación y filtros en listados.
- Validación automática y unicidad de slug.
- Manejo robusto de errores y validaciones.
- Pruebas unitarias y de integración con base de datos en memoria.

---

## ⚙️ Tecnologías principales

- **NestJS** (backend modular)
- **SQLite + TypeORM** (persistencia)
- **Swagger** (documentación interactiva)
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

---

## 🏗️ Estructura básica del proyecto

- `src/core`: Servicios generales (logger, gestor de errores, utilidades)
- `src/clientes`: CRUD de clientes, soft delete, paginación, filtros, validaciones
- `src/ambientes`: CRUD y control de ambientes Docker, soft delete, paginación, filtros, validaciones
- `test/integration`: Pruebas de integración con base de datos en memoria

---

## 📦 Próximos pasos sugeridos

- Mejorar la documentación Swagger con ejemplos de respuesta y errores.
- Revisar y limpiar el código.
- Implementar módulo central de auditoría.
- Agregar autenticación y autorización.
- Crear módulo especial para ejecución de comandos Docker.
- Conectar un frontend para administración visual.
- Consultar la documentación interna para detalles avanzados.

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
  El futuro módulo Docker incluirá un endpoint para verificar:
  - Si Docker está instalado.
  - Si el servicio Docker está corriendo.
  - Si el usuario tiene permisos para ejecutar Docker.

---