<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdemServico extends Model
{
    use HasFactory;

    protected $table = 'ordem_servicos';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'titulo',
        'descricao',
        'status',
        'urgencia',
        'prioridade',
        'categoria',
        'localizacao',
        'solucao',
        'usuario_id',
        'tecnico_id',
        'ativo',
        'motivo_pausa',
        'pausado_em',
        'tempo_pausado_minutos',
    ];

    protected $appends = ['status_sla'];

    public function getStatusSlaAttribute()
    {
        if ($this->status === 'Fechado') return null;
        if (in_array($this->status, ['Pausado', 'Aguardando Peça'])) return 'pausado';

        // Tabela de SLA em horas (igual você tinha no front)
        $limitesSla = [
            'Muito Alta' => 2,
            'Alta' => 4,
            'Média' => 8,
            'Baixa' => 24,
        ];

        $limiteHoras = $limitesSla[$this->urgencia] ?? null;
        if (!$limiteHoras) return null;

        // Limite total em minutos
        $limiteMinutos = $limiteHoras * 60;

        // Minutos totais desde a criação até AGORA (hora oficial do servidor)
        $minutosCorridos = now()->diffInMinutes($this->criado_em);

        // Minutos reais = (Total corrido) - (Minutos que ficou pausado no passado)
        $minutosReais = $minutosCorridos - $this->tempo_pausado_minutos;

        // Calcula a porcentagem de tempo gasto
        $porcentagem = $minutosReais / $limiteMinutos;

        if ($porcentagem >= 1) return 'vencido';
        if ($porcentagem >= 0.75) return 'alerta';
        
        return 'ok';
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }
}