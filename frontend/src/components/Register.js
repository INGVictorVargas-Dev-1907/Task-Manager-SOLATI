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

    const handleChange = (e) => {
        setUserData({
        ...userData,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones
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

        try {
        await onRegister({
            name: userData.name,
            email: userData.email,
            password: userData.password
        });
        } catch (error) {
        setError('Error al registrar usuario. Intenta nuevamente.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100">
            <Col md={6} lg={4} className="mx-auto">
            <Card>
                <Card.Body>
                <Card.Title className="text-center mb-4">Crear Cuenta</Card.Title>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ingresa tu nombre"
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
                        placeholder="Ingresa tu email"
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
                        placeholder="Confirma tu contraseña"
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

                <div className="text-center">
                    <Button
                    variant="link"
                    onClick={onSwitchToLogin}
                    >
                    ¿Ya tienes cuenta? Inicia sesión aquí
                    </Button>
                </div>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    );
};

export default Register;