<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ConfiguracaoController;

//rotas públicas

Route::get('/teste', function () {
    return response()->json(['message' => 'API funcionando!']);
});

Route::get('/health', function () {
    try {
        \DB::connection()->getPdo();
        return response()->json([
            'status' => 'OK',
            'database' => 'Connected',
            'timestamp' => now()->toDateTimeString()
        ], 200);
    } catch (\Exception $e) {
        \Log::error('Healthcheck database connection error: ' . $e->getMessage());
        return response()->json([
            'status' => 'ERROR',
            'database' => 'Disconnected',
            'message' => 'Erro interno ao conectar ao banco de dados.'
        ], 500);
    }
});

Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::post('/login', [UsuarioController::class, 'login']);


//protegidos
Route::middleware(['auth:api', 'validate-jti'])->group(function () {
    
    //acesso geral para usuários autenticados (Clientes, Técnicos e Admins)
    Route::get('/perfil', [UsuarioController::class, 'me']);
    Route::post('/logout', [UsuarioController::class, 'logout']);
    Route::put('/usuarios/{id}/perfil', [UsuarioController::class, 'updatePerfil']);
    Route::post('/ordens', [OrdemServicoController::class, 'store']); 
    Route::get('/ordens/{id}/anexo', [OrdemServicoController::class, 'downloadAnexo']);

    //tecnicos e admin
    Route::middleware('cargo:Tecnico,Admin')->group(function () {
        Route::get('/ordens', [OrdemServicoController::class, 'index']); 
        Route::get('/ordens/{id}', [OrdemServicoController::class, 'show']);
        Route::put('/ordens/{id}', [OrdemServicoController::class, 'update']);
    });

    //apenas administradores
    Route::middleware('cargo:Admin')->group(function () {
        Route::get('/usuarios', [UsuarioController::class, 'index']);
        Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
        Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
        Route::delete('/ordens/{id}', [OrdemServicoController::class, 'destroy']);
        //dashboard
        Route::get('/dashboard/estatisticas', [DashboardController::class, 'estatisticas']);
        //configuracoes
        Route::get('/configuracoes', [ConfiguracaoController::class, 'index']);
        Route::put('/configuracoes', [ConfiguracaoController::class, 'update']);
    });
});