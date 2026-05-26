<?php

namespace Tests\Feature\Usuario;

use App\Models\Cargo;
use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ListUsuarioTest extends TestCase
{
    public function test_admin_pode_listar_usuarios()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/usuarios');

        // Assert
        $response->assertOk();
    }

    public function test_usuario_comum_nao_pode_listar_usuarios()
    {
        // Arrange
        $usuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuario);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/usuarios');

        // Assert
        $response->assertForbidden();
    }

    public function test_admin_pode_atualizar_cargo_de_usuario()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $usuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($admin);

        $cargoTecnicoId = Cargo::where(
            'nome',
            'Tecnico'
        )->value('id');

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/usuarios/{$usuario->id}", [
            'cargo' => 'Tecnico',
        ]);

        // Assert
        $response->assertOk();

        $this->assertDatabaseHas('usuarios', [
            'id'       => $usuario->id,
            'cargo_id' => $cargoTecnicoId,
        ]);
    }

    public function test_admin_pode_excluir_usuario()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $usuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->deleteJson("/api/usuarios/{$usuario->id}");

        // Assert
        $response->assertOk();

        $this->assertDatabaseHas('usuarios', [
            'id' => $usuario->id,
            'ativo' => false,
        ]);
    }

    public function test_usuario_comum_nao_pode_atualizar_usuario()
    {
        // Arrange
        $usuarioComum = User::factory()->usuario()->create();

        $alvo = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuarioComum);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/usuarios/{$alvo->id}", [
            'cargo' => 'Tecnico',
        ]);

        // Assert
        $response->assertForbidden();
    }

    public function test_usuario_comum_nao_pode_excluir_usuario()
    {
        // Arrange
        $usuarioComum = User::factory()->usuario()->create();

        $alvo = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuarioComum);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->deleteJson("/api/usuarios/{$alvo->id}");

        // Assert
        $response->assertForbidden();
    }
}