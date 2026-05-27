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
        \App\Models\Status::firstOrCreate(['nome' => 'Novo']);
        \App\Models\Status::firstOrCreate(['nome' => 'Em Andamento']);
        \App\Models\Status::firstOrCreate(['nome' => 'Pausado']);
        \App\Models\Status::firstOrCreate(['nome' => 'Cancelado']);
    }
}
