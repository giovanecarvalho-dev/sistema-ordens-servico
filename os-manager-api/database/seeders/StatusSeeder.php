<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Status::create(['nome' => 'Novo']);
        \App\Models\Status::create(['nome' => 'Em Andamento']);
        \App\Models\Status::create(['nome' => 'Pausado']);
        \App\Models\Status::create(['nome' => 'Concluído']);
        \App\Models\Status::create(['nome' => 'Cancelado']);
    }
}
