<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\OpenApi(
    info: new OA\Info(
        title: "OS Manager API",
        version: "1.0.0"
    ),
    servers: [
        new OA\Server(
            url: "http://localhost:8000",
            description: "Servidor Local"
        )
    ]
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
class OpenApi {}