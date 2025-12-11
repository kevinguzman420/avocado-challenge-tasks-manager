# 🥑 Avocado Task Manager

Sistema completo de gestión de tareas con FastAPI (backend) y React (frontend).

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker 20.10+
- Docker Compose 2.0+

### Levantar el Proyecto Completo

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd proyecto-avocado

# 2. Configurar variables de entorno (opcional, ya tiene valores por defecto)
cp .env.example .env

# 3. Iniciar todos los servicios
docker compose up -d

# 4. Ver logs
docker compose logs -f

# 5. Acceder a los servicios
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Adminer (DB): http://localhost:8080
```

### Detener los Servicios

```bash
docker compose down

# Para eliminar también los volúmenes (datos)
docker compose down -v
```

## 📦 Servicios Incluidos

### Backend (FastAPI)
- **Puerto**: 8000
- **Documentación**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Base de Datos (PostgreSQL)
- **Puerto**: 5434
- **Database**: avocado_db
- **Usuario**: avocado_user
- **Password**: avocado_pass_2024

### Adminer (Gestión de BD)
- **Puerto**: 8080
- **URL**: http://localhost:8080
- **Credenciales**: Ver configuración en `.env`

## 📖 Estructura del Proyecto

```
proyecto-avocado/
├── backend/               # API FastAPI
│   ├── app/              # Código fuente
│   ├── tests/            # Tests (93% cobertura)
│   ├── alembic/          # Migraciones DB
│   └── README.md         # Documentación backend
├── frontend/             # React App (próximamente)
├── docker-compose.yml    # Orquestación de servicios
└── .env                  # Variables de entorno
```

## 🛠️ Desarrollo

### Backend (FastAPI)

```bash
# Acceder al contenedor del backend
docker compose exec backend bash

# Ejecutar tests
docker compose exec backend pytest tests/ -v

# Ver cobertura
docker compose exec backend pytest tests/ --cov=app --cov-report=html

# Crear migración
docker compose exec backend alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
docker compose exec backend alembic upgrade head
```

### Ver Logs

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo base de datos
docker compose logs -f db
```

## 🧪 Testing

El backend tiene **93% de cobertura de tests** con 62 tests pasando.

```bash
# Ejecutar todos los tests
docker compose exec backend pytest tests/ -v

# Tests con cobertura
docker compose exec backend pytest tests/ -v --cov=app --cov-report=term-missing

# Tests específicos
docker compose exec backend pytest tests/test_auth.py -v
docker compose exec backend pytest tests/test_tasks.py -v
docker compose exec backend pytest tests/test_comments.py -v
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login (obtener token JWT)
- `GET /api/v1/auth/me` - Obtener usuario actual

### Tareas
- `GET /api/v1/tasks/` - Listar tareas (con filtros, búsqueda, paginación)
- `POST /api/v1/tasks/` - Crear tarea
- `GET /api/v1/tasks/{id}` - Obtener tarea específica
- `PUT /api/v1/tasks/{id}` - Actualizar tarea
- `DELETE /api/v1/tasks/{id}` - Eliminar tarea
- `GET /api/v1/tasks/statistics` - Estadísticas de tareas

### Comentarios
- `POST /api/v1/tasks/{id}/comments` - Crear comentario en tarea
- `GET /api/v1/tasks/{id}/comments` - Listar comentarios de tarea
- `PUT /api/v1/tasks/{id}/comments/{cid}` - Actualizar comentario
- `DELETE /api/v1/tasks/{id}/comments/{cid}` - Eliminar comentario

## 📊 Características

### Funcionalidades
- ✅ Autenticación JWT completa
- ✅ CRUD de tareas con filtros avanzados
- ✅ Sistema de comentarios
- ✅ Roles de usuario (Admin/Regular)
- ✅ Prioridades (High/Medium/Low)
- ✅ Asignación de tareas
- ✅ Estadísticas y métricas
- ✅ Búsqueda por texto
- ✅ Paginación
- ✅ Validación con Pydantic

### Tecnologías

#### Backend
- FastAPI 0.124.0+
- Python 3.12+
- PostgreSQL 16
- SQLAlchemy 2.0+
- Alembic (migraciones)
- JWT + Bcrypt (seguridad)
- Pytest (testing, 93% cobertura)

#### DevOps
- Docker & Docker Compose
- Hot reload en desarrollo
- Migraciones automáticas
- Health checks

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de datos con Pydantic
- ✅ CORS configurado
- ✅ Control de permisos por rol
- ✅ Contenedor no-root

## 📚 Documentación Adicional

- [Backend README](./backend/README.md) - Documentación completa del backend
- [Backend Docker Guide](./backend/DOCKER.md) - Guía de Docker del backend
- [Testing Guide](./backend/TESTING_GUIDE.md) - Guía de testing

## 🐛 Troubleshooting

### Puerto ya en uso

```bash
# Cambiar puertos en .env
BACKEND_PORT=8001
POSTGRES_PORT=5435
ADMINER_PORT=8081

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
# Detener y eliminar todo (incluyendo volúmenes)
docker compose down -v

# Reconstruir desde cero
docker compose build --no-cache
docker compose up -d
```

## 🚀 Despliegue

### Desarrollo
```bash
docker compose up -d
```

### Producción
Para producción, se recomienda:
1. Cambiar todas las contraseñas en `.env`
2. Generar un `SECRET_KEY` seguro aleatorio
3. Configurar dominio y SSL/TLS
4. Usar un proxy reverso (Nginx)
5. Implementar backups automáticos
6. Configurar monitoring

## 📊 Estado del Proyecto

| Componente | Estado | Cobertura |
|------------|--------|-----------|
| Backend API | ✅ Completo | 100% |
| Tests Backend | ✅ Completo | 93% |
| Docker Setup | ✅ Completo | 100% |
| Documentación | ✅ Completa | 100% |
| Frontend | 🚧 En desarrollo | - |

## 📧 Soporte

Para preguntas o problemas, revisar la documentación en `backend/README.md` o contactar al equipo de desarrollo.

## 📄 Licencia

Proyecto privado y confidencial.

---

**Versión**: 1.0.0  
**Última actualización**: 10 de diciembre de 2025  
**Estado**: ✅ Backend Production Ready
