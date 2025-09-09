<?php
namespace App\Models;

class Task {
    public $id;
    public $title;
    public $description;
    public $status;
    public $user_id;
    public $created_at;
    public $updated_at;

    public function __construct(array $data) {
        $this->id = $data['id'] ?? null;
        $this->title = $data['title'] ?? null;
        $this->description = $data['description'] ?? null;
        $this->status = $data['status'] ?? null;
        $this->user_id = $data['user_id'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public function isCompleted(): bool {
        return $this->status === 'completada';
    }
    
    // Método para convertir el objeto a un array
    public function toArray(): array {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
?>