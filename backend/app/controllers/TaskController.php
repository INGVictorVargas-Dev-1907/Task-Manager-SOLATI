<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\TaskRepository;
use App\Config\Database;
use Firebase\JWT\JWT;
use Exception;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Task Manager API",
 *     description="API para gestionar tareas con autenticación JWT"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Ingresa tu token JWT para autenticación"
 * )
 *
 * @OA\Tag(
 *     name="Tasks",
 *     description="Operaciones para gestionar tareas"
 * )
 */
class TaskController {
    private $taskRepository;

    public function __construct() {
        $database = new Database();
        $db = $database->getConnection();
        $this->taskRepository = new TaskRepository($db);
    }

     /**
     * @OA\Get(
     *     path="/api/tasks",
     *     summary="Obtener todas las tareas del usuario autenticado",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de tareas obtenida exitosamente",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="count", type="integer"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Task")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autorizado - Token inválido o faltante")
     * )
     */
    public function getAll(Request $request, Response $response): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $tasks = $this->taskRepository->findAllByUser($userId);

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $tasks,
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
     * @OA\Get(
     *     path="/api/tasks/{id}",
     *     summary="Obtener una tarea específica por ID",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la tarea",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tarea obtenida exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(response=404, description="Tarea no encontrada"),
     *     @OA\Response(response=401, description="No autorizado")
     * )
     */
    public function getById(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];

            $task = $this->taskRepository->findByIdAndUser($taskId, $userId);

            if (!$task) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $task
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);

        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/api/tasks",
     *     summary="Crear una nueva tarea",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string", example="Mi nueva tarea"),
     *             @OA\Property(property="description", type="string", example="Descripción de la tarea"),
     *             @OA\Property(property="status", type="string", example="pendiente", enum={"pendiente","completada"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tarea creada exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(response=400, description="Datos de entrada inválidos"),
     *     @OA\Response(response=401, description="No autorizado")
     * )
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

            $taskId = $this->taskRepository->create($taskData);

            if (!$taskId) {
                return $this->handleError($response, 'Error al crear la tarea', 500);
            }

            $task = $this->taskRepository->findByIdAndUser($taskId, $userId);

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Tarea creada exitosamente',
                'data' => $task
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(201);

        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/tasks/{id}",
     *     summary="Actualizar una tarea existente",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la tarea a actualizar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Datos a actualizar",
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Título actualizado"),
     *             @OA\Property(property="description", type="string", example="Descripción actualizada"),
     *             @OA\Property(property="status", type="string", example="completada", enum={"pendiente", "completada"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tarea actualizada exitosamente",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tarea no encontrada"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function update(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];
            $data = $request->getParsedBody();
            
            // Verificar que la tarea exista y pertenezca al usuario
            $existingTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            if (!$existingTask) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }
            
            // Validación de estado si se proporciona
            if (isset($data['status']) && !in_array($data['status'], ['pendiente', 'completada'])) {
                return $this->handleError($response, 'Estado inválido. Use: pendiente o completada', 400);
            }
            
            // Preparar datos para actualizar
            $updateData = [];
            if (isset($data['title'])) $updateData['title'] = trim($data['title']);
            if (isset($data['description'])) $updateData['description'] = trim($data['description']);
            if (isset($data['status'])) $updateData['status'] = $data['status'];
            
            if (empty($updateData)) {
                return $this->handleError($response, 'No hay datos para actualizar', 400);
            }
            
            // Actualizar tarea
            $success = $this->taskRepository->update($taskId, $userId, $updateData);
            
            if (!$success) {
                return $this->handleError($response, 'Error al actualizar la tarea', 500);
            }
            
            // Obtener la tarea actualizada
            $updatedTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Tarea actualizada exitosamente',
                'data' => $updatedTask
            ]));
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
                
        } catch (Exception $e) {
            return $this->handleError($response, $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/tasks/{id}",
     *     summary="Eliminar una tarea",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la tarea a eliminar",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tarea eliminada exitosamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tarea no encontrada"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autorizado"
     *     )
     * )
     */
    public function delete(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $taskId = (int) $args['id'];
            
            // Verificar que la tarea exista y pertenezca al usuario
            $existingTask = $this->taskRepository->findByIdAndUser($taskId, $userId);
            if (!$existingTask) {
                return $this->handleError($response, 'Tarea no encontrada', 404);
            }
            
            // Eliminar tarea
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
     * @OA\Get(
     *     path="/api/tasks/status/{status}",
     *     summary="Obtener tareas por estado",
     *     tags={"Tasks"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="path",
     *         required=true,
     *         description="Estado de las tareas a filtrar",
     *         @OA\Schema(type="string", enum={"pendiente", "completada"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tareas filtradas por estado",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Task")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Estado inválido"
     *     )
     * )
     */
    public function getByStatus(Request $request, Response $response, array $args): Response {
        try {
            $userId = $this->getUserIdFromToken($request);
            $status = $args['status'];
            
            if (!in_array($status, ['pendiente', 'completada'])) {
                return $this->handleError($response, 'Estado inválido. Use: pendiente o completada', 400);
            }
            
            $tasks = $this->taskRepository->findByStatusAndUser($status, $userId);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $tasks,
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
 * @OA\Get(
 *     path="/api/tasks",
 *     summary="Obtener tareas con paginación",
 *     tags={"Tasks"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         required=false,
 *         description="Número de página",
 *         @OA\Schema(type="integer", default=1)
 *     ),
 *     @OA\Parameter(
 *         name="limit",
 *         in="query",
 *         required=false,
 *         description="Número de tareas por página",
 *         @OA\Schema(type="integer", default=10)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Lista de tareas paginadas",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean"),
 *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Task")),
 *             @OA\Property(property="total", type="integer"),
 *             @OA\Property(property="page", type="integer"),
 *             @OA\Property(property="limit", type="integer")
 *         )
 *     )
 * )
 */
public function getWithPagination(Request $request, Response $response): Response {
    try {
        $userId = $this->getUserIdFromToken($request);
        $queryParams = $request->getQueryParams();
        $page = isset($queryParams['page']) ? (int)$queryParams['page'] : 1;
        $limit = isset($queryParams['limit']) ? (int)$queryParams['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $tasks = $this->taskRepository->findWithPagination($userId, $limit, $offset);
        $total = $this->taskRepository->countByUser($userId);

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $tasks,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $this->handleError($response, $e->getMessage(), 500);
    }
    }

    /**
 * @OA\Get(
 *     path="/api/tasks/search",
 *     summary="Buscar tareas por término",
 *     tags={"Tasks"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(
 *         name="q",
 *         in="query",
 *         required=true,
 *         description="Término de búsqueda",
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Lista de tareas encontradas",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(property="success", type="boolean"),
 *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Task")),
 *             @OA\Property(property="count", type="integer")
 *         )
 *     )
 * )
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

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $tasks,
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
        // Ajuste aquí: acceder a la propiedad correcta
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
}
?>