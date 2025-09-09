import React from 'react';
import { Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaSync } from 'react-icons/fa';

const TaskFilters = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onResetFilters,
    onRefresh
}) => {
    return (
        <Card className="mb-3">
            <Card.Body>
                <Row>
                    <Col md={6} className="mb-3 mb-md-0">
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Buscar tareas..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    
                    <Col md={3} className="mb-3 mb-md-0">
                        <Form.Select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="completada">Completadas</option>
                        </Form.Select>
                    </Col>
                    
                    <Col md={3}>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={onResetFilters}
                                title="Limpiar filtros"
                            >
                                Limpiar
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={onRefresh}
                                title="Actualizar lista de tareas"
                            >
                                <FaSync />
                                {/* Clase para ocultar visualmente el texto en desktop pero hacerlo visible para lectores de pantalla */}
                                <span className="d-none d-md-inline ms-1">Actualizar</span>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default TaskFilters;