<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Ordem importa: usuários devem existir antes das OSs.
     */
    public function run(): void
    {
        $this->call([
            UsuarioSeeder::class,
            OrdemServicoSeeder::class,
        ]);
    }
}
