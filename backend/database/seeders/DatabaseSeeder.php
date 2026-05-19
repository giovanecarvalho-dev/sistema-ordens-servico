<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            StatusSeeder::class,
            CategoriaSeeder::class,
            UrgenciaSeeder::class,
            PrioridadeSeeder::class,
            OrdemServicoSeeder::class,
        ]);

        // Cria um técnico para testes
        User::factory()->tecnico()->create([
            'nome' => 'Técnico de Teste',
            'email' => 'tecnico@teste.com',
        ]);

        // Cria um usuário comum para testes
        User::factory()->usuario()->create([
            'nome' => 'Usuário Comum de Teste',
            'email' => 'usuario@teste.com',
        ]);
    }
}
