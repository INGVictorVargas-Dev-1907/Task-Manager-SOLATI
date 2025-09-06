<?php
namespace App\Docs;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Task Manager API",
 *     description="Documentación de la API de gestión de tareas"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8080",
 *     description="Servidor local"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
