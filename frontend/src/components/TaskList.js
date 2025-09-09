import React, { useState } from 'react';
import {
    Card,
    Badge,
    Button,
    Row,
    Col,
    Placeholder,
    Alert
} from 'react-bootstrap';
import {
    FaEdit,
    FaTrash,
    FaCheck,
    FaUndo,
    FaClipboardList
} from 'react-icons/fa';

import { formatDate } from '../utils/dateFormatter';

const TaskList = ({ tasks, onEdit, onDelete, onUpdateStatus, onViewDetails, loading = false }) => {
    const [deletingId, setDeletingId] = useState(null);

    const handleStatusChange = async (taskId, newStatus) => {
        if (onUpdateStatus) {
            onUpdateStatus(taskId, newStatus);
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            setDeletingId(taskId);
            try {
                await onDelete(taskId);
            } catch (error) {
                console.error("Error al eliminar la tarea:", error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="task-list">
                {[1, 2, 3].map((item) => (
                    <Card key={item} className="mb-3 task-item">
                        <Card.Body>
                            <Placeholder as={Card.Title} animation="wave">
                                <Placeholder xs={6} />
                            </Placeholder>
                            <Placeholder as={Card.Text} animation="wave">
                                <Placeholder xs={12} />
                                <Placeholder xs={8} />
                            </Placeholder>
                            <Row>
                                <Col>
                                    <Placeholder animation="wave">
                                        <Placeholder xs={4} />
                                    </Placeholder>
                                </Col>
                                <Col className="text-end">
                                    <Placeholder.Button xs={3} aria-hidden="true" />
                                    {' '}
                                    <Placeholder.Button xs={3} aria-hidden="true" />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }

    if (!loading && tasks.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <FaClipboardList size={48} className="mb-3" />
                <h5>No hay tareas para mostrar</h5>
                <p className="text-muted">
                    ¡Comienza creando tu primera tarea!
                </p>
            </Alert>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <Card
                    key={task.id}
                    className={`mb-3 task-item ${task.status === 'completada' ? 'task-completed' : ''}`}
                    onClick={() => onViewDetails(task)} // Maneja el clic para ver detalles
                >
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs={12} md={8}>
                                <Card.Title
                                    className={`h5 ${task.status === 'completada' ? 'text-decoration-line-through text-muted' : ''}`}
                                >
                                    {task.title}
                                    
                                    <Badge
                                        bg={task.status === 'completada' ? 'success' : 'warning'}
                                        className="ms-2"
                                    >
                                        {task.status === 'completada' ? '✅ Completada' : '⏳ Pendiente'}
                                    </Badge>
                                </Card.Title>

                                {task.description && (
                                    <Card.Text className="text-muted text-truncate">
                                        {task.description}
                                    </Card.Text>
                                )}

                                <div className="task-meta mt-2">
                                    <small className="text-muted">
                                        <strong>Creada:</strong> {formatDate(task.created_at)}
                                    </small>
                                    {task.updated_at !== task.created_at && (
                                        <small className="text-muted ms-3">
                                            <strong>Actualizada:</strong> {formatDate(task.updated_at)}
                                        </small>
                                    )}
                                </div>
                                {task.priority && (
                                    <Badge
                                        bg="secondary"
                                        className="mt-2"
                                    >
                                        Prioridad: {task.priority}
                                    </Badge>
                                )}
                            </Col>

                            <Col xs={12} md={4} className="text-end mt-3 mt-md-0 d-flex flex-column flex-md-row gap-2 justify-content-end">
                                <Button
                                    variant={task.status === 'completada' ? 'outline-warning' : 'outline-success'}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Previene que el clic active la vista de detalles
                                        handleStatusChange(task.id, task.status === 'completada' ? 'pendiente' : 'completada');
                                    }}
                                    disabled={deletingId === task.id}
                                    title={task.status === 'completada' ? 'Marcar como pendiente' : 'Marcar como completada'}
                                >
                                    {deletingId === task.id ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        task.status === 'completada' ? <FaUndo /> : <FaCheck />
                                    )}
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(task);
                                    }}
                                    disabled={deletingId === task.id}
                                    title="Editar tarea"
                                >
                                    <FaEdit />
                                </Button>

                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(task.id);
                                    }}
                                    disabled={deletingId === task.id}
                                    title="Eliminar tarea"
                                >
                                    {deletingId === task.id ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        <FaTrash />
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>

                    {task.status === 'pendiente' && task.progress && (
                        <div className="card-footer p-2">
                            <div className="d-flex align-items-center">
                                <small className="me-2">Progreso:</small>
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${task.progress}%` }}
                                    />
                                </div>
                                <small className="ms-2">{task.progress}%</small>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default TaskList;