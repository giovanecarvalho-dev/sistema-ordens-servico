<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UrgenciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Urgencia::create(['nome' => 'Baixa']);
        \App\Models\Urgencia::create(['nome' => 'Média']);
        \App\Models\Urgencia::create(['nome' => 'Alta']);
    }
}
