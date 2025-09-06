<?php

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Middlewares\CorsMiddleware;
use App\Middlewares\AuthMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

// Middleware de CORS
$app->add(new CorsMiddleware());

// Middleware para parsing JSON
$app->addBodyParsingMiddleware();

// Rutas de autenticación
$app->post('/api/register', [\App\Controllers\AuthController::class, 'register']);
$app->post('/api/login', [\App\Controllers\AuthController::class, 'login']);

// Rutas protegidas
$app->group('/api', function ($group) {
    $group->get('/tasks', [\App\Controllers\TaskController::class, 'getAll']);
    $group->post('/tasks', [\App\Controllers\TaskController::class, 'create']);
    $group->put('/tasks/{id}', [\App\Controllers\TaskController::class, 'update']);
    $group->delete('/tasks/{id}', [\App\Controllers\TaskController::class, 'delete']);
    $group->get('/tasks/search', [\App\Controllers\TaskController::class, 'searchTasks']);
    $group->get('/tasks/status/{status}', [\App\Controllers\TaskController::class, 'getByStatus']);
})->add(new AuthMiddleware());

// Ruta de healthcheck
$app->get('/health', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode([
        "status" => "healthy",
        "timestamp" => time(),
        "service" => "Task Manager API"
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Ruta para generar documentación Swagger JSON
$app->get('/api/docs', function (Request $request, Response $response) {
    $swagger = \OpenApi\Generator::scan([
        __DIR__ . '/../app/docs',        // Contiene swagger.php con @OA\Info()
        __DIR__ . '/../app/Controllers'  // Todos los controladores
    ]);

    file_put_contents(__DIR__ . '/../public/swagger.json', $swagger->toJson());

    $response->getBody()->write(json_encode([
        "message" => "swagger.json generado",
        "rutas_detectadas" => array_keys($swagger->paths),
        "conteo" => count($swagger->paths)
    ]));

    return $response->withHeader('Content-Type', 'application/json');
});

// Middleware de manejo de errores global
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setDefaultErrorHandler(function (
    Request $request,
    Throwable $exception,
    bool $displayErrorDetails,
    bool $logErrors,
    bool $logErrorDetails
) {
    $response = new \Slim\Psr7\Response();
    $response->getBody()->write(json_encode([
        'success' => false,
        'message' => $exception->getMessage()
    ]));

    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withStatus(400);
});

$app->run();
