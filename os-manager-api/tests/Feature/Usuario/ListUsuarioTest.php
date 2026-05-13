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
        $response->assertStatus(200);
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

    public function test_somente_admin_pode_ver_atualizar_e_excluir_usuarios()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $usuarioComum = User::factory()->usuario()->create();
        $alvo = User::factory()->usuario()->create();

        $adminToken = JWTAuth::fromUser($admin);
        $usuarioToken = JWTAuth::fromUser($usuarioComum);

        $cargoTecnicoId = Cargo::where('nome', 'Tecnico')->value('id');

        // Admin pode listar usuários
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/usuarios')
            ->assertStatus(200);

        // Admin pode atualizar cargo de um usuário
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->putJson("/api/usuarios/{$alvo->id}", [
                'cargo' => 'Tecnico',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('usuarios', [
            'id' => $alvo->id,
            'cargo_id' => $cargoTecnicoId,
        ]);

        // Admin pode excluir um usuário
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->deleteJson("/api/usuarios/{$alvo->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('usuarios', [
            'id' => $alvo->id,
        ]);

    }
}