# 🚢 Dockmin

Dockmin es un sistema para gestionar ambientes Docker de múltiples clientes, permitiendo levantar/bajar entornos, ver logs y administrar ambientes desde una API REST.

---

## 🚀 ¿Qué hace Dockmin?

- Administra ambientes de desarrollo, QA y staging para varios clientes.
- Ejecuta comandos Docker personalizados por ambiente.
- Centraliza logs y errores.
- Expone una API REST documentada con Swagger.

---

## ⚙️ Tecnologías principales

- **NestJS** (backend modular)
- **SQLite + TypeORM** (persistencia)
- **Swagger** (documentación interactiva)
- **Winston** (logs centralizados)
- **Dotenv + @nestjs/config** (variables de entorno)
- **Filtro global de errores** (manejo uniforme de excepciones)

---

## 🏗️ Estructura básica

- `src/core`: Servicios generales (logger, gestor de errores)
- `src/clientes`: CRUD de clientes
- `src/ambientes`: CRUD y control de ambientes Docker

---

## 🔧 Configuración rápida

1. **Clona el repositorio y entra al proyecto**
2. **Instala dependencias**
   ```bash
   npm install
   ```
3. **Crea un archivo `.env`**
   ```env
   PORT=3000
   DATABASE_PATH=./data/dockmin.sqlite
   LOGS_PATH=./logs
   ```
4. **Inicia la aplicación**
   ```bash
   npm run start:dev
   ```

---

## 📖 Documentación de la API

Accede a la documentación interactiva en:  
[http://localhost:3000/api](http://localhost:3000/api)

---

## 📝 Ejemplo de endpoint

```json
POST /ambientes
{
  "clienteId": 1,
  "nombre": "qa",
  "path": "/proyectos/sura/qa",
  "comandoUp": "docker compose up -d",
  "comandoDown": "docker compose down"
}
```

---

## 🛡️ Manejo de errores y logs

- Todos los errores son gestionados por un filtro global y registrados con Winston.
- Los logs se almacenan en la carpeta definida por `LOGS_PATH` en `.env`.

---

## 📦 Próximos pasos sugeridos

- Implementar nuevos módulos o endpoints según necesidades.
- Conectar un frontend para administración visual.
- Consultar la documentación interna para detalles avanzados.

---