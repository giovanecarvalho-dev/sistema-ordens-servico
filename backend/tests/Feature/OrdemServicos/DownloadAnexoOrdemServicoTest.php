<?php

namespace Tests\Feature\OrdemServicos;

use App\Models\OrdemServico;
use App\Models\User;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class DownloadAnexoOrdemServicoTest extends TestCase
{
    public function test_dono_da_ordem_servico_pode_baixar_seu_anexo()
    {
        Storage::fake('public');
        $arquivo = UploadedFile::fake()->create('documento.pdf', 100);
        $caminho = $arquivo->store('anexos', 'public');

        $dono = User::factory()->usuario()->create();
        $token = JWTAuth::fromUser($dono);

        $ordemServico = OrdemServico::factory()->create([
            'usuario_id' => $dono->id,
            'anexo'      => $caminho,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/ordens/{$ordemServico->id}/anexo");

        $response->assertOk();
    }

    public function test_tecnico_atribuido_pode_baixar_o_anexo()
    {
        Storage::fake('public');
        $arquivo = UploadedFile::fake()->create('documento.pdf', 100);
        $caminho = $arquivo->store('anexos', 'public');

        $tecnico = User::factory()->tecnico()->create();
        $token = JWTAuth::fromUser($tecnico);

        $ordemServico = OrdemServico::factory()->create([
            'tecnico_id' => $tecnico->id,
            'anexo'      => $caminho,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/ordens/{$ordemServico->id}/anexo");

        $response->assertOk();
    }

    public function test_admin_pode_baixar_qualquer_anexo()
    {
        Storage::fake('public');
        $arquivo = UploadedFile::fake()->create('documento.pdf', 100);
        $caminho = $arquivo->store('anexos', 'public');

        $admin = User::factory()->admin()->create();
        $token = JWTAuth::fromUser($admin);

        $ordemServico = OrdemServico::factory()->create([
            'anexo' => $caminho,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/ordens/{$ordemServico->id}/anexo");

        $response->assertOk();
    }

    public function test_usuario_comum_nao_pode_baixar_anexo_de_outro()
    {
        Storage::fake('public');
        $arquivo = UploadedFile::fake()->create('documento.pdf', 100);
        $caminho = $arquivo->store('anexos', 'public');

        $outroUsuario = User::factory()->usuario()->create();
        $token = JWTAuth::fromUser($outroUsuario);

        $ordemServico = OrdemServico::factory()->create([
            'anexo' => $caminho,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/ordens/{$ordemServico->id}/anexo");

        $response->assertStatus(403);
    }
}
