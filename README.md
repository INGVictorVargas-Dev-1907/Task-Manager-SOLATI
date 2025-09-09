# 🚀 Task Manager - SOLATI

¡Bienvenido al Gestor de Tareas Avanzado! Este es un sistema completo de gestión de tareas con una API RESTful desarrollada en PHP y un frontend dinámico creado con React. Todo el entorno está contenerizado con Docker para un despliegue rápido y consistente.

---

## 🚀 Características  Principales
El proyecto está diseñado con las mejores prácticas en mente, ofreciendo:

- Arquitectura Modular: Backend con PHP (Slim Framework) y un frontend en React.
- Autenticación Segura: Implementación de tokens JWT para proteger las rutas de la API.
-  Persistencia de Datos: Una base de datos PostgreSQL contenerizada para el almacenamiento de tareas.
- Experiencia de Usuario: Interfaz de usuario intuitiva y responsive gracias a React y Bootstrap.
- Código Sólido: Adopta patrones de diseño como MVC y Repository para una lógica clara y fácil de mantener.
- CRUD completo de tareas
- Validación de datos en frontend y backend
-  Documentación Completa: Documentación interactiva de la API con apidoc, directamente desde los comentarios del código.
-  Validación Doble: Validación de datos tanto en el frontend como en el backend para una mayor seguridad.
- ✅ Diseño responsive para móviles y desktop

---

## 📋 Requisitos Previos
Asegúrate de tener instalado y configurado lo siguiente en tu sistema:

- Docker y Docker Compose
- Node.js 16+ y npm
- Git (opcional)

---

## ⚙️ Tecnologías Utilizadas
Este proyecto se construye sobre una sólida pila de tecnologías modernas para un desarrollo eficiente y escalable.

### Backend
| Tecnología | Descripción |
|------------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-plain.svg" width="30" height="30" alt="PHP"/> **PHP 8.2** | El lenguaje de programación principal del lado del servidor. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slim/slim-plain.svg" width="30" height="30" alt="Slim"/> **Slim Framework 4** | Un micro-framework de PHP para construir la API RESTful. |
| 🔑 **Firebase JWT** | Biblioteca para manejar la autenticación con JSON Web Tokens. |
| ⚙️ **phpdotenv** | Para manejar las variables de entorno de la aplicación. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" width="30" height="30" alt="Nginx"/> **Nginx** | Servidor web ligero y de alto rendimiento que sirve la API. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-plain.svg" width="30" height="30" alt="Docker"/> **Docker & Docker Compose** | Para la contenerización y orquestación de la API y la base de datos. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg" width="30" height="30" alt="PostgreSQL"/> **PostgreSQL (ext-pgsql)** | Un sistema de gestión de bases de datos relacional robusto. |

---

### Frontend
| Tecnología | Descripción |
|------------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="30" height="30" alt="React"/> **React** | La biblioteca de JavaScript para construir la interfaz de usuario. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-plain.svg" width="30" height="30" alt="Bootstrap"/> **React Bootstrap & Bootstrap 5.3.8** | Frameworks CSS para un diseño responsive y atractivo. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-plain.svg" width="30" height="30" alt="React Router"/> **React Router DOM 7.8.2** | Para manejar la navegación en la aplicación. |
| 📡 **Axios 1.11.0** | Cliente HTTP para realizar peticiones a la API desde el frontend. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-plain.svg" width="30" height="30" alt="React Icons"/> **React Icons 5.5.0** | Biblioteca de iconos para la interfaz de usuario. |
**React Toastify** | Biblioteca de alertas de notificaciónes. |

---

### Herramientas de Desarrollo
| Herramienta | Descripción |
|-------------|-------------|
| 📄 **apidoc** | Generador de documentación de API a partir de comentarios en el código. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="30" height="30" alt="npm"/> **npm** | Gestor de paquetes de Node.js. |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/composer/composer-original.svg" width="30" height="30" alt="Composer"/> **Composer** | Gestor de dependencias de PHP. |
| 🧪 **PHPUnit** | Un framework de pruebas unitarias para PHP. |
=======
Sistema completo de gestión de tareas con autenticación de usuarios, desarrollado para SOLATI S.A.S.

---

## 🚀 Características
### Backend (PHP)
- **API RESTful** completa con endpoints para gestión de tareas 
- **Autenticación JWT** segura  
- **Base de datos PostgreSQL** contenerizada  
- **CRUD** completo de tareas  
- **Validación de datos** en frontend y backend  
- **Patrón MVC y Repository** para separación de responsabilidades 

### Frontend (React.js)
- **Interfaz moderna** con React Bootstrap
- **Gestión de estado** con React Hooks
- **Formularios interactivos** con validación en tiempo real
- **Filtros y búsqueda** de tareas
- **Paginación** eficiente
- **Notificaciones** toast y alertas contextuales
- **Diseño responsive** y profesional

---

## 🛠️ Tecnologías Utilizadas

### Backend
- PHP 7.4+
- JWT Authentication
- MySQL Database
- Swagger-PHP para documentación
- Composer para gestión de dependencias

### Frontend
- React.js 18+
- React Bootstrap
- React Icons
- Axios para peticiones HTTP
- CSS3 con diseño moderno

---

## 📦 Instalación y Configuración

### Prerrequisitos
- PHP 7.4 o superior
- Composer
- Node.js 16+
- MySQL 5.7+
- Servidor web (Apache/Nginx)

### 1. Clonar el repositorio
```bash
git clone https://github.com/INGVictorVargas-Dev-1907/Task_Manager-SOLATI.git
cd task-manager
```

---

