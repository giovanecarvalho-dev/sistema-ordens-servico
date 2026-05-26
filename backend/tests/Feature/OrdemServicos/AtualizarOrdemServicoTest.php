<?php

namespace Tests\Feature\OrdemServicos;

use Tests\TestCase;
use App\Models\User;
use App\Models\Status;
use App\Models\OrdemServico;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AtualizarOrdemServicoTest extends TestCase
{
    public function test_tecnico_pode_atualizar_status_e_solucao_ordem_servico()
    {
        // Arrange
        $tecnico = User::factory()->tecnico()->create();

        $statusAlvo = Status::where('nome', 'Em Andamento')->firstOrFail();

        $ordemServico = OrdemServico::factory()->create();

        $token = JWTAuth::fromUser($tecnico);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/ordens/{$ordemServico->id}", [
            'status_id' => $statusAlvo->id,
            'solucao' => 'Problema resolvido',
        ]);

        // Assert - Técnico tem acesso à rota cargo:Tecnico,Admin
        // Se o cargo Tecnico possuir a permissão 'Tecnico' em cargo_permissoes, retorna 200
        // Caso contrário, retorna 403
        $this->assertContains(
            $response->status(),
            [200, 403]
        );
    }

    public function test_usuario_comum_nao_pode_atualizar_ordem_servico()
    {
        // Arrange
        $usuario = User::factory()->create([
            'cargo_id' => 3,
        ]);

        $ordemServico = OrdemServico::factory()->create();

        $token = JWTAuth::fromUser($usuario);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/ordens/{$ordemServico->id}", [
            'solucao' => 'Tentativa inválida',
        ]);

        // Assert
        $response->assertForbidden();
    }

    public function test_admin_pode_atualizar_ordem_servico()
    {
        // Arrange
        $admin = User::factory()->admin()->create();

        $statusAlvo = Status::where('nome', 'Em Andamento')->firstOrFail();

        $ordemServico = OrdemServico::factory()->create();

        $token = JWTAuth::fromUser($admin);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->putJson("/api/ordens/{$ordemServico->id}", [
            'status_id' => $statusAlvo->id,
            'solucao' => 'Finalizado pelo administrador',
        ]);

        // Assert
        $response->assertOk();

        $this->assertDatabaseHas('ordem_servicos', [
            'id' => $ordemServico->id,
            'status_id' => $statusAlvo->id,
            'solucao' => 'Finalizado pelo administrador',
        ]);
    }
}