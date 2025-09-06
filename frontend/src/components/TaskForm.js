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
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
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

    // Efecto para detectar cambios en los campos del formulario
    useEffect(() => {
        if (task) {
            const originalData = {
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'pendiente'
            };
            
            const changesDetected = 
                formData.title !== originalData.title ||
                formData.description !== originalData.description ||
                formData.status !== originalData.status;
                
            setHasChanges(changesDetected);
        }
    }, [formData, task]);

    // Efecto para ocultar automáticamente la alerta después de 3 segundos
    useEffect(() => {
        if (showSuccessAlert) {
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert]);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'title':
                if (!task) {
                    if (!value.trim()) {
                        error = 'El título es requerido';
                    } else if (value.trim().length < 3) {
                        error = 'El título debe tener al menos 3 caracteres';
                    } else if (value.trim().length > 255) {
                        error = 'El título no puede exceder 255 caracteres';
                    }
                } else {
                    if (value.trim().length > 0 && value.trim().length < 3) {
                        error = 'El título debe tener al menos 3 caracteres si se modifica';
                    } else if (value.trim().length > 255) {
                        error = 'El título no puede exceder 255 caracteres';
                    }
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

        if (validateForm()) {
            onSubmit({
                title: formData.title.trim(),
                description: formData.description.trim(),
                status: formData.status
            });
            
            // Mostrar alerta de éxito
            setShowSuccessAlert(true);
        }
    };

    const descriptionLength = formData.description.length;
    const descriptionMaxLength = 1000;

    // Verificar si hay errores que impidan enviar el formulario
    const hasBlockingErrors = Object.values(errors).some(error => error !== '');

    return (
        <Modal show={true} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {task ? '✏️ Editar Tarea' : '➕ Crear Nueva Tarea'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {/* Alertas para cuando se está CREANDO una tarea */}
                    {!task && (
                        <>
                            {/* Alerta de éxito al crear */}
                            {showSuccessAlert && (
                                <Alert variant="success" className="mb-3" dismissible onClose={() => setShowSuccessAlert(false)}>
                                    <strong>¡Tarea creada con éxito!</strong> La nueva tarea se ha guardado correctamente.
                                </Alert>
                            )}
                            
                            {/* Alerta de errores de validación al crear */}
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
                        </>
                    )}

                    {/* Alertas para cuando se está EDITANDO una tarea */}
                    {task && (
                        <>
                            {/* Alerta de éxito al editar */}
                            {showSuccessAlert && (
                                <Alert variant="success" className="mb-3" dismissible onClose={() => setShowSuccessAlert(false)}>
                                    <strong>¡Tarea actualizada con éxito!</strong> Los cambios se han guardado correctamente.
                                </Alert>
                            )}
                            
                            {/* Alerta de cambios detectados al editar */}
                            {hasChanges && !showSuccessAlert && (
                                <Alert variant="info" className="mb-3">
                                    <strong>⚠️ Tienes cambios sin guardar</strong>. Presiona "Actualizar Tarea" para guardar los cambios.
                                </Alert>
                            )}
                        </>
                    )}

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
                        disabled={loading || (!task && hasBlockingErrors)}
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