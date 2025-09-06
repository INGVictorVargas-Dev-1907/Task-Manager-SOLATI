<?php
namespace App\Repositories;

use PDO;
use PDOException;

class TaskRepository {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Obtiene todas las tareas de un usuario específico
     */
    public function findAllByUser($userId) {
        $query = "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene una tarea específica por ID y usuario
     */
    public function findByIdAndUser($id, $userId) {
        $query = "SELECT * FROM tasks WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene tareas filtradas por estado y usuario
     */
    public function findByStatusAndUser($status, $userId) {
        $query = "SELECT * FROM tasks WHERE status = :status AND user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status, PDO::PARAM_STR);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Crea una nueva tarea
     */
    public function create($data) {
        try {
            $query = "INSERT INTO tasks (title, description, status, user_id, created_at, updated_at)
                      VALUES (:title, :description, :status, :user_id, NOW(), NOW())";

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
                return $this->db->lastInsertId();
            }
            return false;

        } catch (PDOException $e) {
            error_log("Error creating task: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza una tarea
     */
    public function update($id, $userId, $data) {
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
     * Elimina una tarea
     */
    public function delete($id, $userId) {
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
     * Obtiene conteo de tareas por estado
     */
    public function getStatusCount($userId) {
        $query = "SELECT status, COUNT(*) as count FROM tasks WHERE user_id = :user_id GROUP BY status";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Paginación de tareas
     */
    public function findWithPagination($userId, $limit, $offset) {
        $stmt = $this->db->prepare(
            "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Total de tareas (para paginación)
     */
    public function getTotalCount($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM tasks WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['total'] ?? 0);
    }

    /**
     * Buscar tareas por título o descripción
     */
    public function searchByUser($userId, $searchTerm) {
        $stmt = $this->db->prepare(
            "SELECT * FROM tasks WHERE user_id = :user_id AND (title LIKE :term OR description LIKE :term) ORDER BY created_at DESC"
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':term', '%' . $searchTerm . '%', PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * tareas (tasks) están asociadas a un usuario específico
     */
    public function countByUser($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM tasks WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['total'] ?? 0);
    }
}
?>