<?php
namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;
use Slim\Psr7\Response;

class CorsMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $origin = $request->getHeaderLine('Origin') ?: 'http://localhost:3000';
        $headers = [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type, Accept, X-Requested-With',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
            'Vary' => 'Origin'
        ];

        // Si es preflight request OPTIONS, respondemos inmediatamente
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            $response = new Response();
            foreach ($headers as $key => $value) {
                $response = $response->withHeader($key, $value);
            }
            return $response->withStatus(200);
        }

        // Para solicitudes normales, procesamos la ruta y luego agregamos headers
        $response = $handler->handle($request);
        foreach ($headers as $key => $value) {
            $response = $response->withHeader($key, $value);
        }

        return $response;
    }
}
