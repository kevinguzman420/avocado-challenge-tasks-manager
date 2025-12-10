# Avocado Task Manager - Backend

## Comandos para Ejecutar el Proyecto

### 1. Levantar la Base de Datos PostgreSQL (si usas Docker)
```bash
cd /home/kevinguzman/Documentos/Programming/FastAPI/proyecto-avocado
docker compose -f docker-compose.dev.yml up -d
```

### 2. Activar el Entorno Virtual y Ejecutar el Servidor
```bash
cd /home/kevinguzman/Documentos/Programming/FastAPI/proyecto-avocado/backend

# Opción 1: Con uv (recomendado)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Activando el entorno manualmente
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Verificar que el Servidor Esté Corriendo
```bash
curl http://localhost:8000/
```

Deberías ver:
```json
{
  "status": "healthy",
  "project": "Avocado Task Manager",
  "version": "0.1.0"
}
```

## URLs Importantes

- **API Base**: `http://localhost:8000`
- **Documentación Swagger**: `http://localhost:8000/docs`
- **Documentación ReDoc**: `http://localhost:8000/redoc`
- **API v1 Base**: `http://localhost:8000/api/v1`

## Endpoints para Postman

### 📋 Colección de Endpoints

#### 1. Health Check
```
GET http://localhost:8000/
```

#### 2. Registro de Usuario
```
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin12345",
  "full_name": "Admin User",
  "role": "admin"
}
```

#### 3. Login
```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin@test.com
password=admin12345
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 4. Obtener Usuario Actual
```
GET http://localhost:8000/api/v1/auth/me
Authorization: Bearer {access_token}
```

#### 5. Crear Tarea
```
POST http://localhost:8000/api/v1/tasks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Completar documentación",
  "description": "Documentar todos los endpoints de la API",
  "priority": "high",
  "due_date": "2025-12-15T18:00:00Z"
}
```

#### 6. Listar Tareas (con filtros)
```
GET http://localhost:8000/api/v1/tasks?skip=0&limit=10&priority=high&completed=false&sort_by=created_at&sort_order=desc
Authorization: Bearer {access_token}
```

#### 7. Obtener Tarea por ID
```
GET http://localhost:8000/api/v1/tasks/{task_id}
Authorization: Bearer {access_token}
```

#### 8. Actualizar Tarea
```
PUT http://localhost:8000/api/v1/tasks/{task_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Título actualizado",
  "completed": true
}
```

#### 9. Eliminar Tarea
```
DELETE http://localhost:8000/api/v1/tasks/{task_id}
Authorization: Bearer {access_token}
```

#### 10. Obtener Estadísticas
```
GET http://localhost:8000/api/v1/tasks/statistics
Authorization: Bearer {access_token}
```

#### 11. Crear Comentario en Tarea
```
POST http://localhost:8000/api/v1/tasks/{task_id}/comments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "Este es un comentario de prueba"
}
```

#### 12. Obtener Comentarios de una Tarea
```
GET http://localhost:8000/api/v1/tasks/{task_id}/comments
Authorization: Bearer {access_token}
```

## Configuración en Postman

### 1. Variables de Entorno
Crea un ambiente en Postman con:
- `base_url`: `http://localhost:8000`
- `api_v1`: `{{base_url}}/api/v1`
- `token`: (se actualizará después del login)

### 2. Pre-request Script para Token
En la carpeta/colección, agrega este script:
```javascript
// Si existe el token en las variables de entorno, úsalo
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("token")
    });
}
```

### 3. Test Script para Login
En el endpoint de login, agrega:
```javascript
// Guardar el token automáticamente
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.access_token);
}
```

## Flujo de Prueba Recomendado

1. **Health Check** - Verificar que el servidor funciona
2. **Register** - Crear usuario admin
3. **Login** - Obtener token JWT
4. **Me** - Verificar usuario autenticado
5. **Create Task** - Crear varias tareas
6. **List Tasks** - Listar con diferentes filtros
7. **Statistics** - Ver estadísticas
8. **Update Task** - Marcar como completada
9. **Add Comment** - Agregar comentarios
10. **Delete Task** - Eliminar tarea

## Comandos de Utilidad

### Ver logs del servidor
```bash
tail -f /tmp/uvicorn.log
```

### Detener el servidor
```bash
pkill -f "uvicorn app.main:app"
```

### Ver estado de la base de datos
```bash
PGPASSWORD=avocado_pass_2024 psql -U avocado_user -h localhost -d avocado_db -c "\dt"
```

### Reiniciar todo
```bash
# Detener servidor
pkill -f uvicorn

# Reiniciar servidor
cd /home/kevinguzman/Documentos/Programming/FastAPI/proyecto-avocado/backend
uv run uvicorn app.main:app --reload
```
