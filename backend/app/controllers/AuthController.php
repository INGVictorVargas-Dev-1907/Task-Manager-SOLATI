<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Config\Database;
use Firebase\JWT\JWT;

class AuthController {
    private $user;

    public function __construct() {
        $database = new Database();
        $db = $database->getConnection();
        $this->user = new User($db);
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registrar un nuevo usuario",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password", "name"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="name", type="string", example="Juan Pérez")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario registrado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Usuario creado exitosamente"),
     *             @OA\Property(property="token", type="string", example="jwt_token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Datos inválidos"
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="El usuario ya existe"
     *     )
     * )
     */
    public function register(Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validaciones
        if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
            $response->getBody()->write(json_encode(["message" => "Todos los campos son requeridos"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode(["message" => "Email inválido"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        if (strlen($data['password']) < 6) {
            $response->getBody()->write(json_encode(["message" => "La contraseña debe tener al menos 6 caracteres"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        // Verificar si el usuario ya existe
        $this->user->email = $data['email'];
        if ($this->user->emailExists()) {
            $response->getBody()->write(json_encode(["message" => "El usuario ya existe"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(409);
        }
        
        // Crear usuario
        $this->user->email = $data['email'];
        $this->user->password = $data['password'];
        $this->user->name = $data['name'];
        
        if ($this->user->create()) {
            // Generar JWT
            $token = $this->generateJWT($this->user->id);
            
            $response->getBody()->write(json_encode([
                "message" => "Usuario creado exitosamente",
                "token" => $token,
                "user" => [
                    "id" => $this->user->id,
                    "email" => $this->user->email,
                    "name" => $this->user->name
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } else {
            $response->getBody()->write(json_encode(["message" => "No se pudo crear el usuario"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Iniciar sesión",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com"),
     *             @OA\Property(property="password", type="string", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Login exitoso"),
     *             @OA\Property(property="token", type="string", example="jwt_token"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales inválidas"
     *     )
     * )
     */
    public function login(Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validaciones
        if (empty($data['email']) || empty($data['password'])) {
            $response->getBody()->write(json_encode(["message" => "Email y contraseña son requeridos"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        // Verificar si el usuario existe
        $this->user->email = $data['email'];
        if (!$this->user->emailExists()) {
            $response->getBody()->write(json_encode(["message" => "Credenciales inválidas"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
        
        // Verificar password
        if (!$this->user->verifyPassword($data['password'])) {
            $response->getBody()->write(json_encode(["message" => "Credenciales inválidas"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
        
        // Generar JWT
        $token = $this->generateJWT($this->user->id);
        
        $response->getBody()->write(json_encode([
            "message" => "Login exitoso",
            "token" => $token,
            "user" => [
                "id" => $this->user->id,
                "email" => $this->user->email,
                "name" => $this->user->name
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    private function generateJWT($userId) {
        $issuedAt = time();
        $expirationTime = $issuedAt + 3600; // JWT válido por 1 hora
        
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => [
                'id' => $userId
            ]
        ];
        
        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }
}
?>