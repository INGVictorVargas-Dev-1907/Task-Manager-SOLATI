<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Config\Database;
use Firebase\JWT\JWT;


class AuthController {
    private UserRepository $userRepository;

    public function __construct() {
        $db = Database::getConnection();
        $this->userRepository = new UserRepository($db);
    }

    /**
     * @api {post} /api/register Registrar un nuevo usuario
     * @apiName RegisterUser
     * @apiGroup Autenticación
     * @apiVersion 1.0.0
     *
     * @apiBody {String} name Nombre del usuario.
     * @apiBody {String} email Correo electrónico único del usuario.
     * @apiBody {String} password Contraseña segura del usuario.
     *
     * @apiSuccess {String} message Mensaje de éxito.
     * @apiSuccess {Object} user Datos del usuario registrado.
     * @apiSuccess {Number} user.id ID del usuario.
     * @apiSuccess {String} user.name Nombre del usuario.
     * @apiSuccess {String} user.email Correo electrónico del usuario.
     * @apiSuccess {String} token Token de autenticación JWT.
     *
     * @apiError (Error 400) BadRequest Los datos son inválidos o faltan campos.
     * @apiError (Error 409) Conflict El correo electrónico ya está registrado.
     * @apiError (Error 500) InternalServerError No se pudo crear el usuario.
     *
     * @apiSuccessExample {json} Respuesta Exitosa:
     * HTTP/1.1 201 Created
     * {
     * "message": "Usuario creado exitosamente",
     * "token": "jwt_token_ejemplo",
     * "user": {
     * "id": 1,
     * "email": "usuario@ejemplo.com",
     * "name": "Juan Pérez"
     * }
     * }
     *
     * @apiErrorExample {json} Error de Datos Inválidos:
     * HTTP/1.1 400 Bad Request
     * {
     * "message": "Email inválido"
     * }
     *
     * @apiErrorExample {json} Error de Conflicto:
     * HTTP/1.1 409 Conflict
     * {
     * "message": "El usuario ya existe"
     * }
     */
    public function register(Request $request, Response $response): Response {
        $data = $request->getParsedBody();

        if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
            return $this->error($response, "Todos los campos son requeridos", 400);
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->error($response, "Email inválido", 400);
        }
        if (strlen($data['password']) < 6) {
            return $this->error($response, "La contraseña debe tener al menos 6 caracteres", 400);
        }

        if ($this->userRepository->emailExists($data['email'])) {
            return $this->error($response, "El usuario ya existe", 409);
        }

        $user = $this->userRepository->create($data);

        if ($user) {
            $token = $this->generateJWT($user->id);
            $response->getBody()->write(json_encode([
                "message" => "Usuario creado exitosamente",
                "token" => $token,
                "user" => [
                    "id" => $user->id,
                    "email" => $user->email,
                    "name" => $user->name
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }

        return $this->error($response, "No se pudo crear el usuario", 500);
    }

    /**
     * @api {post} /api/login Iniciar sesión
     * @apiName LoginUser
     * @apiGroup Autenticación
     * @apiVersion 1.0.0
     *
     * @apiBody {String} email Correo electrónico del usuario.
     * @apiBody {String} password Contraseña del usuario.
     *
     * @apiSuccess {String} message Mensaje de éxito.
     * @apiSuccess {String} token Token de autenticación JWT.
     * @apiSuccess {Object} user Datos del usuario autenticado.
     * @apiSuccess {Number} user.id ID del usuario.
     * @apiSuccess {String} user.name Nombre del usuario.
     * @apiSuccess {String} user.email Correo electrónico del usuario.
     *
     * @apiError (Error 400) BadRequest Email y/o contraseña son requeridos.
     * @apiError (Error 401) Unauthorized Credenciales inválidas.
     *
     * @apiSuccessExample {json} Respuesta Exitosa:
     * HTTP/1.1 200 OK
     * {
     * "message": "Login exitoso",
     * "token": "jwt_token_ejemplo",
     * "user": {
     * "id": 1,
     * "email": "usuario@ejemplo.com",
     * "name": "Juan Pérez"
     * }
     * }
     *
     * @apiErrorExample {json} Error de Credenciales:
     * HTTP/1.1 401 Unauthorized
     * {
     * "message": "Credenciales inválidas"
     * }
     */
    public function login(Request $request, Response $response): Response {
        $data = $request->getParsedBody();

        if (empty($data['email']) || empty($data['password'])) {
            return $this->error($response, "Email y contraseña son requeridos", 400);
        }

        $user = $this->userRepository->findByEmail($data['email']);
        
        if (!$user || !password_verify($data['password'], $user->password)) {
            return $this->error($response, "Credenciales inválidas", 401);
        }

        $token = $this->generateJWT($user->id);
        $response->getBody()->write(json_encode([
            "message" => "Login exitoso",
            "token" => $token,
            "user" => [
                "id" => $user->id,
                "email" => $user->email,
                "name" => $user->name
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    /**
     * Genera un token JWT para autenticar al usuario.
     *
     * @param int $userId ID único del usuario que se incluirá en el payload del token.
     * @return string Token JWT firmado con el secreto configurado en el entorno.
     */
    private function generateJWT($userId): string {
        $issuedAt = time();
        $expirationTime = $issuedAt + 3600;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => ['id' => $userId]
        ];

        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }

    /**
     * Genera una respuesta HTTP de error en formato JSON.
     *
     * @param Response $response Objeto de respuesta PSR-7.
     * @param string $message Mensaje de error a mostrar en la respuesta.
     * @param int $statusCode Código de estado HTTP a devolver.
     * @return Response Respuesta HTTP con encabezado JSON y el código de estado correspondiente.
     */
    private function error(Response $response, string $message, int $statusCode): Response {
        $response->getBody()->write(json_encode(["message" => $message]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }
}
?>
