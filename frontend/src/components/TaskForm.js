import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    Alert,
    Row,
    Col,
    FloatingLabel
} from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';

const TaskForm = ({ task, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pendiente'
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Inicializar formulario cuando cambia la tarea (edición)
    useEffect(() => {
        if (task) {
        setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'pendiente'
        });
        } else {
        setFormData({
            title: '',
            description: '',
            status: 'pendiente'
        });
        }
        setErrors({});
        setTouched({});
    }, [task]);

    // Validaciones
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
        case 'title':
            if (!value.trim()) {
            error = 'El título es requerido';
            } else if (value.trim().length < 3) {
            error = 'El título debe tener al menos 3 caracteres';
            } else if (value.trim().length > 255) {
            error = 'El título no puede exceder 255 caracteres';
            }
            break;
        
        case 'description':
            if (value.length > 1000) {
            error = 'La descripción no puede exceder 1000 caracteres';
            }
            break;
        
        default:
            break;
        }

        return error;
    };

    // Manejar cambios en los campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));

        // Validar en tiempo real después de que el usuario toque el campo
        if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        }
    };

    // Manejar blur (cuando el usuario sale del campo)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        setTouched(prev => ({
        ...prev,
        [name]: true
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
        ...prev,
        [name]: error
        }));
    };

    // Validar todo el formulario
    const validateForm = () => {
        const newErrors = {};
        const newTouched = {};

        Object.keys(formData).forEach(key => {
        newTouched[key] = true;
        const error = validateField(key, formData[key]);
        if (error) {
            newErrors[key] = error;
        }
        });

        setTouched(newTouched);
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
        onSubmit({
            title: formData.title.trim(),
            description: formData.description.trim(),
            status: formData.status
        });
        }
    };

    // Contador de caracteres para descripción
    const descriptionLength = formData.description.length;
    const descriptionMaxLength = 1000;

    return (
        <Modal show={true} onHide={onCancel} centered>
        <Modal.Header closeButton>
            <Modal.Title>
            {task ? '✏️ Editar Tarea' : '➕ Crear Nueva Tarea'}
            </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
            <Modal.Body>
            {Object.keys(errors).length > 0 && (
                <Alert variant="danger" className="mb-3">
                <strong>Por favor, corrige los siguientes errores:</strong>
                <ul className="mb-0 mt-2">
                    {Object.entries(errors).map(([field, error]) => (
                    error && <li key={field}>{error}</li>
                    ))}
                </ul>
                </Alert>
            )}

            <Form.Group className="mb-3">
                <FloatingLabel label="Título *" controlId="title">
                <Form.Control
                    type="text"
                    name="title"
                    placeholder="Ingresa el título"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.title && !!errors.title}
                    disabled={loading}
                    maxLength={255}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.title}
                </Form.Control.Feedback>
                </FloatingLabel>
                <Form.Text className="text-muted">
                {formData.title.length}/255 caracteres
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
                <FloatingLabel label="Descripción" controlId="description">
                <Form.Control
                    as="textarea"
                    name="description"
                    placeholder="Describe tu tarea..."
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && !!errors.description}
                    disabled={loading}
                    style={{ height: '120px' }}
                    maxLength={descriptionMaxLength}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.description}
                </Form.Control.Feedback>
                </FloatingLabel>
                <Form.Text className="text-muted">
                {descriptionLength}/{descriptionMaxLength} caracteres
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label><strong>Estado:</strong></Form.Label>
                <Row>
                <Col>
                    <Form.Check
                    type="radio"
                    name="status"
                    id="status-pendiente"
                    label="⏳ Pendiente"
                    value="pendiente"
                    checked={formData.status === 'pendiente'}
                    onChange={handleChange}
                    disabled={loading}
                    />
                </Col>
                <Col>
                    <Form.Check
                    type="radio"
                    name="status"
                    id="status-completada"
                    label="✅ Completada"
                    value="completada"
                    checked={formData.status === 'completada'}
                    onChange={handleChange}
                    disabled={loading}
                    />
                </Col>
                </Row>
            </Form.Group>
            </Modal.Body>

            <Modal.Footer>
            <Button
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
            >
                <FaTimes className="me-2" />
                Cancelar
            </Button>
            
            <Button
                variant="primary"
                type="submit"
                disabled={loading}
            >
                {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {task ? 'Actualizando...' : 'Creando...'}
                </>
                ) : (
                <>
                    <FaSave className="me-2" />
                    {task ? 'Actualizar' : 'Crear'} Tarea
                </>
                )}
            </Button>
            </Modal.Footer>
        </Form>
        </Modal>
    );
};

export default TaskForm;