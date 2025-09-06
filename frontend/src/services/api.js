const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Obtener todas las tareas
export const getTasks = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Error fetching tasks');
    }
    
    const res = await response.json();
    return res.data || []; // <-- extraer solo el array de tareas
};

// Crear una nueva tarea
export const createTask = async (taskData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
        throw new Error('Error creating task');
    }
    
    return response.json();
};

// Registro de usuario
export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
    }
    
    return response.json();
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
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
    }

    const data = await response.json();
    return {
        token: data.token, // <-- devuelve solo el token
        user: data.user
    };
};

// Obtener estadísticas de tareas
export const getTaskStats = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Error fetching task statistics');
    }
    
    return response.json();
};

// Buscar tareas
export const searchTasks = async (searchTerm, token) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return []; // o lanzar un error si prefieres
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.warn('Error en búsqueda:', errorData);
        throw new Error(errorData.message || 'Error al buscar tareas');
    }

    const res = await response.json();
    return res.data || [];
};

// Obtener tareas por estado
export const getTasksByStatus = async (status, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/status/${status}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Error fetching tasks by status');
    }
    
    const res = await response.json();
    return res.data || [];
};

// Obtener tareas con paginación
export const getTasksWithPagination = async (page = 1, limit = 10, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks?page=${page}&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Error fetching tasks with pagination');
    }
    
    const res = await response.json();
    return res.data || [];
};

// Actualizar tarea
export const updateTask = async (id, taskData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        throw new Error('Error updating task');
    }

    return response.json();
};

// Eliminar tarea
export const deleteTask = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Error deleting task');
    }

    return response.json();
};
