import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { formatDate } from '../utils/dateFormatter';


const TaskDetail = ({ task, onBack, onEdit }) => {
    return (
        <Card className="task-detail-card mb-4">
        <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="outline-secondary" onClick={onBack}>
                <FaArrowLeft className="me-2" />
                Volver a la lista
            </Button>
            <Button variant="outline-primary" onClick={() => onEdit(task)}>
                <FaEdit className="me-2" />
                Editar
            </Button>
            </div>
            <Card.Title className="h2">{task.title}</Card.Title>
            <hr />
            {task.description && (
            <Card.Text>
                <strong>Descripción:</strong> {task.description}
            </Card.Text>
            )}
            <Row className="mb-2">
            <Col md={6}>
                <Card.Text>
                <strong>Estado:</strong> {task.status === 'completada' ? '✅ Completada' : '⏳ Pendiente'}
                </Card.Text>
            </Col>
            <Col md={6}>
                <Card.Text>
                <strong>Creada:</strong> {formatDate(task.created_at)}
                </Card.Text>
            </Col>
            </Row>
            <Row>
            <Col md={6}>
                <Card.Text>
                <strong>Actualizada:</strong> {formatDate(task.updated_at)}
                </Card.Text>
            </Col>
            {task.priority && (
                <Col md={6}>
                <Card.Text>
                    <strong>Prioridad:</strong> {task.priority}
                </Card.Text>
                </Col>
            )}
            </Row>
        </Card.Body>
        </Card>
    );
};

export default TaskDetail;