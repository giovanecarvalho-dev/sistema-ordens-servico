<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\UsuarioController;

Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::post('/login', [UsuarioController::class, 'login']);
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
Route::put('/usuarios/{id}/perfil', [UsuarioController::class, 'updatePerfil']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

Route::apiResource('ordens', OrdemServicoController::class);