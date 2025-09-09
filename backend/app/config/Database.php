<?php
namespace App\Config;

use PDO;
use PDOException;
use Dotenv\Dotenv;

class Database {
    // 1. Propiedad estática para la única instancia de la conexión
    private static ?PDO $instance = null;
    
    // 2. El constructor es privado para evitar la creación directa de instancias
    private function __construct() {
        // Cargar variables de entorno
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();
    }

    // 3. Método estático para obtener la conexión
    public static function getConnection(): ?PDO {
        // Si no existe una instancia, la crea
        if (self::$instance === null) {
            try {
                $host = $_ENV['DB_HOST'];
                $db_name = $_ENV['DB_NAME'];
                $username = $_ENV['DB_USER'];
                $password = $_ENV['DB_PASS'];
                $port = $_ENV['DB_PORT'] ?? '5432';

                self::$instance = new PDO(
                    "pgsql:host={$host};port={$port};dbname={$db_name}",
                    $username,
                    $password
                );

                // Configurar atributos de PDO
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                // Forzar codificación UTF-8
                self::$instance->exec("SET client_encoding TO 'UTF8'");
                
            } catch(PDOException $exception) {
                // En un entorno de producción, es mejor registrar el error que mostrarlo directamente
                error_log("Connection error: " . $exception->getMessage());
                return null;
            }
        }
        return self::$instance;
    }
    
    // 4. Prevenir la clonación y serialización de la instancia
    private function __clone() {}
    public function __wakeup() {}
}
?>