<?php

namespace Tests\Feature\OrdemServicos;

use App\Models\OrdemServico;
use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class DeletarOrdemServicoTest extends TestCase
{
    public function test_admin_pode_realizar_soft_delete_ordem_servico()
    {
        // Arrange
        $admin = User::factory()->admin()->create();

        $token = JWTAuth::fromUser($admin);

        $ordemServico = OrdemServico::factory()->create([
            'ativo' => true,
        ]);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->deleteJson("/api/ordens/{$ordemServico->id}");

        // Assert
        $response->assertOk();

        $this->assertDatabaseHas('ordem_servicos', [
            'id'     => $ordemServico->id,
            'ativo' => false,
        ]);
    }
}