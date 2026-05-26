<?php

namespace Tests\Feature\OrdemServicos;

use App\Models\OrdemServico;
use App\Models\User;
use App\Models\OrdemServicoComentario;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ComentariosTest extends TestCase
{
    public function test_usuario_autorizado_pode_adicionar_comentario()
    {
        // Dono da OS
        $usuario = User::factory()->usuario()->create();
        $token = JWTAuth::fromUser($usuario);

        $ordem = OrdemServico::factory()->create([
            'usuario_id' => $usuario->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/ordens/{$ordem->id}/comentarios", [
                'conteudo' => 'Este é um comentário de teste do dono da OS.'
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'ordem_servico_id',
            'usuario_id',
            'conteudo',
            'criado_em',
            'usuario_nome'
        ]);

        $this->assertDatabaseHas('core.ordem_servico_comentarios', [
            'ordem_servico_id' => $ordem->id,
            'usuario_id' => $usuario->id,
            'conteudo' => 'Este é um comentário de teste do dono da OS.'
        ]);
    }

    public function test_usuario_nao_autorizado_nao_pode_adicionar_comentario()
    {
        // Outro cliente que não é dono nem técnico do chamado
        $dono = User::factory()->usuario()->create();
        $outro = User::factory()->usuario()->create();
        $token = JWTAuth::fromUser($outro);

        $ordem = OrdemServico::factory()->create([
            'usuario_id' => $dono->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/ordens/{$ordem->id}/comentarios", [
                'conteudo' => 'Tentativa de comentário invasivo.'
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('core.ordem_servico_comentarios', [
            'conteudo' => 'Tentativa de comentário invasivo.'
        ]);
    }

    public function test_admin_pode_comentar_em_qualquer_os()
    {
        $dono = User::factory()->usuario()->create();
        $admin = User::factory()->admin()->create();
        $token = JWTAuth::fromUser($admin);

        $ordem = OrdemServico::factory()->create([
            'usuario_id' => $dono->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/ordens/{$ordem->id}/comentarios", [
                'conteudo' => 'Comentário administrativo.'
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('core.ordem_servico_comentarios', [
            'ordem_servico_id' => $ordem->id,
            'usuario_id' => $admin->id,
            'conteudo' => 'Comentário administrativo.'
        ]);
    }
}
