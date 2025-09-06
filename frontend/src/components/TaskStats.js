import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';

const TaskStats = ({ tasks }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completada').length;
    const pendingTasks = tasks.filter(task => task.status === 'pendiente').length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <Card className="mb-4">
        <Card.Header>
            <h5 className="mb-0">📊 Estadísticas de Tareas</h5>
        </Card.Header>
        <Card.Body>
            <Row>
            <Col md={3} className="text-center">
                <div className="stat-item">
                <h3 className="text-primary">{totalTasks}</h3>
                <p className="text-muted">Total</p>
                </div>
            </Col>
            <Col md={3} className="text-center">
                <div className="stat-item">
                <h3 className="text-success">{completedTasks}</h3>
                <p className="text-muted">Completadas</p>
                </div>
            </Col>
            <Col md={3} className="text-center">
                <div className="stat-item">
                <h3 className="text-warning">{pendingTasks}</h3>
                <p className="text-muted">Pendientes</p>
                </div>
            </Col>
            <Col md={3} className="text-center">
                <div className="stat-item">
                <h3 className="text-info">{Math.round(completionPercentage)}%</h3>
                <p className="text-muted">Completado</p>
                </div>
            </Col>
            </Row>
            
            {totalTasks > 0 && (
            <div className="mt-3">
                <ProgressBar now={completionPercentage} 
                            variant={completionPercentage === 100 ? 'success' : 'primary'} 
                            className="mb-2" />
                <small className="text-muted">
                Progreso general de tus tareas
                </small>
            </div>
            )}
        </Card.Body>
        </Card>
    );
};

export default TaskStats;