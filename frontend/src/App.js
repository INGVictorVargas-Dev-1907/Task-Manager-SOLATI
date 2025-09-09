import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Navbar, Row } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Pagination from './components/Pagination';
import Register from './components/Register';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Footer from './components/Footer';
import TaskStats from './components/TaskStats';
import TaskDetail from './components/TaskDetail';
import {
  createTask,
  deleteTask,
  getTasks,
  login,
  register,
  updateTask,
} from './services/api';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [selectedTask, setSelectedTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = useCallback(async (authToken = token) => {
    setLoading(true);
    try {
      const tasksData = await getTasks(authToken);
      setTasks(tasksData);
    } catch (error) {
      toast.error('Error al cargar las tareas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    fetchTasks();
  };

  const handleCreateTask = async (taskData) => {
    setLoading(true);
    try {
      await createTask(taskData, token);
      setShowForm(false);
      await fetchTasks();
      toast.success("Tarea creada exitosamente");
    } catch (error) {
      toast.error('Error al crear la tarea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    setLoading(true);
    try {
      await updateTask(editingTask.id, taskData, token);
      setEditingTask(null);
      await fetchTasks();
      toast.success("Tarea actualizada exitosamente");
    } catch (error) {
      toast.error('Error al actualizar la tarea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    try {
      await deleteTask(id, token);
      await fetchTasks();
      toast.success("Tarea eliminada exitosamente");
    } catch (error) {
      toast.error('Hubo un problema al eliminar la tarea.');
      console.error('Error al eliminar la tarea:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (taskId, newStatus) => {
    setLoading(true);
    try {
        await updateTask(taskId, { status: newStatus }, token);
        await fetchTasks();
        toast.success("¡Estado de la tarea actualizado!");
    } catch (error) {
        toast.error("Error al actualizar el estado de la tarea.");
        console.error('Error al actualizar el estado:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const result = await register(userData);
      setToken(result.token);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      setIsAuthenticated(true);
      setShowRegister(false);
      toast.success('Usuario registrado exitosamente');
      return result;
    } catch (error) {
      toast.error('Error de registro: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await login(credentials);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      toast.success('Inicio de sesión exitoso');
      return data;
    } catch (error) {
      toast.error('Error de inicio de sesión: ' + error.message);
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

  // Función para ver los detalles de una tarea
  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
  };

  // Función para volver a la lista
  const handleBackToList = () => {
    setSelectedTask(null);
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
        loading={loading}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
        loading={loading}
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
        {selectedTask ? (
          <TaskDetail
            task={selectedTask}
            onBack={handleBackToList}
            onEdit={(task) => {
              setEditingTask(task);
              handleBackToList();
            }}
          />
        ) : (
          <>
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
                onSubmit={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                loading={loading}
              />
            )}

            <TaskList
              tasks={getCurrentPageTasks()}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewTaskDetails}
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
          </>
        )}
      </Container>
      
      <ToastContainer position="bottom-right" theme="colored" />
      <Footer />
    </div>
  );
}

export default App;