
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Función genérica para manejar errores
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    return response.json();
};

// Función para obtener tareas (con o sin paginación, con o sin búsqueda)
export const getTasks = async (token, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append('page', params.page);
    }
    if (params.limit) {
        queryParams.append('limit', params.limit);
    }
    if (params.q) {
        queryParams.append('q', params.q);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/tasks${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const res = await handleResponse(response);
    return res.data;
};


// Función para obtener una tarea por ID
export const getTaskById = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const res = await handleResponse(response);
    return res.data;
};

// Función para crear una nueva tarea
export const createTask = async (taskData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    const res = await handleResponse(response);
    return res.data;
};

// Función para actualizar una tarea
export const updateTask = async (id, taskData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    const res = await handleResponse(response);
    return res.data;
};

// Función para eliminar una tarea
export const deleteTask = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return handleResponse(response);
};

// Función para obtener tareas por estado
export const getTasksByStatus = async (status, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/status/${status}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const res = await handleResponse(response);
    return res.data;
};

// Función para obtener estadísticas de tareas
export const getTaskStats = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return handleResponse(response);
};

// Funciones de autenticación

// Registro de usuario
export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    return handleResponse(response);
};

// Login de usuario
export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    return handleResponse(response);
};