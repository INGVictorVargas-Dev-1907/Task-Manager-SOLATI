import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
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
    const [hasChanges, setHasChanges] = useState(false);

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
        setHasChanges(false);
    }, [task]);

    useEffect(() => {
        if (task) {
            const originalData = {
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'pendiente'
            };
            
            const changesDetected = 
                formData.title.trim() !== originalData.title.trim() ||
                formData.description.trim() !== originalData.description.trim() ||
                formData.status !== originalData.status;
                
            setHasChanges(changesDetected);
        }
    }, [formData, task]);

    const validateField = (name, value) => {
        let error = '';
        const trimmedValue = value.trim();

        switch (name) {
            case 'title':
                if (trimmedValue.length > 0 && trimmedValue.length < 3) {
                    error = 'El título debe tener al menos 3 caracteres';
                } else if (trimmedValue.length > 255) {
                    error = 'El título no puede exceder 255 caracteres';
                }
                break;

            case 'description':
                if (trimmedValue.length > 1000) {
                    error = 'La descripción no puede exceder 1000 caracteres';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

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

    const validateForm = () => {
        const newErrors = {};
        const newTouched = {};

        // Validar todos los campos al momento del submit
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Si la tarea existe (modo edición), solo se valida el título y descripción
        if (task) {
            const titleError = validateField('title', formData.title);
            const descriptionError = validateField('description', formData.description);

            // Validamos si hay algún error que bloquee el envío
            const hasBlockingErrors = !!titleError || !!descriptionError;

            // Si no hay errores y hay cambios, enviamos el formulario.
            if (!hasBlockingErrors && hasChanges) {
                onSubmit({
                    ...task, // Conserva el ID de la tarea
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    status: formData.status
                });
            } else if (!hasChanges) {
                 // Si no hay cambios y no se necesita actualizar, simplemente se cierra el modal.
                onCancel();
            }
        } else {
            // Modo de creación
            if (validateForm()) {
                onSubmit({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    status: formData.status
                });
            }
        }
    };

    const descriptionLength = formData.description.length;
    const descriptionMaxLength = 1000;
    const hasBlockingErrors = Object.values(errors).some(error => error !== '');
    const isFormDisabled = !task && !formData.title;

    // Condición para habilitar/deshabilitar el botón de envío
    const isSubmitDisabled = loading || (task && !hasChanges) || hasBlockingErrors || (!task && isFormDisabled);

    return (
        <Modal show={true} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {task ? '✏️ Editar Tarea' : '➕ Crear Nueva Tarea'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <FloatingLabel label={task ? 'Título' : 'Título *'} controlId="title">
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
                        disabled={isSubmitDisabled}
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