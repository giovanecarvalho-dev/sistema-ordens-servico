<?php

namespace Tests\Feature\Usuario;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class UpdateUsuarioTest extends TestCase
{
    public function test_usuario_pode_ser_atualizado()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $user = User::factory()->create();

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/usuarios/{$user->id}", [
            'cargo' => 'Tecnico',
        ]);

        // Assert
        $response->assertOk();

        $this->assertDatabaseHas('usuarios', [
            'id' => $user->id,
            'cargo_id' => 2, // Tecnico
        ]);
    }
}