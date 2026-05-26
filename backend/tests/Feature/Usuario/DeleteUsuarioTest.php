<?php

namespace Tests\Feature\Usuario;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
class DeleteUsuarioTest extends TestCase
{
    public function test_usuario_pode_ser_deletado()
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
        )->deleteJson("/api/usuarios/{$user->id}");

        // Assert
        $response->assertStatus(200); // O controller retorna 200 com mensagem

        $this->assertDatabaseMissing('usuarios', [
            'id' => $user->id,
        ]);
    }
}