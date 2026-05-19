<?php

namespace Tests\Feature\Usuario;

use Tests\TestCase;
use App\Models\User;

class CreateUsuarioTest extends TestCase
{
    public function test_usuario_pode_se_cadastrar()
    {
        $cpf = fake()->numerify('###########');

        $response = $this->postJson('/api/usuarios', [
            'nome'  => 'João',
            'cpf'   => $cpf,
            'email' => fake()->safeEmail(),
            'senha' => '1234',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('usuarios', [
            'cpf'  => $cpf,
            'nome' => 'João',
        ]);
    }

    public function test_nao_pode_cadastrar_usuario_com_cpf_duplicado()
    {
        $cpf = fake()->numerify('###########');

        User::factory()->create([
            'cpf' => $cpf,
        ]);

        $response = $this->postJson('/api/usuarios', [
            'nome'  => 'Maria',
            'cpf'   => $cpf,
            'email' => fake()->safeEmail(),
            'senha' => '1234',
        ]);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'cpf'
        ]);
    }
    public function test_nao_pode_cadastrar_usuario_com_email_duplicado()
    {
    // Arrange
    $email = fake()->safeEmail();

    User::factory()->create([
        'email' => $email,
    ]);

    // Act
    $response = $this->postJson('/api/usuarios', [
        'nome'  => 'Maria',
        'cpf'   => fake()->numerify('###########'),
        'email' => $email,
        'senha' => '1234',
    ]);

    // Assert
    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'email'
    ]);
    }
    public function test_nao_pode_cadastrar_usuario_com_senha_curta()
    {   
    // Act
    $response = $this->postJson('/api/usuarios', [
        'nome'  => 'João',
        'cpf'   => fake()->numerify('###########'),
        'email' => fake()->safeEmail(),
        'senha' => '12',
    ]);

    // Assert
    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'senha'
    ]);
}
    public function test_nao_pode_cadastrar_usuario_sem_nome()
{
    // Act
    $response = $this->postJson('/api/usuarios', [
        'cpf'   => fake()->numerify('###########'),
        'email' => fake()->safeEmail(),
        'senha' => '1234',
    ]);

    // Assert
    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'nome'
    ]);
}
public function test_nao_pode_cadastrar_usuario_com_cpf_invalido()
{
    // Act
    $response = $this->postJson('/api/usuarios', [
        'nome'  => 'João',
        'cpf'   => '123',
        'email' => fake()->safeEmail(),
        'senha' => '1234',
    ]);

    // Assert
    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'cpf'
    ]);
}
public function test_nao_pode_cadastrar_usuario_com_email_invalido()
{
    // Act
    $response = $this->postJson('/api/usuarios', [
        'nome'  => 'João',
        'cpf'   => fake()->numerify('###########'),
        'email' => 'email-invalido',
        'senha' => '1234',
    ]);

    // Assert
    $response->assertStatus(422);

    $response->assertJsonValidationErrors([
        'email'
    ]);
}
}