<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // ───────────────────────────────────────────────
        // Usuários fixos (para uso no Swagger / testes)
        // ───────────────────────────────────────────────

        // Admin principal
        User::firstOrCreate(
            ['email' => 'admin@empresa.com'],
            [
                'nome'  => 'Administrador',
                'cpf'   => '00000000000',
                'senha' => Hash::make('admin1234'),
                'cargo' => 'admin',
                'ativo' => true,
            ]
        );

        // Técnicos fixos
        User::firstOrCreate(
            ['email' => 'tecnico1@empresa.com'],
            [
                'nome'  => 'Carlos Técnico',
                'cpf'   => '11111111111',
                'senha' => Hash::make('tecnico1234'),
                'cargo' => 'tecnico',
                'ativo' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'tecnico2@empresa.com'],
            [
                'nome'  => 'Fernanda Silva',
                'cpf'   => '22222222222',
                'senha' => Hash::make('tecnico1234'),
                'cargo' => 'tecnico',
                'ativo' => true,
            ]
        );

        // Usuário solicitante fixo
        User::firstOrCreate(
            ['email' => 'usuario@empresa.com'],
            [
                'nome'  => 'João Solicitante',
                'cpf'   => '33333333333',
                'senha' => Hash::make('usuario1234'),
                'cargo' => 'usuario',
                'ativo' => true,
            ]
        );

        // ───────────────────────────────────────────────
        // Usuários aleatórios gerados via factory
        // ───────────────────────────────────────────────
        User::factory()->count(5)->tecnico()->create();
        User::factory()->count(20)->usuario()->create();
        User::factory()->count(2)->usuario()->inativo()->create();
    }
}
