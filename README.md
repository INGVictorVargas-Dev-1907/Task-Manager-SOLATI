# 📋 Sistema de Gestión de Tareas

Sistema completo de gestión de tareas con API RESTful contenerizada en PHP y frontend en React.

---

## 🚀 Características

- ✅ API RESTful contenerizada con PHP Slim Framework  
- ✅ Frontend React con Bootstrap responsive  
- ✅ Autenticación JWT segura  
- ✅ Base de datos PostgreSQL contenerizada  
- ✅ CRUD completo de tareas  
- ✅ Validación de datos en frontend y backend  
- ✅ Documentación Swagger integrada  
- ✅ Patrón MVC y Repository  
- ✅ Diseño responsive para móviles y desktop  

---

## 🏗️ Arquitectura
```bash
task-manager/
├── 📁 backend/ # API PHP (Contenerizada)
│ ├── 📁 app/ # Lógica de la aplicación
│ ├── 📁 public/ # Punto de entrada
│ ├── 📁 database/ # Esquemas de BD
│ ├── 🐳 Dockerfile # Definición del contenedor
│ ├── 🐳 docker-compose.yml # Orquestación
│ └── 📄 .env # Variables de entorno
│
├── 📁 frontend/ # React App (Tradicional)
│ ├── 📁 src/ # Componentes React
│ ├── 📁 public/ # Archivos públicos
│ └── 📄 package.json # Dependencias
│
└── 📄 README.md # Documentación
```

---

## 📋 Requisitos Previos

- Docker y Docker Compose
- Node.js 16+ y npm
- Git (opcional)

---

## 🛠️ Instalación y Configuración

### 1. Clonar o Descargar el Proyecto
```bash
git clone <url-del-repositorio>
cd task-manager
```

### 2. Configurar el Backend (API)
```bash
cd backend
cp .env.example .env
```

#### variabes de entorno
```env
# CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
DB_HOST=db
DB_NAME=taskdb
DB_USER=taskuser
DB_PASS=tu_password_seguro_aqui
DB_PORT=5432

# CONFIGURACIÓN JWT (AUTENTICACIÓN)
JWT_SECRET=tu_clave_super_secreta_jwt_muy_larga_y_compleja_aqui
JWT_EXPIRE=3600

# ENTORNO DE EJECUCIÓN
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080

# CONFIGURACIÓN CORS (FRONTEND)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Configurar el Frontend
```bash
cd ../frontend
cp .env.example .env
```

#### Archivo frontend/.env:
REACT_APP_API_URL=http://localhost:8080
REACT_APP_APP_NAME=nombre_de_la_app
REACT_APP_VERSION=1.0.0


### 4. Instalar Dependencias del Frontend
```bash
npm install
```

### 🚀 Ejecución del Sistema
Opción A: Ejecución Completa (Recomendada)
Terminal 1 - API y Base de Datos:
```bash
cd backend
docker-compose up --build
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## 🌐 URLs de Acceso

| Servicio        | URL                          | Descripción       |
|-----------------|-----------------------------|-----------------|
| Frontend        | http://localhost:3000       | Aplicación React |
| API Backend     | http://localhost:8080       | API RESTful      |
| Documentación   | http://localhost:8080/api/docs | Swagger UI    |
| Base de Datos   | localhost:5432              | PostgreSQL       |

### 📊 Estructura de la Base de Datos
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completada')),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🔐 Autenticación API
Registro de Usuario
```http
POST /api/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

Login de Usuario
```http
POST /api/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

Uso de Token JWT
```http
GET /api/tasks
Authorization: Bearer <jwt_token>
```

## 📋 Endpoints de la API

**Tareas (Requieren autenticación)**

| Método | Endpoint           | Descripción               |
|--------|------------------|--------------------------|
| GET    | /api/tasks        | Obtener todas las tareas |
| POST   | /api/tasks        | Crear nueva tarea        |
| PUT    | /api/tasks/{id}   | Actualizar tarea         |
| DELETE | /api/tasks/{id}   | Eliminar tarea           |

Ejemplo de Tarea:
```json
{
  "id": 1,
  "title": "Reunión importante",
  "description": "Preparar presentación para la reunión",
  "status": "pendiente",
  "user_id": 1,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z"
}
```

### Solución de Problemas

Error de Conexión a la Base de Datos
```bash
docker ps
docker-compose logs db
```

Error de CORS
```env
REACT_APP_API_URL=http://localhost:8080
```

Puerto ya en Uso
```yml
# docker-compose.yml
ports:
  - "8081:80"  # Cambiar puerto externo
```

## Comandos Útiles
Docker
```bash
docker ps                 # Ver contenedores en ejecución
docker-compose logs api    # Ver logs de la API
docker-compose down        # Detener todos los contenedores
docker-compose up --build  # Reconstruir contenedores
```

### 📝 Estructura de Archivos del Backend
```bash
backend/
├── app/
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Controladores (Auth, Task)
│   ├── middlewares/     # Middleware de autenticación
│   ├── models/          # Modelos (User, Task)
│   └── repositories/    # Patrón Repository
├── database/
│   └── schema.sql       # Esquema de base de datos
├── public/
│   └── index.php        # Punto de entrada
└── vendor/              # Dependencias Composer
```

### Frontend Componentes
```bash
frontend/src/
├── components/
│   ├── Login.js         # Componente de login
│   ├── Register.js      # Componente de registro
│   ├── TaskForm.js      # Formulario de tareas
│   └── TaskList.js      # Lista de tareas
├── services/
│   └── api.js           # Servicios de API
└── App.js               # Componente principal
```

### 📄 Licencia

Este proyecto está bajo la Licencia MIT.

### Autor
Victor Vargas Diaz
