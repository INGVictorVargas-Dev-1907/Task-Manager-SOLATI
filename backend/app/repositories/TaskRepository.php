<?php
namespace App\Repositories;

use PDO;
use PDOException;
use App\Models\Task;

class TaskRepository {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Obtiene todas las tareas de un usuario y las devuelve como objetos Task.
     */
    public function findAllByUser($userId): array {
        $query = "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $tasksData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn($data) => new Task($data), $tasksData);
    }

    /**
     * Obtiene una tarea específica por ID y usuario, devolviéndola como un objeto Task.
     */
    public function findByIdAndUser($id, $userId): ?Task {
        $query = "SELECT * FROM tasks WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $taskData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $taskData ? new Task($taskData) : null;
    }

    /**
     * Obtiene tareas filtradas por estado y usuario, devolviéndolas como objetos Task.
     */
    public function findByStatusAndUser($status, $userId): array {
        $query = "SELECT * FROM tasks WHERE status = :status AND user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status, PDO::PARAM_STR);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $tasksData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(fn($data) => new Task($data), $tasksData);
    }

    /**
     * Crea una nueva tarea y devuelve el objeto Task recién creado.
     */
    public function create(array $data): ?Task {
        try {
            $query = "INSERT INTO tasks (title, description, status, user_id, created_at, updated_at) VALUES (:title, :description, :status, :user_id, NOW(), NOW()) RETURNING id";
            $stmt = $this->db->prepare($query);
            
            $title = htmlspecialchars(strip_tags($data['title']));
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : '';
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'pendiente';
            $userId = $data['user_id'];
            
            $stmt->bindParam(":title", $title, PDO::PARAM_STR);
            $stmt->bindParam(":description", $description, PDO::PARAM_STR);
            $stmt->bindParam(":status", $status, PDO::PARAM_STR);
            $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $lastId = $stmt->fetchColumn();
                return $this->findByIdAndUser($lastId, $userId);
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error creating task: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualiza una tarea.
     */
    public function update($id, $userId, $data): bool {
        try {
            $setParts = [];
            $params = [':id' => $id, ':user_id' => $userId];

            if (isset($data['title'])) {
                $setParts[] = "title = :title";
                $params[':title'] = htmlspecialchars(strip_tags($data['title']));
            }

            if (isset($data['description'])) {
                $setParts[] = "description = :description";
                $params[':description'] = htmlspecialchars(strip_tags($data['description']));
            }

            if (isset($data['status'])) {
                $setParts[] = "status = :status";
                $params[':status'] = htmlspecialchars(strip_tags($data['status']));
            }

            $setParts[] = "updated_at = NOW()";

            if (empty($setParts)) return false;

            $query = "UPDATE tasks SET " . implode(", ", $setParts) . " WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($query);

            foreach ($params as $key => $value) {
                $paramType = strpos($key, '_id') !== false ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($key, $value, $paramType);
            }

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error updating task: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina una tarea.
     */
    public function delete($id, $userId): bool {
        try {
            $query = "DELETE FROM tasks WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting task: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene el conteo de tareas por estado para un usuario.
     * @return array
     */
    public function getStatusCount($userId): array {
        $query = "SELECT status, COUNT(*) as count FROM tasks WHERE user_id = :user_id GROUP BY status";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un conjunto de tareas con paginación para un usuario.
     * @return array
     */
    public function findWithPagination($userId, $limit, $offset): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $tasksData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($data) => new Task($data), $tasksData);
    }

    /**
     * Obtiene el total de tareas para un usuario.
     * @return int
     */
    public function getTotalCount($userId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM tasks WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['total'] ?? 0);
    }


    /**
     * Busca tareas por título o descripción para un usuario.
     * @return array
     */
    public function searchByUser($userId, $searchTerm): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM tasks WHERE user_id = :user_id AND (title LIKE :term OR description LIKE :term) ORDER BY created_at DESC"
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':term', '%' . $searchTerm . '%', PDO::PARAM_STR);
        $stmt->execute();
        
        $tasksData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($data) => new Task($data), $tasksData);
    }

    /**
     * Obtiene el conteo total de tareas asociadas a un usuario.
     * @return int
     */
    public function countByUser($userId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM tasks WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['total'] ?? 0);
    }
}
?>