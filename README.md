# 🥑 Avocado Task Manager: Prueba Técnica

Este repositorio contiene la solución a una prueba técnica de desarrollo Full Stack, implementando un gestor de tareas utilizando FastAPI para el backend y React con TypeScript para el frontend. El objetivo es demostrar buenas prácticas de arquitectura, desarrollo, testing y despliegue.

## 🚀 Repositorio del Proyecto
**URL:** [https://github.com/kevinguzman420/avocado-challenge-tasks-manager](https://github.com/kevinguzman420/avocado-challenge-tasks-manager)
**Nombre:** `avocado-challenge-tasks-manager`

## 🏁 Inicio Rápido: Clonar y Ejecutar con Docker Compose

Este proyecto ha sido configurado para que un evaluador pueda ponerlo en marcha con el menor esfuerzo posible.

### 📋 Prerrequisitos en el Sistema del Evaluador
Asegúrate de tener instalados:
*   **Docker:** Versión 20.10+
*   **Docker Compose:** Versión 2.0+

### 💻 Pasos para Clonar y Ejecutar
Desde tu terminal, ejecuta los siguientes comandos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/kevinguzman420/avocado-challenge-tasks-manager.git
    cd avocado-challenge-tasks-manager
    ```
2.  **Iniciar todos los servicios (Base de Datos, Backend, Frontend, Redis y Adminer):**
    Este comando construirá las imágenes Docker (si es la primera vez o si los Dockerfiles han cambiado) y levantará toda la aplicación. Las migraciones de la base de datos se aplicarán automáticamente al iniciar el backend.
    ```bash
    docker compose up --build -d
    ```
3.  **Verificar el estado de los servicios (opcional):**
    ```bash
    docker compose ps
    ```
4.  **Ver los logs de todos los servicios (opcional):**
    ```bash
    docker compose logs -f
    ```

### 🌐 URLs de Acceso a la Aplicación

Una vez que los servicios estén corriendo, podrás acceder a:
*   **Frontend (Aplicación React):** [http://localhost:5173](http://localhost:5173)
*   **Backend (Documentación API - Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **Backend (ReDoc):** [http://localhost:8000/redoc](http://localhost:8000/redoc)
*   **Adminer (Gestión de Base de Datos):** [http://localhost:8080](http://localhost:8080)
    *   Servidor: `db`
    *   Usuario: `avocado_user`
    *   Contraseña: `avocado_pass_2024`
    *   Base de datos: `avocado_db`

### ✅ Ejecutar los Tests
Para correr las suites de pruebas de la aplicación:

*   **Tests del Backend (Python/Pytest):**
    Asegúrate de que el servicio `backend` esté corriendo (`docker compose ps`).
    ```bash
    docker compose exec backend pytest tests/ --cov=app --cov-report=term-missing
    ```
*   **Tests del Frontend (Cypress E2E):**
    Asegúrate de que el servicio `frontend` esté corriendo (`docker compose ps`).
    ```bash
    docker compose exec frontend pnpm run cy:run
    ```
    Para una ejecución interactiva (abrir el navegador de Cypress):
    ```bash
    docker compose exec frontend pnpm run cy:open
    ```

## 📄 Resumen del Proceso de Desarrollo y Estado

Este proyecto fue desarrollado siguiendo una arquitectura limpia y buenas prácticas. Se utilizó asistencia de IA durante el proceso para acelerar la implementación y mejorar la calidad del código.

### 🛠️ Herramientas de Asistencia de IA Utilizadas:
*   **Backend:** Desarrollo asistido por GitHub Copilot, potenciado por Claude Sonnet 4.5.
*   **Frontend:** Desarrollo asistido por Kilo Code con Grok Code Fast 1 y GitHub Copilot, potenciado por Claude Sonnet 4.1.
*   **Configuración DevOps y Mejora de Tests:** Asistencia integral a través de Gemini CLI.

### 📊 Estado de Implementación de Requisitos:
*   ✅ **Backend (FastAPI):** API RESTful completa con JWT, PostgreSQL, Alembic, Rate Limiting.
*   ✅ **Frontend (ReactJS):** Aplicación interactiva con TypeScript, Zustand, Tailwind CSS, Recharts, modo oscuro/claro, **lazy loading y code splitting**.
*   ✅ **Tests:** Cobertura del 90% y todos los tests de backend pasando. Configuración de Cypress con tests E2E de login funcionales.
*   ✅ **DevOps:** Dockerfiles para backend/frontend, `docker-compose` para orquestación, health checks, hot-reloading en desarrollo.
*   ✅ **Seguridad:** Validación de datos (Pydantic), hashing de contraseñas (bcrypt), CORS configurado.
*   ✅ **Entregables:** Todos los documentos solicitados están presentes (Diagrama de Arquitectura, Reporte de Desarrollo, `README.md`).

### ⚠️ Requisitos No Implementados (o Parcialmente):
*   **Protección CSRF:** Se intentó implementar, pero debido a conflictos de librerías y por priorizar la funcionalidad estable, se decidió no incluirla en esta versión. *Este requisito era obligatorio y no está cubierto.*
*   **Paginación, Filtrado y Ordenamiento Avanzado (Backend):** Implementado a un nivel funcional, pero el término "avanzado" podría implicar combinaciones de filtros más complejas o búsquedas full-text no cubiertas. *Se considera parcialmente cubierto.*
*   **Websockets para Actualizaciones en Tiempo Real (Opcional):** No implementado.
*   **Sistema de Notificaciones para Tareas Próximas a Vencer (Opcional):** No implementado.
*   **Logs Centralizados (DevOps):** No implementado.
*   **Circuit Breakers (DevOps):** No implementado.

### 🌐 Tecnologías Clave Utilizadas:

*   **Backend:** Python 3.12, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pytest, python-jose, passlib, fastapi-limiter.
*   **Frontend:** React 19, TypeScript, Vite, Zustand, Tailwind CSS, Recharts, React Router DOM, Axios, Cypress.
*   **DevOps:** Docker, Docker Compose, pnpm (para frontend).

## 💡 Nota Importante para el Evaluador

El proyecto ha sido diseñado con un estricto modelo de permisos donde, por defecto, un usuario solo puede ver y modificar las tareas que le han sido *asignadas*. Esto incluye la gestión de comentarios sobre dichas tareas. Esta lógica de negocio se refleja en los tests, que han sido ajustados para validar este comportamiento. Por ejemplo, los administradores no pueden modificar o eliminar tareas no asignadas a ellos, ni ver comentarios de tareas no asignadas a ellos directamente, a menos que la lógica interna del endpoint lo permita explícitamente.

Se ha hecho un esfuerzo considerable para crear un entorno de desarrollo reproducible y autónomo con Docker Compose, donde todas las dependencias y la base de datos se configuran automáticamente.

## 🐛 Troubleshooting

### Puerto ya en uso
```bash
# Cambiar puertos en .env (copia .env.example a .env si no lo has hecho)
# Por ejemplo:
# BACKEND_PORT=8001
# POSTGRES_PORT=5435
# ADMINER_PORT=8081

# Reiniciar servicios
docker compose down
docker compose up -d
```

### Base de datos no conecta
```bash
# Ver logs de la base de datos
docker compose logs db

# Verificar salud
docker compose exec db pg_isready -U avocado_user

# Reiniciar solo la base de datos
docker compose restart db
```

### Limpiar y empezar de nuevo
```bash
# Detener y eliminar todo (incluyendo volúmenes de datos)
docker compose down -v

# Reconstruir desde cero
docker compose build --no-cache
docker compose up -d
```

---
**Versión**: 1.0.0
**Última actualización**: 11 de diciembre de 2025
**Estado**: ✅ Full Stack Funcional y Listo para Evaluación