## 🏗️ Arquitectura
```bash
task-manager/
├── 📁 backend/  # API RESTful en PHP (Contenedor Docker)
│ ├── 📁 apidoc-nginx/ # documentacion API y servidor web
│ ├── 📁 app/ # Lógica del API, controladores, modelos, repositorios etc.
│ ├── 📁 public/ # Punto de entrada de la aplicación
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

## 🛠️ Instalación y Configuración

### 1. Clonar o Descargar el Proyecto
```bash
git clone <url-del-repositorio>
cd task-manager
```

### 2. Configuración de Variables de Entorno
Backend (API):
Navega al directorio backend/ y crea el archivo .env a partir del ejemplo.
```bash
cd backend
cp .env.example .env
```
Edita el archivo .env con tus credenciales y configuraciones. Es crucial que definas DB_PASS y JWT_SECRET con valores seguros y únicos.

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


### 3. Frontend (React):
Vuelve al directorio principal, navega a frontend/ y crea el archivo .env.

---

### 3. Configurar el Frontend
```bash
cd ../frontend
cp .env.example .env
```

#### Archivo frontend/.env:
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_APP_NAME=nombre_de_la_app
REACT_APP_VERSION=1.0.0
```

### 4. Instalar Dependencias del Frontend
Permanece en el directorio frontend/ e instala las dependencias de Node.js:
```bash
npm install
```

---

### 🚀 Ejecución del Sistema
El sistema se ejecuta en dos partes. Necesitarás dos terminales.

#### Terminal 1 (Backend y Base de Datos):
Desde el directorio backend/, inicia los contenedores de Docker.
```bash
cd backend
docker-compose up --build
```
Este comando construirá las imágenes, creará los contenedores de PHP y PostgreSQL, y los ejecutará en segundo plano.

#### Terminal 2 (Frontend):
Desde el directorio frontend/, inicia la aplicación React.
```bash
cd frontend
npm start
```

---


## 🌐 URLs de nuesto Backend - contenerizado en Docker

| Servicio        | URL                          | Descripción       |
|-----------------|-----------------------------|-----------------|
| Aplicación React       | http://localhost:3000       | Aplicación React |
| API RESTful Backend     | http://localhost:8080       | API RESTful      |
| Documentación de la API (apidoc)  |(Acceso) http://localhost:8081/ | APIDOC(apiDoc )    |

---

## Comandos Útiles

### Docker (backend/)

| Comando                         | Descripción                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| `docker-compose up --build`     | Inicia y construye las imágenes antes de levantar los contenedores. (Backend, DB - **primer plano**) |
| `docker-compose down`           | Detiene y elimina todos los contenedores.                                   |
| `docker-compose logs`           | Muestra los logs de un servicio específico (ej: `api`, `db`).               |
| `docker ps`                     | Lista los contenedores en ejecución.                                        |
| `docker-compose up --build -d`  | Reconstruye y levanta los contenedores en **segundo plano** (el terminal queda libre). |


### Node.js (en frontend/)
### NPM

| Comando        | Descripción                                   |
|----------------|-----------------------------------------------|
| `npm install`  | Instala todas las dependencias del proyecto.  |
| `npm start`    | Inicia la aplicación en modo desarrollo.      |


---

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

---


## 📋 Endpoints de la API

#### 🔐 Rutas de Autenticación

| Método   | Endpoint      | Descripción                 |
|----------|---------------|-----------------------------|
| 🟡 POST  | /api/register | Registrar un nuevo usuario. |
| 🟡 POST  | /api/login    | Iniciar sesión de usuario.  |
| POST    | /api/logout   | Cerrrar sesión        |


---


#### 🔒 Rutas Protegidas (requieren autenticación con JWT)
| Método   | Endpoint                  | Descripción                                  |
|----------|---------------------------|----------------------------------------------|
| 🟢 GET   | /api/tasks/search         | Buscar tareas por filtros.                   |
| 🟢 GET   | /api/tasks/status/{status}| Obtener tareas filtradas por estado.         |
| 🟢 GET   | /api/tasks                | Obtener todas las tareas - paginadas.                    |
| 🟢 GET   | /api/tasks/{id}           | Obtener una tarea específica por ID.         |
| 🟡 POST  | /api/tasks                | Crear una nueva tarea.                       |
| 🔵 PUT   | /api/tasks/{id}           | Actualizar una tarea existente.              |
| 🔴 DELETE| /api/tasks/{id}           | Eliminar una tarea existente.                |

### 🔐 Autenticación API
Para interactuar con los endpoints de tareas, primero necesitas autenticarte.

Content-Type: application/json

1. Registro de Usuario
Endpoint:
```http
POST http://localhost:8080/api/register
```

```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "una_contraseña_segura"
}
```

2. Login de Usuario
Endpoint:
```http
POST http://localhost:8080/api/login
```

```json
{
  "email": "juan@ejemplo.com",
  "password": "una_contraseña_segura"
}
```
La respuesta te dará un token JWT que debes usar para las siguientes peticiones.

3. Usar el Token
Incluye el token JWT en el encabezado Authorization de tus peticiones, con el prefijo Bearer.

##### Ejemplo de petición
```http
GET http://localhost:8080/api/tasks
Authorization: Bearer <tu_token_jwt_aqui>
```

##### Ejemplo de Tarea:
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

---


### 🔄 Estados de carga y manejo de errores

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
`

---


### 🤝 Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (git checkout -b feature/AmazingFeature)
3. Commit tus cambios (git commit -m 'Add some AmazingFeature')
4. Push a la rama (git push origin feature/AmazingFeature)
5. Abre un Pull Request

---

### 📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

## 👨‍💻 Autor

**Victor Vargas** - [![GitHub](https://img.shields.io/badge/GitHub-INGVictorVargas--Dev--1907-181717?style=flat&logo=github)](https://github.com/INGVictorVargas-Dev-1907)
