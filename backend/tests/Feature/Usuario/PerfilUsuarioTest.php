<?php

namespace Tests\Feature\Usuario;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class PerfilUsuarioTest extends TestCase
{
    public function test_usuario_nao_pode_editar_outro_perfil()
    {
        // Arrange
        $usuario = User::factory()->usuario()->create();

        $outroUsuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuario);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson(
            "/api/usuarios/{$outroUsuario->id}/perfil",
            [
                'nome' => 'Hack'
            ]
        );

        // Assert
        $response->assertForbidden();
    }

    public function test_nao_pode_atualizar_email_duplicado()
    {
        // Arrange
        $usuario = User::factory()->usuario()->create();

        $outroUsuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuario);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson(
            "/api/usuarios/{$usuario->id}/perfil",
            [
                'email' => $outroUsuario->email
            ]
        );

        // Assert
        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'email'
        ]);
    }
}