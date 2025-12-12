# Reporte del Proceso de Desarrollo - Avocado Task Manager

## 1. Enfoque Utilizado

Para el desarrollo del "Avocado Task Manager", se adoptó un enfoque **Full Stack** centrado en la eficiencia y la modularidad. La arquitectura se diseñó buscando la **claridad de responsabilidades** entre el frontend y el backend, así como la **escalabilidad** y **facilidad de mantenimiento**.

Se priorizó un entorno de desarrollo **containerizado** para garantizar la reproducibilidad y simplificar la puesta en marcha del proyecto, permitiendo a cualquier desarrollador clonar el repositorio y levantar el entorno completo con un único comando.

## 2. Tecnologías y Herramientas Utilizadas

### Backend
*   **Framework:** FastAPI (Python) - Elegido por su alto rendimiento, facilidad de uso para construir APIs RESTful, tipado estricto gracias a Pydantic y la generación automática de documentación OpenAPI (Swagger UI).
*   **Base de Datos:** PostgreSQL - Una base de datos relacional robusta y ampliamente utilizada.
*   **ORM/Migraciones:** SQLAlchemy / Alembic - SQLAlchemy como ORM para interactuar con la base de datos de manera Pythonica, y Alembic para gestionar las migraciones de la base de datos de forma automática.
*   **Autenticación:** JWT (JSON Web Tokens) - Implementado para gestionar la autenticación de usuarios y la autorización basada en roles (administrador y usuario regular).
*   **Validación de Datos:** Pydantic - Integrado con FastAPI para la validación de datos de entrada y salida, asegurando la integridad de los datos.

### Frontend
*   **Framework:** React (TypeScript) - Seleccionado por su popularidad, ecosistema robusto y la capacidad de construir interfaces de usuario complejas y reactivas. El uso de TypeScript garantiza tipos estrictos y mejora la mantenibilidad del código.
*   **Build Tool:** Vite - Para un desarrollo rápido y un build optimizado, gracias a su hot module replacement (HMR) y configuraciones eficientes.
*   **Gestión de Estado:** Zustand - Una librería de gestión de estado ligera y flexible para React, que facilita el manejo del estado global de la aplicación.
*   **Estilos:** Tailwind CSS - Un framework CSS utility-first para construir diseños personalizados de forma rápida y eficiente.
*   **Visualizaciones:** Recharts - Para la creación de gráficos y visualizaciones de datos para las estadísticas de tareas.

### Infraestructura y DevOps
*   **Contenedores:** Docker - Para empaquetar el backend y el frontend en contenedores aislados, asegurando que la aplicación se ejecute de manera consistente en diferentes entornos.
*   **Orquestación:** Docker Compose - Para definir y ejecutar aplicaciones multi-contenedor (backend, frontend, base de datos, Adminer) con un solo comando.
*   **Gestión de Paquetes (Frontend):** pnpm - Un gestor de paquetes rápido y eficiente, especialmente útil en monorepos o para optimizar el espacio en disco.
*   **Gestión de Paquetes (Backend):** uv - Un gestor de paquetes rápido para Python.
*   **Control de Versiones:** Git / GitHub - Para el control de versiones del código fuente y la colaboración.

## 3. Enfoque de Pruebas

*   **Backend:** Pruebas unitarias con `pytest` para asegurar la lógica de negocio y el correcto funcionamiento de los endpoints de la API.

## 4. Arquitectura del Sistema

La aplicación sigue una arquitectura de microservicios ligero, con un servicio de backend (FastAPI) que expone una API RESTful, y un servicio de frontend (React) que consume esta API. La base de datos PostgreSQL y una herramienta de gestión de DB (Adminer) complementan el ecosistema, todo orquestado mediante Docker Compose para un despliegue y desarrollo coherentes.
(Ver `avocado_task_manager_architecture.png` para un diagrama visual).

## 5. Decisiones Clave y Consideraciones

*   **Desarrollo Containerizado:** La decisión de usar Docker y Docker Compose desde el inicio fue fundamental para asegurar un entorno de desarrollo consistente y una fácil integración para el evaluador.
*   **Hot-Reloading en Docker:** Se configuró Vite y el backend para Hot-Reloading dentro de los contenedores Docker, lo que mejora significativamente la experiencia de desarrollo.
*   **Migraciones Automáticas:** La inclusión de Alembic en el comando de inicio del backend garantiza que la base de datos se configure automáticamente al levantar el stack.
*   **Separación de Responsabilidades:** Clara división entre frontend y backend, permitiendo el desarrollo y escalado independiente de cada parte.

## 6. Próximos Pasos (si el tiempo lo permitiera)

*   Implementación de pruebas end-to-end con Cypress para el frontend.
*   Mejora de la cobertura de pruebas unitarias en el backend.
*   Implementación de logs centralizados.
*   Adición de Circuit Breakers en el backend.
*   Optimización del build de Docker para producción.

---
**Nota para el Evaluador:** Para levantar el proyecto, simplemente clone el repositorio, navegue a la raíz del proyecto y ejecute `docker-compose up --build`.

*   **Frontend:** `http://localhost:5173`
*   **Backend (Documentación API - Swagger UI):** `http://localhost:8000/docs`
*   **Adminer (Gestión de DB):** `http://localhost:8080`
