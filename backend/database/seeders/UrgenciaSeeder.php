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
        \App\Models\Urgencia::firstOrCreate(['nome' => 'Baixa']);
        \App\Models\Urgencia::firstOrCreate(['nome' => 'Média']);
        \App\Models\Urgencia::firstOrCreate(['nome' => 'Alta']);
    }
}
