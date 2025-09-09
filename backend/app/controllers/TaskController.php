<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\TaskRepository;
use App\Config\Database;
use Firebase\JWT\JWT;
use Exception;
use DateTime;


class TaskController {
    private $taskRepository;

    public function __construct() {
        $db = Database::getConnection();
        $this->taskRepository = new TaskRepository($db);
    }

    /**
     * @api {get} /api/tasks Obtener tareas (con o sin paginación)
     * @apiName GetTasks
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiParam {Number} [page=1] Número de página para la paginación (opcional).
     * @apiParam {Number} [limit=10] Número de tareas por página (opcional).
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {Object[]} data Arreglo de tareas.
     * @apiSuccess {Number} [count] Número total de tareas (solo si no hay paginación).
     * @apiSuccess {Number} [total] Número total de tareas del usuario (solo con paginación).
     * @apiSuccess {Number} [page] Número de página actual (solo con paginación).
     * @apiSuccess {Number} [limit] Límite de tareas por página (solo con paginación).
     *
     * @apiSuccessExample {json} Respuesta con paginación:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "data": [
     * { "id": 1, "title": "Tarea 1", "description": "Descripción 1", "status": "pendiente" }
     * ],
     * "total": 20,
     * "page": 1,
     * "limit": 10
     * }
     *
     * @apiSuccessExample {json} Respuesta sin paginación:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "data": [
     * { "id": 1, "title": "Tarea 1", "description": "Descripción 1", "status": "pendiente" },
     * { "id": 2, "title": "Tarea 2", "description": "Descripción 2", "status": "completada" }
     * ],
     * "count": 2
     * }
     *
     * @apiError (Error 401) Unauthorized Token inválido o no proporcionado.
     */
    public function getTasks(Request $request, Response $response): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $queryParams = $request->getQueryParams();
            
            $page = isset($queryParams['page']) ? (int) $queryParams['page'] : null;
            $limit = isset($queryParams['limit']) ? (int) $queryParams['limit'] : null;
            
            if ($page !== null && $limit !== null) {
                $offset = ($page - 1) * $limit;
                $tasks = $this->taskRepository->findWithPagination($userId, $limit, $offset);
                $total = $this->taskRepository->countByUser($userId);
                
                // MÉTODO DE FORMATO DE FECHAS
                $tasksArray = array_map(fn($task) => $this->formatTaskDates($task->toArray()), $tasks);
                
                $responseData = [
                    'success' => true,
                    'data' => $tasksArray,
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit
                ];
            } else {
                $tasks = $this->taskRepository->findAllByUser($userId);
                
                // MÉTODO DE FORMATO DE FECHAS
                $tasksArray = array_map(fn($task) => $this->formatTaskDates($task->toArray()), $tasks);
                
                $responseData = [
                    'success' => true,
                    'data' => $tasksArray,
                    'count' => count($tasks)
                ];
            }
            
