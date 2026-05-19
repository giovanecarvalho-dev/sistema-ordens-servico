<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Categoria::firstOrCreate(['nome' => 'Rede']);
        \App\Models\Categoria::firstOrCreate(['nome' => 'Infraestrutura']);
        \App\Models\Categoria::firstOrCreate(['nome' => 'Acesso']);
    }
}
