import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const Register = ({ onRegister, onSwitchToLogin }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', variant: 'danger' });

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
        
        // Limpiar errores locales y notificaciones al empezar a escribir
        if (localError) {
            setLocalError('');
        }
        if (notification.show) {
            setNotification({ show: false, message: '', variant: 'danger' });
        }
    };

    const showNotification = (message, variant = 'danger') => {
        setNotification({ show: true, message, variant });
        setTimeout(() => setNotification({ show: false, message: '', variant: 'danger' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');
        setNotification({ show: false, message: '', variant: 'danger' });

        // Validaciones del lado del cliente
        if (!userData.name.trim()) {
            setLocalError('El nombre es requerido');
            setLoading(false);
            return;
        }

        if (!userData.email.trim()) {
            setLocalError('El email es requerido');
            setLoading(false);
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setLocalError('Por favor ingresa un email válido');
            setLoading(false);
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (userData.password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const result = await onRegister({
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password: userData.password
            });
            
            // Si el registro es exitoso, muestra el mensaje y redirige al login
            if (result && result.message) {
                showNotification(result.message, 'success');
                setTimeout(() => onSwitchToLogin(), 2000); 
            }
        } catch (error) {
            // El servicio ya se encarga de dar un mensaje de error claro
            showNotification(error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto">
                    {/* Notificación de alerta */}
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
                            
                            {localError && (
                                <Alert variant="danger" className="mb-3">
                                    <strong>{localError}</strong>
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
                                >
                                    <span className="me-2">→</span>
                                    ¿Ya tienes cuenta? Inicia sesión
                                </Button>
                            </div>

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