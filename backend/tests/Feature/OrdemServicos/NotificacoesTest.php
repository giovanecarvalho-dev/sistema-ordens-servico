<?php

namespace Tests\Feature\OrdemServicos;

use Tests\TestCase;
use App\Models\User;
use App\Models\OrdemServico;
use App\Models\Notificacao;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class NotificacoesTest extends TestCase
{
    /**
     * Teste 1: Atribuir um técnico a uma OS gera a notificação no banco de dados.
     */
    public function test_atribuir_tecnico_gera_notificacao()
    {
        // Arrange
        $admin = User::factory()->admin()->create();
        $tecnico = User::factory()->tecnico()->create();
        
        $ordemServico = OrdemServico::create([
            'titulo' => 'Problema de Rede',
            'descricao' => 'Sem conexão com a internet',
            'status_id' => 1,
            'categoria_id' => 1,
            'urgencia_id' => 1,
            'prioridade_id' => 1,
            'usuario_id' => $admin->id,
            'tecnico_id' => null,
            'localizacao' => 'Bloco A',
            'ativo' => true
        ]);

        $tokenAdmin = JWTAuth::fromUser($admin);

        // Act: Admin atribui o técnico
        $response = $this->withHeader('Authorization', "Bearer {$tokenAdmin}")
            ->putJson("/api/ordens/{$ordemServico->id}", [
                'tecnico_id' => $tecnico->id,
            ]);

        $response->assertOk();

        // Assert: Notificação criada no banco para o técnico
        $this->assertDatabaseHas('gestoes.notificacoes', [
            'usuario_id' => $tecnico->id,
            'ordem_servico_id' => $ordemServico->id,
            'titulo' => 'Nova OS atribuída',
            'lida' => false
        ]);
    }

    /**
     * Teste 2: Técnico consegue listar e ler suas próprias notificações.
     */
    public function test_tecnico_pode_gerenciar_suas_notificacoes()
    {
        // Arrange
        $tecnico = User::factory()->tecnico()->create();
        $admin = User::factory()->admin()->create();
        
        $ordemServico = OrdemServico::create([
            'titulo' => 'Problema de Rede',
            'descricao' => 'Sem conexão com a internet',
            'status_id' => 1,
            'categoria_id' => 1,
            'urgencia_id' => 1,
            'prioridade_id' => 1,
            'usuario_id' => $admin->id,
            'tecnico_id' => $tecnico->id,
            'localizacao' => 'Bloco A',
            'ativo' => true
        ]);

        // Cria a notificação manualmente no banco
        $notificacao = Notificacao::create([
            'usuario_id' => $tecnico->id,
            'ordem_servico_id' => $ordemServico->id,
            'titulo' => 'Nova OS atribuída',
            'mensagem' => "Você foi atribuído à ordem de serviço #{$ordemServico->id}",
            'lida' => false,
            'criado_em' => now()
        ]);

        $tokenTecnico = JWTAuth::fromUser($tecnico);

        // Act: Técnico visualiza suas notificações
        $responseList = $this->withHeader('Authorization', "Bearer {$tokenTecnico}")
            ->getJson('/api/notificacoes');

        $responseList->assertOk();
        $responseList->assertJsonFragment([
            'id' => $notificacao->id,
            'titulo' => 'Nova OS atribuída'
        ]);

        // Act: Técnico lê a notificação
        $responseRead = $this->withHeader('Authorization', "Bearer {$tokenTecnico}")
            ->putJson("/api/notificacoes/{$notificacao->id}/ler");

        $responseRead->assertOk();

        // Assert: Status lida atualizado
        $this->assertTrue($notificacao->refresh()->lida);
    }
}
