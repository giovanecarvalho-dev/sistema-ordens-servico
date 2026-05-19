<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\DB::enableQueryLog();

try {
    $controller = app()->make('App\Http\Controllers\OrdemServicoController');
    $controller->destroy('1');
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

print_r(\DB::getQueryLog());
