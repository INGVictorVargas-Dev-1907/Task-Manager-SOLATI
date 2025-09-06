<?php
namespace App\Models;

/**
 * @OA\Schema(
 *     schema="Task",
 *     type="object",
 *     title="Task",
 *     required={"title", "status"},
 *     @OA\Property(property="id", type="integer", description="ID único de la tarea"),
 *     @OA\Property(property="title", type="string", description="Título de la tarea"),
 *     @OA\Property(property="description", type="string", description="Descripción de la tarea"),
 *     @OA\Property(property="status", type="string", description="Estado de la tarea: pendiente o completada", enum={"pendiente", "completada"}),
 *     @OA\Property(property="user_id", type="integer", description="ID del usuario dueño de la tarea"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Fecha de creación"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Fecha de última actualización")
 * )
 */
class Task {
    private $conn;
    private $table_name = "tasks";

    public $id;
    public $title;
    public $description;
    public $status;
    public $user_id;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Obtener todas las tareas de un usuario
    public function findAllByUser($userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Crear tarea y retornar ID
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, description=:description, status=:status, user_id=:user_id, created_at=NOW(), updated_at=NOW()";
        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->user_id = (int)$this->user_id;

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":user_id", $this->user_id);

        if($stmt->execute()) {
            return (int)$this->conn->lastInsertId();
        }
        return false;
    }

    // Actualizar tarea
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title=:title, description=:description, status=:status, updated_at=NOW() 
                  WHERE id=:id AND user_id=:user_id";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = (int)$this->id;
        $this->user_id = (int)$this->user_id;

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);

        return $stmt->execute();
    }

    // Eliminar tarea
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id=:id AND user_id=:user_id";
        $stmt = $this->conn->prepare($query);
        $this->id = (int)$this->id;
        $this->user_id = (int)$this->user_id;

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);

        return $stmt->execute();
    }

    // Buscar tarea por id y usuario
    public function findByIdAndUser($taskId, $userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id=:id AND user_id=:user_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $taskId);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    // Filtrar tareas por estado
    public function findByStatusAndUser($status, $userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE status=:status AND user_id=:user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
?>
