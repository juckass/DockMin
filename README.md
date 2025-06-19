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
- Pruebas unitarias para servicios y controladores.

---

## ⚙️ Tecnologías principales

- **NestJS** (backend modular)
- **SQLite + TypeORM** (persistencia)
- **Swagger** (documentación interactiva)
- **Winston** (logs centralizados)
- **Dotenv + @nestjs/config** (variables de entorno)
- **Filtro global de errores** (manejo uniforme de excepciones)
- **Jest** (pruebas unitarias)

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

### Ambientes

- `GET /ambientes` — Listar ambientes (paginación y filtros)
- `GET /ambientes/:id` — Obtener ambiente por ID
- `POST /ambientes` — Crear ambiente
- `PUT /ambientes/:id` — Actualizar ambiente
- `DELETE /ambientes/:id` — Eliminar (soft delete) ambiente
- `GET /ambientes/cliente/:clienteId` — Listar ambientes por cliente
- `GET /ambientes/eliminados` — Listar ambientes eliminados

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

---

## 🏗️ Estructura básica del proyecto

- `src/core`: Servicios generales (logger, gestor de errores, utilidades)
- `src/clientes`: CRUD de clientes, soft delete, paginación, filtros, validaciones
- `src/ambientes`: CRUD y control de ambientes Docker, soft delete, paginación, filtros, validaciones

---

## 📦 Próximos pasos sugeridos

- Implementar módulo central de auditoría.
- Agregar autenticación y autorización.
- Crear módulo especial para ejecución de comandos Docker.
- Conectar un frontend para administración visual.
- Consultar la documentación interna para detalles avanzados.