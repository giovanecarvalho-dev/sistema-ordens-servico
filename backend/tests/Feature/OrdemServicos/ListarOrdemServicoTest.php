<?php

namespace Tests\Feature\OrdemServicos;

use App\Models\OrdemServico;
use App\Models\Status;
use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ListarOrdemServicoTest extends TestCase
{
    public function test_admin_pode_listar_todas_ordens()
    {
        // Arrange
        $admin = User::factory()->admin()->create([
            'email' => 'admin_listar_todas_' . uniqid() . '@example.com',
            'cpf' => fake()->numerify('###########'),
        ]);

        $token = JWTAuth::fromUser($admin);

        OrdemServico::factory()
            ->count(5)
            ->create();

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/ordens');

        // Assert
        $response->assertOk();

        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'titulo',
                    'status_nome',
                    'usuario_id',
                ],
            ],
        ]);

        $data = $response->json('data');

        $this->assertGreaterThanOrEqual(
            5,
            count($data)
        );
    }

    public function test_listar_ordens_com_filtro_status()
    {
        // Arrange
        $admin = User::factory()->admin()->create([
            'email' => 'admin_listar_filtro_' . uniqid() . '@example.com',
            'cpf' => fake()->numerify('###########'),
        ]);

        $token = JWTAuth::fromUser($admin);

        $statusNovo = Status::where(
            'nome',
            'Novo'
        )->first() ?? Status::create([
            'nome' => 'Novo'
        ]);

        $statusEmAndamento = Status::where(
            'nome',
            'Em Andamento'
        )->first() ?? Status::create([
            'nome' => 'Em Andamento'
        ]);

        OrdemServico::factory()
            ->count(3)
            ->create([
                'status_id' => $statusNovo->id
            ]);

        OrdemServico::factory()
            ->count(2)
            ->create([
                'status_id' => $statusEmAndamento->id
            ]);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/ordens?status=Novo');

        // Assert
        $response->assertOk();

        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'titulo',
                    'status_nome',
                ],
            ],
        ]);

        $data = $response->json('data');

        foreach ($data as $os) {
            $this->assertEquals(
                'Novo',
                $os['status_nome']
            );
        }
    }

    public function test_listagem_nao_retorna_ordens_inativas()
{
    // Arrange
    $admin = User::factory()->admin()->create([
        'email' => 'admin_listar_nao_retorna_' . uniqid() . '@example.com',
        'cpf' => fake()->numerify('###########'),
    ]);

    $token = JWTAuth::fromUser($admin);

    $osAtiva = OrdemServico::factory()->create([
        'ativo' => true,
    ]);

    $osInativa = OrdemServico::factory()->create([
        'ativo' => false,
    ]);

    // Act
    $response = $this->withHeader(
        'Authorization',
        "Bearer {$token}"
    )->getJson('/api/ordens?per_page=100');

    // Assert
    $response->assertOk();

    $ids = collect(
        $response->json('data')
    )->pluck('id')->toArray();

    $this->assertContains(
        $osAtiva->id,
        $ids
    );

    $this->assertNotContains(
        $osInativa->id,
        $ids
    );
}

    public function test_listagem_de_ordens_inativas()
    {
        // Arrange
        $admin = User::factory()->admin()->create([
            'email' => 'admin_listar_inativas_' . uniqid() . '@example.com',
            'cpf' => fake()->numerify('###########'),
        ]);

        $token = JWTAuth::fromUser($admin);

        OrdemServico::factory()->create([
            'ativo' => true
        ]);

        $osInativa = OrdemServico::factory()->create([
            'ativo' => false
        ]);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token}"
        )->getJson('/api/ordens?ativo=false');

        // Assert
        $response->assertOk();

        $ids = collect(
            $response->json('data')
        )->pluck('id')->toArray();

        $this->assertContains(
            $osInativa->id,
            $ids
        );
    }

    public function test_usuario_comum_so_lista_proprios_chamados()
    {
        // Arrange
        $usuario1 = User::factory()->usuario()->create();
        $usuario2 = User::factory()->usuario()->create();

        $token1 = JWTAuth::fromUser($usuario1);

        $osPropria = OrdemServico::factory()->create([
            'usuario_id' => $usuario1->id,
            'ativo' => true,
        ]);

        $osAlheia = OrdemServico::factory()->create([
            'usuario_id' => $usuario2->id,
            'ativo' => true,
        ]);

        // Act
        $response = $this->withHeader(
            'Authorization',
            "Bearer {$token1}"
        )->getJson('/api/ordens?per_page=100');

        // Assert
        $response->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->toArray();

        $this->assertContains($osPropria->id, $ids);
        $this->assertNotContains($osAlheia->id, $ids);
    }
}