<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrdemServico>
 */
class OrdemServicoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titulos = [
            'Computador não liga',
            'Impressora sem comunicação',
            'Falha de acesso à internet',
            'Tela azul ao iniciar sistema',
            'Troca de teclado com defeito',
            'Lentidão no sistema operacional',
            'Atualização de software solicitada',
            'Configuração de e-mail corporativo',
            'Instalação de antivírus',
            'Problemas com rede Wi-Fi',
            'Monitor com falha de imagem',
            'Mouse não responde',
            'Backup de dados solicitado',
            'Resetar senha de usuário',
            'Notebook com bateria viciada',
        ];

        $localizacoes = [
            'Sala 101 - Administrativo',
            'Sala 202 - RH',
            'Laboratório - TI',
            'Recepção',
            'Diretoria',
            'Sala de Reuniões A',
            'Sala de Reuniões B',
            'Almoxarifado',
            'Financeiro',
            'Setor de Compras',
        ];

        $categorias = [
            'Hardware',
            'Software',
            'Rede',
            'Periférico',
            'Segurança',
            'Backup',
            'Suporte Geral',
        ];

        $status    = fake()->randomElement(['aberta', 'em_andamento', 'concluida', 'cancelada']);
        $tecnicoId = $status !== 'aberta'
            ? User::where('cargo', 'tecnico')->inRandomOrder()->value('id')
            : null;

        $solucao = null;
        if ($status === 'concluida') {
            $solucoes = [
                'Problema resolvido com reinicialização do serviço.',
                'Driver reinstalado com sucesso.',
                'Cabo de rede trocado e conectividade restabelecida.',
                'Peça substituída e equipamento funcionando normalmente.',
                'Configuração corrigida e usuário orientado.',
                'Soft-reset realizado; sistema estável.',
            ];
            $solucao = fake()->randomElement($solucoes);
        }

        return [
            'titulo'      => fake()->randomElement($titulos),
            'descricao'   => fake('pt_BR')->paragraph(2),
            'status'      => $status,
            'urgencia'    => fake()->randomElement(['baixa', 'media', 'alta', 'critica']),
            'prioridade'  => fake()->randomElement(['baixa', 'media', 'alta']),
            'categoria'   => fake()->randomElement($categorias),
            'localizacao' => fake()->randomElement($localizacoes),
            'solucao'     => $solucao,
            'usuario_id'  => User::where('cargo', 'usuario')->inRandomOrder()->value('id'),
            'tecnico_id'  => $tecnicoId,
        ];
    }

    /** OS com status aberta */
    public function aberta(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'aberta',
            'tecnico_id' => null,
            'solucao'    => null,
        ]);
    }

    /** OS concluída com solução preenchida */
    public function concluida(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'  => 'concluida',
            'solucao' => 'Problema identificado e resolvido com sucesso pelo técnico responsável.',
        ]);
    }
}
