<?php
namespace App\Models;


class User {
    public $id;
    public $name;
    public $email;
    public $password;
    public $created_at;

    public function __construct(array $data) {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->email = $data['email'] ?? null;
        $this->password = $data['password'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
    }
}
?>