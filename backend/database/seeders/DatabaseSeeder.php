<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->syncPostgresSequences();

        $this->call([
            StatusSeeder::class,
            CategoriaSeeder::class,
            UrgenciaSeeder::class,
            PrioridadeSeeder::class,
            OrdemServicoSeeder::class,
        ]);

        User::factory()->create([
            'nome' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    protected function syncPostgresSequences(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach (['status', 'categoria', 'urgencia', 'prioridade', 'ordem_servicos', 'usuarios'] as $table) {
            $maxId = (int) DB::table($table)->max('id');
            DB::statement('SELECT setval(pg_get_serial_sequence(?, ?), ?, true)', [$table, 'id', $maxId]);
        }
    }
}
