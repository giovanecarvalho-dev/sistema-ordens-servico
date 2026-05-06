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
        \App\Models\Categoria::create(['nome' => 'Rede']);
        \App\Models\Categoria::create(['nome' => 'Infraestrutura']);
        \App\Models\Categoria::create(['nome' => 'Acesso']);
    }
}
