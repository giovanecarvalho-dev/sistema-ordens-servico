<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str; // Importante para o UUID

class OrdemServico extends Model
{
    use HasFactory;

    protected $table = 'ordem_servicos'; 

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'titulo',
        'descricao',
        'status_id',
        'urgencia_id',
        'prioridade_id',
        'categoria_id',
        'localizacao',
        'solucao',
        'usuario_id',
        'tecnico_id',
        'ativo',
        'motivo_pausa',
        'pausado_em',
        'tempo_pausado_minutos',
        'codigo_rastreio', 
        'anexo',
    ];

    // Carrega os objetos relacionados automaticamente (Evita N+1 queries)
    protected $with = ['status', 'categoria', 'urgencia', 'prioridade']; 

    protected $appends = [
        'status_sla', 
        'status_nome', 
        'urgencia_nome', 
        'prioridade_nome', 
        'categoria_nome'
    ];

    /**
     * ==========================================
     * BOOTED 
     * ==========================================
     * Garante que toda nova OS receba um código de rastreio único, usando UUID para evitar colisões.
     */
    protected static function booted()
    {
        static::creating(function ($os) {
            if (empty($os->codigo_rastreio)) {
                $os->codigo_rastreio = (string) Str::uuid();
            }
        });
    }



    // ==========================================
    // RELAÇÕES
    // ==========================================

    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function urgencia()
    {
        return $this->belongsTo(Urgencia::class, 'urgencia_id');
    }

    public function prioridade()
    {
        return $this->belongsTo(Prioridade::class, 'prioridade_id');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function historicos()
    {
        return $this->hasMany(HistoricoOs::class, 'ordem_servico_id')
                    ->orderBy('criado_em', 'desc');
    }

    // ==========================================
    // ACCESSORS metodos get para facilitar o acesso aos nomes relacionados (Evita ter que acessar $os->status->nome em várias partes do código)
    // ==========================================

    public function getStatusNomeAttribute() { return $this->status?->nome; }
    public function getUrgenciaNomeAttribute() { return $this->urgencia?->nome; }
    public function getPrioridadeNomeAttribute() { return $this->prioridade?->nome; }
    public function getCategoriaNomeAttribute() { return $this->categoria?->nome; }

    // ==========================================
    // STATUS SLA 
    // ==========================================

   public function getStatusSlaAttribute()
    {
        // Pegar diretamente as Foreign Keys (mais rápido, não precisa carregar o relacionamento)
        $statusId = $this->status_id;
        $urgenciaId = $this->urgencia_id;

        // IDs dos status
        $idFechado = 5; 
        $idsPausados = [4, 5]; 

        if ($statusId === $idFechado) return null;
        if (in_array($statusId, $idsPausados)) return 'pausado';

        $limitesSla = [
            4 => 2,  
            3 => 4,  
            2 => 8,  
            1 => 24, //ID e Hora
        ];

        $limiteHoras = $limitesSla[$urgenciaId] ?? null;
        if (!$limiteHoras) return null;

        $limiteMinutos = $limiteHoras * 60;
        $minutosCorridos = now()->diffInMinutes($this->criado_em);
        $minutosReais = $minutosCorridos - ($this->tempo_pausado_minutos ?? 0);

        if ($limiteMinutos <= 0) return 'vencido'; 

        $porcentagem = $minutosReais / $limiteMinutos;

        if ($porcentagem >= 1) return 'vencido';
        if ($porcentagem >= 0.75) return 'alerta';

        return 'ok';
    }
}