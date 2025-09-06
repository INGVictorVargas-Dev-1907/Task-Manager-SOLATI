import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Navbar, Row } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import Login from './components/Login';
import Pagination from './components/Pagination';
import Register from './components/Register';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import {
  createTask,
  deleteTask,
  getTasks,
  getTasksByStatus,
  login,
  register,
  searchTasks,
  updateTask
} from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // fetchTasks con useCallback para evitar recreación en cada render
  const fetchTasks = useCallback(async (authToken = token) => {
    try {
      setLoading(true);
      setError('');
      const tasksData = await getTasks(authToken);
      setTasks(tasksData);
    } catch (error) {
      setError('Error al cargar las tareas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependencia: token

  // Cargar token y usuario desde localStorage al iniciar la app
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchTasks(savedToken);
    }
  }, [fetchTasks]);

  // Aplicar filtros cuando cambien tareas o filtros
  const applyFilters = useCallback(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);

    const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [tasks, searchTerm, statusFilter, itemsPerPage, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getCurrentPageTasks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  };

  // Manejo de búsqueda
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term) {
      try {
        setLoading(true);
        const results = await searchTasks(term, token);
        setFilteredTasks(results);
      } catch (error) {
        setError('Error en la búsqueda: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejo de filtros por estado
  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    if (status !== 'all') {
      try {
        setLoading(true);
        const filtered = await getTasksByStatus(status, token);
        setFilteredTasks(filtered);
      } catch (error) {
        setError('Error al filtrar tareas: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    fetchTasks();
  };

  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      setError('');
      await createTask(taskData, token);
      setShowForm(false);
      setSuccess('Tarea creada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTasks();
    } catch (error) {
      setError('Error al crear la tarea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError('');
      await updateTask(id, taskData, token);
      setEditingTask(null);
      setSuccess('Tarea actualizada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTasks();
    } catch (error) {
      setError('Error al actualizar la tarea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        setLoading(true);
        setError('');
        await deleteTask(id, token);
        setSuccess('Tarea eliminada exitosamente');
        setTimeout(() => setSuccess(''), 3000);
        await fetchTasks();
      } catch (error) {
        setError('Error al eliminar la tarea: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Registro - FUNCIÓN
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      setError('');
      const result = await register(userData);
      setToken(result.token);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      setIsAuthenticated(true);
      setShowRegister(false);
      setSuccess('Usuario registrado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      return result; // Devolver resultado para manejo en Register
    } catch (error) {
      // Lanzar el error para que Register lo capture
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login - FUNCIÓN
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError('');
      const data = await login(credentials);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      return data; // Devolver datos para manejo en Login
    } catch (error) {
      // Lanzar el error para que Login lo capture
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setFilteredTasks([]);
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Mostrar login o registro si no hay usuario autenticado
  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setError(''); // Limpiar errores al cambiar entre formularios
        }}
        loading={loading}
        error={error}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowRegister(true);
          setError(''); // Limpiar errores al cambiar entre formularios
        }}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>✅ Gestor de Tareas</Navbar.Brand>
          <div className="d-flex align-items-center">
            {user && (
              <>
                <FaUserCircle size={30} className="text-light me-2" />
                <Navbar.Text className="me-3 text-light">
                  👋 {user.name || user.email}
                </Navbar.Text>
              </>
            )}
            <Button variant="outline-light" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TaskStats tasks={tasks} />
        <TaskFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilter}
          onResetFilters={handleResetFilters}
          onRefresh={() => fetchTasks()}
        />

        <Row className="mb-4">
          <Col>
            <Button 
              onClick={() => setShowForm(true)} 
              disabled={loading}
              className="me-2"
            >
              ➕ Crear Nueva Tarea
            </Button>
            {loading && (
              <span className="text-muted">
                <small>Cargando...</small>
              </span>
            )}
          </Col>
        </Row>

        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}

        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            onCancel={() => setEditingTask(null)}
            loading={loading}
          />
        )}

        <TaskList
          tasks={getCurrentPageTasks()}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          loading={loading}
        />

        {filteredTasks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-5">
            <h5>📝 No hay tareas para mostrar</h5>
            <p className="text-muted">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Crea tu primera tarea usando el botón de arriba'
              }
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;