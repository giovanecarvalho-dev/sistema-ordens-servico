<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrioridadeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Prioridade::create(['nome' => 'Baixa']);
        \App\Models\Prioridade::create(['nome' => 'Média']);
        \App\Models\Prioridade::create(['nome' => 'Alta']);
    }
}
