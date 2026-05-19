<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class SecurancaTest extends TestCase
{
    public function test_usuario_inativo_nao_pode_fazer_login()
    {
        // Arrange
        $cpf = fake()->numerify('###########');

        User::factory()->create([
            'cpf'   => $cpf,
            'senha' => bcrypt('1234'),
            'ativo' => false,
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'cpf'   => $cpf,
            'senha' => '1234',
        ]);

        // Assert
        $response->assertUnauthorized();
    }

    public function test_rota_protegida_sem_token_retorna_401()
    {
        // Act
        $response = $this->getJson('/api/usuarios');

        // Assert
        $response->assertUnauthorized();
    }

    public function test_rota_protegida_com_token_invalido_retorna_401()
    {
        // Act
        $response = $this->withHeader(
            'Authorization',
            'Bearer token-invalido'
        )->getJson('/api/usuarios');

        // Assert
        $response->assertUnauthorized();
    }

    public function test_logout_invalida_token()
    {
        // Arrange
        $usuario = User::factory()->admin()->create();

        $token = JWTAuth::fromUser($usuario);

        // Act
        $logoutResponse = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->postJson('/api/logout');

        // Assert
        $logoutResponse->assertOk();

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/perfil');

        // Assert
        $response->assertUnauthorized();
    }
}