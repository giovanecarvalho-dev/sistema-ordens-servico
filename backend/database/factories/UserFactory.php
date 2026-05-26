<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake()->name(),

            'cpf' => fake()->numerify('###########'),

            'email' => fake()->unique()->safeEmail(),

            'senha' => '123456',

            // 1 = admin
            // 2 = técnico
            // 3 = usuário comum
            'cargo_id' => 1,

            'ativo' => true,

            // Simula o estado pós-login: o jti_token é gerado no login real
            // e precisa existir para que JWTAuth::fromUser() consiga montar o token nos testes
            'jti_token' => \Illuminate\Support\Str::uuid()->toString(),
            'jti_token_created_at' => now(),
        ];
    }

    /**
     * Usuário admin
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo_id' => 1,
        ]);
    }

    /**
     * Técnico
     */
    public function tecnico(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo_id' => 2,
        ]);
    }

    /**
     * Usuário comum
     */
    public function usuario(): static
    {
        return $this->state(fn (array $attributes) => [
            'cargo_id' => 3,
        ]);
    }
}