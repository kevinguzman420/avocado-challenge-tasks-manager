# 🥑 Avocado Task Manager - Backend

Sistema de gestión de tareas completo desarrollado con FastAPI, PostgreSQL y Docker.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Instalación](#-instalación)
- [Documentación](#-documentación)
- [Testing](#-testing)
- [Docker](#-docker)
- [API Endpoints](#-api-endpoints)

## ✨ Características

### Funcionalidades Principales
- ✅ **Autenticación JWT** - Sistema completo de registro, login y gestión de usuarios
- ✅ **Gestión de Tareas** - CRUD completo con filtros, búsqueda y paginación
- ✅ **Sistema de Comentarios** - Comentarios en tareas con permisos
- ✅ **Roles de Usuario** - Admin y Regular con permisos diferenciados
- ✅ **Estadísticas** - Dashboard con métricas de tareas
- ✅ **Prioridades** - High, Medium, Low para tareas
- ✅ **Asignación** - Asignar tareas a usuarios específicos
- ✅ **Fechas límite** - Control de vencimiento de tareas

### Características Técnicas
- 🔐 **Seguridad** - Bcrypt para passwords, JWT para autenticación
- 📊 **Base de datos** - PostgreSQL con Alembic para migraciones
- 🧪 **Testing** - 93% de cobertura con pytest
- 🐳 **Docker** - Containerización completa con docker-compose
- 📝 **Documentación** - Swagger UI y ReDoc automáticos
- 🔄 **CORS** - Configurado para frontend
- ✅ **Validación** - Pydantic para validación de datos

## 🛠️ Stack Tecnológico

### Core
- **FastAPI** 0.124.0+ - Framework web moderno
- **Python** 3.12+ - Lenguaje de programación
- **PostgreSQL** 16 - Base de datos relacional
- **SQLAlchemy** 2.0+ - ORM
- **Alembic** - Migraciones de base de datos

### Autenticación & Seguridad
- **python-jose** - JWT tokens
- **bcrypt** - Hash de contraseñas
- **passlib** - Utilidades de seguridad

### Testing
- **pytest** - Framework de testing
- **pytest-cov** - Cobertura de código
- **pytest-asyncio** - Tests asíncronos
- **httpx** - Cliente HTTP para tests

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación de servicios
- **uv** - Gestor de paquetes rápido

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# Desde la RAÍZ del proyecto (proyecto-avocado/)
cd proyecto-avocado

# Iniciar servicios
docker compose up -d
# O usar: make up

# Ver logs
docker compose logs -f backend
# O usar: make backend-logs

# Acceder a la API
open http://localhost:8000/docs
```

**Nota**: El backend se maneja desde el `docker-compose.yml` en la raíz del proyecto, no desde el directorio `backend/`.

### Opción 2: Local

```bash
# Instalar dependencias
pip install uv
uv pip install -r pyproject.toml

# Configurar PostgreSQL (debe estar corriendo)
createdb avocado_db
createuser avocado_user

# Configurar .env
cp .env.example .env
# Editar .env con tus valores

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload

# Acceder a la API
open http://localhost:8000/docs
```

## 📦 Instalación

### Prerrequisitos

- Python 3.12+
- PostgreSQL 16+
- Docker & Docker Compose (opcional)
- Git

### Instalación Local Detallada

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd backend

# 2. Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 3. Instalar uv (gestor de paquetes rápido)
pip install uv

# 4. Instalar dependencias
uv pip install -r pyproject.toml

# 5. Configurar PostgreSQL
sudo -u postgres psql
postgres=# CREATE DATABASE avocado_db;
postgres=# CREATE USER avocado_user WITH PASSWORD 'avocado_pass_2024';
postgres=# GRANT ALL PRIVILEGES ON DATABASE avocado_db TO avocado_user;
postgres=# \q

# 6. Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores

# 7. Ejecutar migraciones
alembic upgrade head

# 8. Iniciar servidor de desarrollo
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Variables de Entorno (.env)

```env
# Database
DATABASE_URL=postgresql://avocado_user:avocado_pass_2024@localhost/avocado_db

# Security
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENV_FILE=.env
```

## 📖 Documentación

### Documentación Disponible

| Documento | Descripción |
|-----------|-------------|
| [../README.md](../README.md) | Documentación completa del proyecto (raíz) |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Guía de testing con ejemplos |
| [API Docs](http://localhost:8000/docs) | Documentación Swagger UI |
| [ReDoc](http://localhost:8000/redoc) | Documentación ReDoc |

### Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # Endpoints de autenticación
│   │       ├── tasks.py     # Endpoints de tareas
│   │       ├── comments.py  # Endpoints de comentarios
│   │       └── api.py       # Router principal
│   ├── core/
│   │   ├── security.py      # JWT y bcrypt
│   │   └── exceptions.py    # Excepciones custom
│   ├── crud/
│   │   ├── user.py          # CRUD usuarios
│   │   ├── task.py          # CRUD tareas
│   │   └── comment.py       # CRUD comentarios
│   ├── db/
│   │   ├── base.py          # Base SQLAlchemy
│   │   └── session.py       # Sesión de BD
│   ├── models/
│   │   ├── user.py          # Modelo User
│   │   ├── task.py          # Modelo Task
│   │   └── comment.py       # Modelo Comment
│   ├── schemas/
│   │   ├── user.py          # Schemas Pydantic
│   │   ├── task.py
│   │   ├── comment.py
│   │   └── common.py
│   ├── config.py            # Configuración
│   ├── dependencies.py      # Dependencias FastAPI
│   └── main.py              # App principal
├── alembic/
│   ├── versions/            # Migraciones
│   └── env.py               # Config Alembic
├── tests/
│   ├── conftest.py          # Fixtures pytest
│   ├── test_auth.py         # Tests autenticación
│   ├── test_tasks.py        # Tests tareas
│   └── test_comments.py     # Tests comentarios
├── Dockerfile               # Imagen producción
├── Dockerfile.dev           # Imagen desarrollo
└── pyproject.toml           # Dependencias
```

**Nota**: La orquestación Docker (`docker-compose.yml`) y los comandos de automatización (`Makefile`) se encuentran en la raíz del proyecto (`proyecto-avocado/`), no en este directorio.

## 🧪 Testing

### Ejecutar Tests

```bash
# Desde la raíz del proyecto (proyecto-avocado/)
cd proyecto-avocado

# Ejecutar todos los tests
make test
# O: docker compose exec backend pytest tests/ -v

# Con cobertura
make test-cov
# O: docker compose exec backend pytest tests/ -v --cov=app --cov-report=html

# Tests específicos
docker compose exec backend pytest tests/test_auth.py -v
docker compose exec backend pytest tests/test_tasks.py -v
docker compose exec backend pytest tests/test_comments.py -v

# Localmente (si no usas Docker)
cd backend
pytest tests/ -v
```

### Cobertura Actual

```
Name                         Stmts   Miss  Cover
----------------------------------------------------------
app/api/v1/auth.py              32      0   100%
app/api/v1/tasks.py             53      1    98%
app/api/v1/comments.py          48      3    94%
app/crud/task.py                81      3    96%
app/crud/comment.py             34      2    94%
app/core/security.py            31      3    90%
app/schemas/*                  ***      0   100%
----------------------------------------------------------
TOTAL                          608     45    93%
```

**✅ 93% de cobertura total (objetivo: 85%)**

### Resumen de Tests

- ✅ **62 tests** en total
- ✅ **test_auth.py**: 13 tests (registro, login, tokens)
- ✅ **test_tasks.py**: 29 tests (CRUD, filtros, permisos)
- ✅ **test_comments.py**: 20 tests (CRUD, permisos)

## 🐳 Docker

### Comandos desde la Raíz del Proyecto

**Importante**: El backend se gestiona desde el `docker-compose.yml` en la raíz del proyecto (`proyecto-avocado/`).

```bash
# Desde proyecto-avocado/
cd proyecto-avocado

# Comandos principales
make up              # Iniciar todos los servicios
make down            # Detener servicios
make logs            # Ver logs de todos
make backend-logs    # Ver solo logs del backend
make status          # Ver estado de servicios

# Utilidades
make backend-shell   # Acceder al contenedor del backend
make db-shell        # Acceder a PostgreSQL
make test            # Ejecutar tests
make migrate         # Aplicar migraciones
make migration       # Crear migración
make clean           # Limpiar todo

# O directamente con Docker Compose
docker compose up -d
docker compose logs -f backend
docker compose exec backend bash
docker compose down
```

### Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Backend | 8000 | API FastAPI |
| PostgreSQL | 5434 | Base de datos |
| Adminer | 8080 | Admin DB |

### URLs de Acceso

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Adminer**: http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: db
  - Usuario: avocado_user
  - Password: avocado_pass_2024
  - Database: avocado_db

## 🔌 API Endpoints

### Autenticación

```http
POST   /api/v1/auth/register     # Registrar usuario
POST   /api/v1/auth/login        # Login (obtener token)
GET    /api/v1/auth/me           # Obtener usuario actual
```

### Tareas

```http
GET    /api/v1/tasks/            # Listar tareas (con filtros)
POST   /api/v1/tasks/            # Crear tarea
GET    /api/v1/tasks/{id}        # Obtener tarea
PUT    /api/v1/tasks/{id}        # Actualizar tarea
DELETE /api/v1/tasks/{id}        # Eliminar tarea
GET    /api/v1/tasks/statistics  # Obtener estadísticas
```

### Comentarios

```http
POST   /api/v1/tasks/{id}/comments           # Crear comentario
GET    /api/v1/tasks/{id}/comments           # Listar comentarios
PUT    /api/v1/tasks/{id}/comments/{cid}     # Actualizar comentario
DELETE /api/v1/tasks/{id}/comments/{cid}     # Eliminar comentario
```

### Ejemplos de Uso

#### Registro de Usuario

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "full_name": "John Doe"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepass123"
```

#### Crear Tarea

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nueva tarea",
    "description": "Descripción de la tarea",
    "priority": "high"
  }'
```

#### Listar Tareas con Filtros

```bash
# Filtrar por prioridad y completadas
curl "http://localhost:8000/api/v1/tasks/?priority=high&completed=false" \
  -H "Authorization: Bearer <token>"

# Búsqueda por texto
curl "http://localhost:8000/api/v1/tasks/?search=importante" \
  -H "Authorization: Bearer <token>"
```

## 🗂️ Base de Datos

### Modelos

#### User
- id (PK)
- email (unique)
- hashed_password
- full_name
- role (admin/regular)
- is_active
- created_at

#### Task
- id (PK)
- title
- description
- completed
- priority (high/medium/low)
- due_date
- created_by (FK User)
- assigned_to (FK User)
- created_at
- updated_at

#### Comment
- id (PK)
- content
- task_id (FK Task)
- user_id (FK User)
- created_at

### Migraciones

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history

# En Docker
make migration      # Crear
make migrate        # Aplicar
make rollback       # Revertir
```

## 🔒 Seguridad

### Implementado
- ✅ Bcrypt para hash de contraseñas
- ✅ JWT para autenticación
- ✅ Validación de datos con Pydantic
- ✅ CORS configurado
- ✅ Permisos por rol (Admin/Regular)
- ✅ Contenedor no-root en Docker

### Recomendaciones para Producción
- [ ] Cambiar SECRET_KEY a valor seguro aleatorio
- [ ] Usar HTTPS/SSL
- [ ] Implementar rate limiting
- [ ] Configurar firewall
- [ ] Backups automáticos de BD
- [ ] Monitoring y logging
- [ ] Variables de entorno seguras

## 📊 Performance

### Optimizaciones
- ✅ Paginación en endpoints de listado
- ✅ Índices en campos de búsqueda
- ✅ Eager loading de relaciones
- ✅ Connection pooling en SQLAlchemy
- ✅ Caché de configuración

### Métricas
- Tiempo de respuesta promedio: <50ms
- Tests: 62 pasando en ~45s
- Build Docker: ~74s
- Cobertura de tests: 93%

## 🐛 Troubleshooting

### Puerto ya en uso

```bash
# Cambiar puerto en el archivo .env de la raíz del proyecto
# proyecto-avocado/.env
BACKEND_PORT=8001
POSTGRES_PORT=5435
```

### Base de datos no conecta

```bash
# Verificar PostgreSQL
docker compose logs db

# Reiniciar servicios
docker compose restart db backend
```

### Migraciones fallan

```bash
# Acceder al contenedor
docker compose exec backend bash

# Verificar migraciones
alembic current
alembic history

# Aplicar manualmente
alembic upgrade head
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📧 Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 10 de diciembre de 2025  
**Estado**: ✅ Producción Ready
