<?php

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Middlewares\CorsMiddleware;
use App\Middlewares\AuthMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Establece zona horaria predeterminada a UTC
date_default_timezone_set('UTC');

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
    $group->get('/tasks/search', [\App\Controllers\TaskController::class, 'searchTasks']);
    $group->get('/tasks/status/{status}', [\App\Controllers\TaskController::class, 'getByStatus']);
    $group->get('/tasks', [\App\Controllers\TaskController::class, 'getTasks']);
    $group->get('/tasks/{id}', [\App\Controllers\TaskController::class, 'getById']);
    $group->post('/tasks', [\App\Controllers\TaskController::class, 'create']);
    $group->put('/tasks/{id}', [\App\Controllers\TaskController::class, 'update']);
    $group->delete('/tasks/{id}', [\App\Controllers\TaskController::class, 'delete']);
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
