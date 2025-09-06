<?php
namespace App\Models;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     title="User",
 *     required={"email", "password"},
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID único del usuario"
 *     ),
 *     @OA\Property(
 *         property="email",
 *         type="string",
 *         format="email",
 *         description="Email del usuario"
 *     ),
 *     @OA\Property(
 *         property="password",
 *         type="string",
 *         description="Password del usuario (hash)"
 *     ),
 *     @OA\Property(
 *         property="name",
 *         type="string",
 *         description="Nombre del usuario"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         description="Fecha de creación"
 *     )
 * )
 */
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $email;
    public $password;
    public $name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (email, password, name)
                VALUES (:email, :password, :name)
                RETURNING id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->name = htmlspecialchars(strip_tags($this->name));
        
        // Hash password
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":name", $this->name);
        
        if($stmt->execute()) {
            // Guardar el id generado por PostgreSQL
            $this->id = $stmt->fetchColumn();
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, email, password, name
                    FROM " . $this->table_name . "
                    WHERE email = ?
                    LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->password = $row['password'];
            $this->name = $row['name'];
            return true;
        }
        return false;
    }

    public function verifyPassword($password) {
        return password_verify($password, $this->password);
    }
}
?>