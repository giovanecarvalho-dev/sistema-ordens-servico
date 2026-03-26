<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\DashboardController; // <- IMPORTANTE: Faltava importar o Dashboard

// rotas publicas
Route::get('/health', function () {
    try {
        \DB::connection()->getPdo();
        return response()->json([
            'status' => 'OK',
            'database' => 'Connected',
            'timestamp' => now()->toDateTimeString()
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'ERROR',
            'database' => 'Disconnected',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::post('/login', [UsuarioController::class, 'login']);

// rotas protegidas pro token
Route::middleware('auth:sanctum')->group(function () {
    
    // todos tem acesso

    Route::get('/perfil', [UsuarioController::class, 'me']);
    Route::post('/logout', [UsuarioController::class, 'logout']);
    Route::put('/usuarios/{id}/perfil', [UsuarioController::class, 'updatePerfil']);
    Route::post('/ordens', [OrdemServicoController::class, 'store']); 

    // so tecnico e admin
    Route::middleware('cargo:Tecnico,Admin')->group(function () {
        Route::get('/ordens', [OrdemServicoController::class, 'index']); 
        Route::get('/ordens/{id}', [OrdemServicoController::class, 'show']);
        Route::put('/ordens/{id}', [OrdemServicoController::class, 'update']);
    });

    // somente admin
    Route::middleware('cargo:Admin')->group(function () {
        Route::get('/usuarios', [UsuarioController::class, 'index']);
        Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
        Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
        Route::delete('/ordens/{id}', [OrdemServicoController::class, 'destroy']);
        
        // restaurar ordem excluida (Usando PUT conforme você pediu)
        Route::put('/ordens/{id}/restaurar', [OrdemServicoController::class, 'restaurar']);

        // dashboard
        Route::get('/dashboard/estatisticas', [DashboardController::class, 'estatisticas']);
    });
});