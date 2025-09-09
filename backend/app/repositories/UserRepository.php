<?php

namespace App\Repositories;

use PDO;
use App\Models\User;
use PDOException;

class UserRepository {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * Retorna un objeto User en caso de éxito, o null en caso de fallo.
     */
    public function create(array $data): ?User {
        try {
            $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password) RETURNING id, created_at";
            $stmt = $this->db->prepare($query);

            $name = htmlspecialchars(strip_tags($data['name']));
            $email = htmlspecialchars(strip_tags($data['email']));
            $password = password_hash($data['password'], PASSWORD_BCRYPT);
            
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $password);

            if ($stmt->execute()) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $data['id'] = $row['id'];
                $data['created_at'] = $row['created_at'];
                return new User($data);
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error creating user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Busca un usuario por su email.
     * Retorna un objeto User si se encuentra, o null.
     */
    public function findByEmail(string $email): ?User {
        $query = "SELECT id, name, email, password, created_at FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $userData ? new User($userData) : null;
    }

    /**
     * Verifica si un usuario existe con el email dado.
     */
    public function emailExists(string $email): bool {
        return (bool) $this->findByEmail($email);
    }
}
?>