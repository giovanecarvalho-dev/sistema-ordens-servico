<?php

namespace Database\Seeders;

use App\Models\OrdemServico;
use Illuminate\Database\Seeder;

class OrdemServicoSeeder extends Seeder
{
    public function run(): void
    {
        // OSs abertas (aguardando atribuição)
        OrdemServico::factory()->count(10)->aberta()->create();

        // OSs aleatórias (status variado)
        OrdemServico::factory()->count(30)->create();

        // OSs concluídas
        OrdemServico::factory()->count(10)->concluida()->create();
    }
}