            $response->getBody()->write(json_encode($responseData));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
            
        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }

    /**
     * @api {get} /api/tasks/:id Obtener una tarea por ID
     * @apiName GetTaskById
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiParam {Number} id ID único de la tarea.
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {Object} data Objeto de la tarea encontrada.
     * @apiSuccess {Number} data.id ID de la tarea.
     * @apiSuccess {String} data.title Título de la tarea.
     * @apiSuccess {String} data.description Descripción de la tarea.
     * @apiSuccess {String} data.status Estado de la tarea.
     *
     * @apiSuccessExample {json} Respuesta Exitosa:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "data": { "id": 1, "title": "Comprar leche", "description": "Leche deslactosada", "status": "pendiente" }
     * }
     *
     * @apiError (Error 404) NotFound La tarea no fue encontrada.
     * @apiErrorExample {json} Tarea No Encontrada:
     * HTTP/1.1 404 Not Found
     * {
     * "success": false,
     * "error": "Tarea no encontrada",
     * "status": 404
     * }
     */
    public function getById(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];

            $task = $this->taskRepository->findByIdAndUser($taskId, $userId);

            if (!$task) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }

            // MÉTODO DE FORMATO DE FECHAS
            $formattedTask = $this->formatTaskDates($task->toArray());

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $formattedTask
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }


    /**
     * @api {post} /api/tasks Crear una nueva tarea
     * @apiName CreateTask
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     *
     * @apiBody {String} title Título de la tarea.
     * @apiBody {String} [description] Descripción de la tarea (opcional).
     * @apiBody {String="pendiente","completada"} [status] Estado inicial de la tarea (opcional, por defecto "pendiente").
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {String} message Mensaje de éxito.
     * @apiSuccess {Object} data La tarea creada.
     *
     * @apiSuccessExample {json} Tarea Creada Exitosamente:
     * HTTP/1.1 201 Created
     * {
     * "success": true,
     * "message": "Tarea creada exitosamente",
     * "data": { "id": 3, "title": "Hacer ejercicio", "description": "", "status": "pendiente" }
     * }
     *
     * @apiError (Error 400) BadRequest El título es requerido o el estado es inválido.
     * @apiErrorExample {json} Título Requerido:
     * HTTP/1.1 400 Bad Request
     * {
     * "success": false,
     * "error": "El título es requerido",
     * "status": 400
     * }
     */
    public function create(Request $request, Response $response): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $data = $request->getParsedBody();

            if (empty($data['title'])) {
                return $this->handleError($response, 'El título es requerido', 400);
            }

            if (isset($data['status']) && !in_array($data['status'], ['pendiente','completada'])) {
                return $this->handleError($response, 'Estado inválido. Use: pendiente o completada', 400);
            }

            $taskData = [
                'title' => trim($data['title']),
                'description' => $data['description'] ?? '',
                'status' => $data['status'] ?? 'pendiente',
                'user_id' => $userId
            ];

            $task = $this->taskRepository->create($taskData);

            if (!$task) {
                return $this->handleError($response, 'Error al crear la tarea', 500);
            }

            // Usar la variable con las fechas formateadas
            $formattedTask = $this->formatTaskDates($task->toArray());

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Tarea creada exitosamente',
                'data' => $formattedTask
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(201);

        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }

    /**
     * @api {put} /api/tasks/:id Actualizar una tarea
     * @apiName UpdateTask
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiParam {Number} id ID único de la tarea.
     *
     * @apiBody {String} [title] Nuevo título (opcional).
     * @apiBody {String} [description] Nueva descripción (opcional).
     * @apiBody {String="pendiente","completada"} [status] Nuevo estado (opcional).
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {String} message Mensaje de éxito.
     * @apiSuccess {Object} data La tarea actualizada.
     *
     * @apiSuccessExample {json} Tarea Actualizada Exitosamente:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "message": "Tarea actualizada exitosamente",
     * "data": { "id": 1, "title": "Comprar pan", "description": "Pan integral", "status": "completada" }
     * }
     *
     * @apiError (Error 400) BadRequest Datos inválidos o no hay nada para actualizar.
     * @apiError (Error 404) NotFound La tarea no fue encontrada o no pertenece al usuario.
     */
    public function update(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];
            $data = $request->getParsedBody();
            
            $existingTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            if (!$existingTask) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }
            
            if (isset($data['status']) && !in_array($data['status'], ['pendiente', 'completada'])) {
                return $this->handleError($response, 'Estado inválido. Use: pendiente o completada', 400);
            }
            
            $updateData = [];
            if (isset($data['title'])) $updateData['title'] = trim($data['title']);
            if (isset($data['description'])) $updateData['description'] = trim($data['description']);
            if (isset($data['status'])) $updateData['status'] = $data['status'];
            
            if (empty($updateData)) {
                return $this->handleError($response, 'No hay datos para actualizar', 400);
            }
            
            $success = $this->taskRepository->update($taskId, $userId, $updateData);
            
            if (!$success) {
                return $this->handleError($response, 'Error al actualizar la tarea', 500);
            }
            
            $updatedTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            
            // MÉTODO DE FORMATO DE FECHAS
            $formattedTask = $this->formatTaskDates($updatedTask->toArray());

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Tarea actualizada exitosamente',
                'data' => $formattedTask
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }
    /**
     * @api {delete} /api/tasks/:id Eliminar una tarea
     * @apiName DeleteTask
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiParam {Number} id ID único de la tarea.
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {String} message Mensaje de éxito.
     *
     * @apiSuccessExample {json} Tarea Eliminada Exitosamente:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "message": "Tarea eliminada exitosamente"
     * }
     *
     * @apiError (Error 404) NotFound La tarea no fue encontrada.
     */
    public function delete(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];
            
            $existingTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            if (!$existingTask) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }
            
            $success = $this->taskRepository->delete($taskId, $userId);
            
            if (!$success) {
                return $this->handleError($response, 'Error al eliminar la tarea', 500);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Tarea eliminada exitosamente'
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }


    /**
     * @api {get} /api/tasks/status/:status Obtener tareas por estado
     * @apiName GetTasksByStatus
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiParam {String="pendiente","completada"} status Estado por el que se quiere filtrar.
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {Number} count Número total de tareas encontradas.
     * @apiSuccess {Object[]} data Arreglo de tareas.
     *
     * @apiSuccessExample {json} Respuesta Exitosa:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "count": 1,
     * "data": [
     * { "id": 2, "title": "Pagar facturas", "description": "Electricidad y agua", "status": "completada" }
     * ]
     * }
     *
     * @apiError (Error 400) BadRequest El estado proporcionado no es válido.
     */
    public function getByStatus(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $status = $args['status'];
            
            if (!in_array($status, ['pendiente', 'completada'])) {
                return $this->handleError($response, 'Estado inválido. Use: pendiente o completada', 400);
            }
            
            $tasks = $this->taskRepository->findByStatusAndUser($status, $userId);

            // MÉTODO DE FORMATO DE FECHAS
            $tasksArray = array_map(fn($task) => $this->formatTaskDates($task->toArray()), $tasks); 
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $tasksArray,
                'count' => count($tasks)
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }


    /**
     * @api {get} /api/tasks/search Buscar tareas por término
     * @apiName SearchTasks
     * @apiGroup Tareas
     * @apiVersion 1.0.0
     * @apiHeader {String} Authorization Token JWT de autenticación.
     * @apiQuery {String} q Término de búsqueda.
     *
     * @apiSuccess {Boolean} success Estado de la operación.
     * @apiSuccess {Object[]} data Arreglo de tareas encontradas.
     * @apiSuccess {Number} count Número total de tareas encontradas.
     *
     * @apiSuccessExample {json} Respuesta Exitosa:
     * HTTP/1.1 200 OK
     * {
     * "success": true,
     * "data": [
     * { "id": 1, "title": "Comprar leche", "description": "Leche deslactosada", "status": "pendiente" }
     * ],
     * "count": 1
     * }
     *
     * @apiError (Error 400) BadRequest El término de búsqueda es requerido.
     * @apiError (Error 401) Unauthorized Token inválido o no proporcionado.
     */
    public function searchTasks(Request $request, Response $response): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $queryParams = $request->getQueryParams();
            $searchTerm = $queryParams['q'] ?? '';

            if (empty($searchTerm)) {
                return $this->handleError($response, 'Debe proporcionar un término de búsqueda', 400);
            }

            $tasks = $this->taskRepository->searchByUser($userId, $searchTerm);
            
            // MÉTODO DE FORMATO DE FECHAS
            $tasksArray = array_map(fn($task) => $this->formatTaskDates($task->toArray()), $tasks); 

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $tasksArray,
                'count' => count($tasks)
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }
    
    
    /**
     * Extrae el ID de usuario del token JWT
     */
    private function getUserIdFromToken(Request $request): int {
    $token = $request->getHeaderLine('Authorization');
    $token = str_replace('Bearer ', '', $token);

    if (empty($token)) {
        throw new \Exception('Token de acceso requerido');
    }

    try {
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($_ENV['JWT_SECRET'], 'HS256'));
        return (int) $decoded->data->id;
    } catch (\Exception $e) {
        throw new \Exception('Token inválido: ' . $e->getMessage());
    }
    }


    /**
     * Maneja errores y devuelve respuesta JSON consistente
     */
    private function handleError(Response $response, string $message, int $statusCode): Response {
        $response->getBody()->write(json_encode([
            'success' => false,
            'error' => $message,
            'status' => $statusCode
        ]));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    /**
     * MÉTODO AUXILIAR
     * Convierte las fechas de una tarea a formato ISO 8601 (UTC)
     */
    private function formatTaskDates(array $task): array {
        if (isset($task['created_at'])) {
            $task['created_at'] = (new DateTime($task['created_at']))->format('c');
        }
        if (isset($task['updated_at'])) {
            $task['updated_at'] = (new DateTime($task['updated_at']))->format('c');
        }
        return $task;
    }
}
?>