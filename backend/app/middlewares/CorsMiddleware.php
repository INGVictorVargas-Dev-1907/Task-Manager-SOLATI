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
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8081',
            'http://localhost:8080'
        ];

        $origin = $request->getHeaderLine('Origin');
        $originAllowed = in_array($origin, $allowedOrigins) ? $origin : null;

        $headers = [
            'Access-Control-Allow-Origin' => $originAllowed ?? 'http://localhost:3000',
            'Access-Control-Allow-Headers' => 'Authorization, Content-Type, Accept, X-Requested-With',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
            'Vary' => 'Origin'
        ];

        // Preflight request
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            $response = new Response();
            foreach ($headers as $key => $value) {
                $response = $response->withHeader($key, $value);
            }
            return $response->withStatus(200);
        }

        // Normal request
        $response = $handler->handle($request);
        foreach ($headers as $key => $value) {
            $response = $response->withHeader($key, $value);
        }

        return $response;
    }
}
?>