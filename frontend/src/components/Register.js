import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const Register = ({ onRegister, onSwitchToLogin }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', variant: 'danger' });

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
        
        // Limpiar notificaciones al empezar a escribir
        if (notification.show) {
            setNotification({ show: false, message: '', variant: 'danger' });
        }
        if (error) {
            setError('');
        }
    };

    const showNotification = (message, variant = 'danger') => {
        setNotification({ show: true, message, variant });
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => setNotification({ show: false, message: '', variant: 'danger' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotification({ show: false, message: '', variant: 'danger' });

        // Validaciones básicas
        if (!userData.name.trim()) {
            setError('El nombre es requerido');
            setLoading(false);
            return;
        }

        if (!userData.email.trim()) {
            setError('El email es requerido');
            setLoading(false);
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (userData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setError('Por favor ingresa un email válido');
            setLoading(false);
            return;
        }

        try {
            // Asegurarnos de que onRegister devuelva una promesa y lance errores
            const result = await onRegister({
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password
            });
            
            // Si el registro fue exitoso pero hay un mensaje del backend
            if (result && result.message) {
                showNotification(result.message, 'success');
            }
            
        } catch (error) {
            console.log('Error completo:', error);
            
            // Manejar diferentes tipos de errores
            if (error?.response?.status === 409) {
                showNotification('⚠️ Este email ya está registrado. ¿Olvidaste tu contraseña?', 'warning');
            } 
            else if (error?.response?.data?.message) {
                showNotification(`❌ ${error.response.data.message}`, 'danger');
            } 
            else if (error?.message?.includes('Network Error')) {
                showNotification('🌐 Error de conexión. Verifica tu internet e intenta nuevamente.', 'info');
            } 
            else if (error?.message) {
                showNotification(`❌ ${error.message}`, 'danger');
            }
            else {
                showNotification('❌ Error al registrar usuario. Intenta nuevamente.', 'danger');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto">
                    {/* Notificación de alerta - POSICIÓN FIJA para mejor visibilidad */}
                    {notification.show && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '500px',
                            zIndex: 1050
                        }}>
                            <Alert 
                                variant={notification.variant} 
                                className="mb-3 text-center"
                                dismissible
                                onClose={() => setNotification({ show: false, message: '', variant: 'danger' })}
                            >
                                <strong>{notification.message}</strong>
                            </Alert>
                        </div>
                    )}

                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Crear Cuenta</Card.Title>
                            
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    <strong>{error}</strong>
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ingresa tu nombre completo"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="ejemplo@correo.com"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Repite tu contraseña"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Button
                                    variant="success"
                                    type="submit"
                                    className="w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <Button
                                    variant="outline-primary"
                                    onClick={onSwitchToLogin}
                                    disabled={loading}
                                    className="rounded-pill px-4 py-2 d-flex align-items-center justify-content-center mx-auto"
                                    style={{
                                        border: '2px solid',
                                        background: 'transparent',
                                        transition: 'all 0.3s ease',
                                        width: 'fit-content'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = '#0d6efd';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#0d6efd';
                                    }}
                                >
                                    <span className="me-2">→</span>
                                    ¿Ya tienes cuenta? Inicia sesión
                                </Button>
                            </div>

                            {/* Información adicional */}
                            <div className="mt-3">
                                <small className="text-muted">
                                    🔒 Tu información está protegida. Al registrarte aceptas nuestros términos y condiciones.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;