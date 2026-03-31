<?php

namespace Database\Seeders;

use App\Models\OrdemServico;
use Illuminate\Database\Seeder;

class OrdemServicoSeeder extends Seeder
{
    public function run(): void
    {
        // OSs novas (aguardando atribuição de técnico)
        OrdemServico::factory()->count(10)->aberta()->create();

        // OSs aleatórias (status variado: Novo, Em andamento, Fechado)
        OrdemServico::factory()->count(30)->create();

        // OSs fechadas (com solução preenchida)
        OrdemServico::factory()->count(10)->concluida()->create();
    }
}
