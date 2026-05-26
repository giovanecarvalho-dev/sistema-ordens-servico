<?php

namespace Tests\Feature\Usuario;

use Tests\TestCase;
use App\Models\User;

class CreateUsuarioTest extends TestCase
{
    public function test_usuario_pode_se_cadastrar()
    {
        $cpf = substr(number_format(microtime(true) * 1000000, 0, '', ''), -11);
        $email = 'user_cadastrar_' . uniqid() . '@example.com';

        $response = $this->postJson('/api/usuarios', [
            'nome'  => 'João',
            'cpf'   => $cpf,
            'email' => $email,
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
        $cpf = substr(number_format(microtime(true) * 1000000, 0, '', ''), -11);

        User::factory()->create([
            'cpf' => $cpf,
        ]);

        $response = $this->postJson('/api/usuarios', [
            'nome'  => 'Maria',
            'cpf'   => $cpf,
            'email' => 'user_cpf_dup_' . uniqid() . '@example.com',
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
    $email = 'user_email_dup_' . uniqid() . '@example.com';

    User::factory()->create([
        'email' => $email,
    ]);

    // Act
    $response = $this->postJson('/api/usuarios', [
        'nome'  => 'Maria',
        'cpf'   => substr(number_format(microtime(true) * 1000000, 0, '', ''), -11),
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
        'cpf'   => substr(number_format(microtime(true) * 1000000, 0, '', ''), -11),
        'email' => 'user_senha_curta_' . uniqid() . '@example.com',
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
        'cpf'   => substr(number_format(microtime(true) * 1000000, 0, '', ''), -11),
        'email' => 'user_sem_nome_' . uniqid() . '@example.com',
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
        'email' => 'user_cpf_inv_' . uniqid() . '@example.com',
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
        'cpf'   => substr(number_format(microtime(true) * 1000000, 0, '', ''), -11),
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