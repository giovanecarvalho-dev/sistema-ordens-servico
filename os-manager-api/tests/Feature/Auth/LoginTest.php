<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class LoginTest extends TestCase
{
    public function test_usuario_pode_fazer_login_com_credenciais_validas()
    {
        // Arrange
        $cpf = fake()->numerify('###########');

        User::factory()->create([
            'cpf' => $cpf,
            'senha' => 'password',
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'cpf' => $cpf,
            'senha' => 'password',
        ]);

        // Assert
        $response->assertOk();

        $response->assertJsonStructure([
            'user',
            'token'
        ]);
    }

    public function test_usuario_nao_pode_fazer_login_com_credenciais_invalidas()
    {
        // Arrange
        $cpf = fake()->numerify('###########');

        User::factory()->create([
            'cpf' => $cpf,
            'senha' => 'password',
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'cpf' => $cpf,
            'senha' => 'wrongpassword',
        ]);

        // Assert
        $response->assertUnauthorized();
    }
    public function test_usuario_recebe_422_sem_cpf()
    {
    
    $response = $this->postJson('/api/login', [
        'senha' => 'password',
    ]);

    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'cpf'
    ]);
    }
}