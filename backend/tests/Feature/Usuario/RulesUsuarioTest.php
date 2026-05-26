<?php

namespace Tests\Feature\Usuario;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class RulesUsuarioTest extends TestCase
{
    public function test_usuario_inativo_nao_aparece_na_listagem()
    {
        // Arrange
        $admin = User::factory()->admin()->create();

        $usuarioInativo = User::factory()->create([
            'ativo' => false,
        ]);

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/usuarios');

        // Assert
        $response->assertOk();

        $ids = collect(
            $response->json('data')
        )->pluck('id')->toArray();

        $this->assertNotContains(
            $usuarioInativo->id,
            $ids
        );
    }

    public function test_filtro_ativo_false_retorna_inativos()
    {
        // Arrange
        $admin = User::factory()->admin()->create();

        $usuarioInativo = User::factory()->create([
            'ativo' => false,
        ]);

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/usuarios?ativo=false&per_page=100');

        // Assert
        $response->assertOk();

        $ids = collect(
            $response->json('data')
        )->pluck('id')->toArray();

        $this->assertContains(
            $usuarioInativo->id,
            $ids
        );
    }
}