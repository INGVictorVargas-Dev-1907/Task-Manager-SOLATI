import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({
        ...credentials,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
        await onLogin(credentials);
        } catch (error) {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
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
                <Card.Title className="text-center mb-4">Iniciar Sesión</Card.Title>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={credentials.email}
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
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        placeholder="Ingresa tu contraseña"
                    />
                    </Form.Group>

                    <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3"
                    disabled={loading}
                    >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </Form>

                <div className="text-center">
                    <Button 
                    variant="link" 
                    onClick={onSwitchToRegister}
                    >
                    ¿No tienes cuenta? Regístrate aquí
                    </Button>
                </div>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    );
};

export default Login;