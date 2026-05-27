<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('cpf', '99632649125')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}
echo "User CPF: {$user->cpf}\n";
echo "User Hash: {$user->senha}\n";

$credentials = [
    'cpf' => '99632649125',
    'password' => '1234'
];

$token = auth('api')->attempt($credentials);
if ($token) {
    echo "Attempt SUCCESS. Token: $token\n";
} else {
    echo "Attempt FAILED\n";
}
