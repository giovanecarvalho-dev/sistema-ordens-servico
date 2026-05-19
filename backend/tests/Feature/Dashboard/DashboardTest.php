<?php

namespace Tests\Feature\Dashboard;

use Tests\TestCase;
use App\Models\User;
use App\Models\Status;
use App\Models\Categoria;
use App\Models\OrdemServico;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class DashboardTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_pode_visualizar_dashboard()
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
        )->getJson('/api/dashboard/estatisticas');

        // Assert
        $response->assertOk();

        $response->assertJsonStructure([
            'data' => [
                'geral' => [
                    'total',
                    'excluidos',
                    'resolvidos',
                    'abertos',
                    'sem_tecnico',
                    'perc_resolvidos',
                ],
                'top_tecnicos',
                'categorias',
            ],
            'message',
        ]);
    }

    public function test_dashboard_retorna_quantidade_correta_ordens()
    {
        // Arrange
        $admin = User::factory()->create([
            'cargo_id' => 1,
        ]);

        $token = JWTAuth::fromUser($admin);

        $statusNovo = Status::firstOrCreate([
            'nome' => 'Novo',
        ]);

        $categoria = Categoria::firstOrCreate([
            'nome' => 'Rede',
        ]);

        OrdemServico::factory()
            ->count(5)
            ->create([
                'ativo' => true,
                'status_id' => $statusNovo->id,
                'categoria_id' => $categoria->id,
            ]);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/dashboard/estatisticas');

        // Assert
        $response->assertOk();

        $this->assertEquals(
            5,
            $response->json('data.geral.total')
        );

        $this->assertEquals(
            5,
            $response->json('data.geral.abertos')
        );
    }
}