<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome'   => fake('pt_BR')->name(),
            'cpf'    => fake('pt_BR')->cpf(false), // apenas dígitos
            'email'  => fake('pt_BR')->unique()->safeEmail(),
            'senha'  => Hash::make('senha1234'),
            'cargo'  => fake()->randomElement(['usuario', 'tecnico']),
            'ativo'  => true,
        ];
    }

    /** Usuário comum (solicitante) */
    public function usuario(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo' => 'usuario',
        ]);
    }

    /** Técnico responsável por atender as OSs */
    public function tecnico(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo' => 'tecnico',
        ]);
    }

    /** Administrador do sistema */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo' => 'admin',
        ]);
    }

    /** Usuário inativo */
    public function inativo(): static
    {
        return $this->state(fn (array $attributes) => [
            'ativo' => false,
        ]);
    }
}
