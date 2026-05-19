<?php

namespace Tests\Feature\OrdemServicos;

use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class CriarOrdemServicoTest extends TestCase
{
    public function test_usuario_autenticado_pode_criar_ordem_servico()
    {
        // Arrange
        $usuario = User::factory()->admin()->create();

        $token = JWTAuth::fromUser($usuario);

        $dadosOS = [
            'titulo'      => 'Configuração de Rede',
            'descricao'   => 'Cliente solicita configuração de rede no escritório',
            'localizacao' => 'Prédio A, Sala 101',
            'categoria'   => 'Rede',
            'urgencia'    => 'Alta',
            'prioridade'  => 'Alta',
        ];

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->postJson('/api/ordens', $dadosOS);

        // Assert
        $response->assertCreated();

        $response->assertJsonStructure([
            'id',
            'titulo',
            'descricao',
            'localizacao',
            'status_nome',
            'categoria_nome',
            'codigo_rastreio',
        ]);

        $this->assertDatabaseHas('ordem_servicos', [
            'titulo'    => $dadosOS['titulo'],
            'usuario_id' => $usuario->id,
            'ativo'     => true,
        ]);
    }

    public function test_nao_pode_criar_ordem_servico_com_status_invalido()
    {
        // Arrange
        $usuario = User::factory()->usuario()->create();

        $token = JWTAuth::fromUser($usuario);

        $dadosInvalidos = [
            'titulo'      => 'Teste',
            'descricao'   => 'Descrição',
            'localizacao' => 'Sala 101',
            'status'      => 'StatusInexistente',
        ];

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->postJson('/api/ordens', $dadosInvalidos);

        // Assert
        $response->assertStatus(422);

        $response->assertJsonStructure([
            'message',
            'errors'
        ]);

        $response->assertJsonValidationErrors([
            'status'
        ]);
    }
}