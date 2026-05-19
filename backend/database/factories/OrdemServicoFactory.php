<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Status;
use App\Models\Categoria;
use App\Models\Urgencia;
use App\Models\Prioridade;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrdemServico>
 */
class OrdemServicoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(3),
            'descricao' => fake()->paragraph(),
            'localizacao' => fake()->address(),
            'status_id' => Status::first()?->id ?? 1,
            'categoria_id' => Categoria::first()?->id ?? 1,
            'urgencia_id' => Urgencia::first()?->id ?? 1,
            'prioridade_id' => Prioridade::first()?->id ?? 1,
            'usuario_id' => User::factory(),
            'tecnico_id' => null,
            'ativo' => true,
            'tempo_pausado_minutos' => 0,
        ];
    }

    /**
     * OS com status Fechado
     */
    public function fechado(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 5, // ID do status "Fechado"
        ]);
    }

    /**
     * OS com status de pausa
     */
    public function pausado(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 4, // ID do status "Pausado"
            'motivo_pausa' => fake()->sentence(),
            'pausado_em' => now()->subHours(2),
        ]);
    }

    /**
     * OS desativada (soft delete)
     */
    public function inativo(): static
    {
        return $this->state(fn (array $attributes) => [
            'ativo' => false,
        ]);
    }

    /**
     * OS com técnico atribuído
     */
    public function comTecnico(): static
    {
        return $this->state(fn (array $attributes) => [
            'tecnico_id' => User::factory()->tecnico(),
        ]);
    }
}
