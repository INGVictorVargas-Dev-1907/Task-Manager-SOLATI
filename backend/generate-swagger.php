<?php

require 'vendor/autoload.php';

use OpenApi\Generator;

$openapi = Generator::scan(['app/Controllers', 'app/Models', 'app/docs']);
file_put_contents('public/swagger.json', $openapi->toJson());
?>