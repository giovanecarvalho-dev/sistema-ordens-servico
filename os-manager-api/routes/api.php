<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\DashboardController;

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
        return response()->json([
            'status' => 'ERROR',
            'database' => 'Disconnected',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::post('/login', [UsuarioController::class, 'login']);


//protegidos
Route::middleware('auth:api')->group(function () {
    
    //acesso geral para usuários autenticados (Clientes, Técnicos e Admins)
    Route::get('/perfil', [UsuarioController::class, 'me']);
    Route::post('/logout', [UsuarioController::class, 'logout']);
    Route::put('/usuarios/{id}/perfil', [UsuarioController::class, 'updatePerfil']);
    Route::post('/ordens', [OrdemServicoController::class, 'store']); 

    //tecnicos e admin
    Route::middleware('cargo:Tecnico,Admin')->group(function () {
        Route::get('/ordens', [OrdemServicoController::class, 'index']); 
        Route::get('/ordens/{id}', [OrdemServicoController::class, 'show']);
        Route::get('/ordens/{id}/anexo', [OrdemServicoController::class, 'downloadAnexo']);
        Route::put('/ordens/{id}', [OrdemServicoController::class, 'update']);
    });

    //apenas administradores
    Route::middleware('cargo:Admin')->group(function () {
        Route::get('/usuarios', [UsuarioController::class, 'index']);
        Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
        Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
        Route::delete('/ordens/{id}', [OrdemServicoController::class, 'destroy']);
      
        Route::get('/dashboard/estatisticas', [DashboardController::class, 'estatisticas']);
        
    });
});