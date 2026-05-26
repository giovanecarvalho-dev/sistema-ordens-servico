<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdemServicoComentario extends Model
{
    use HasFactory;

    protected $table = 'core.ordem_servico_comentarios';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'ordem_servico_id',
        'usuario_id',
        'conteudo',
    ];

    protected $appends = [
        'usuario_nome',
        'usuario_cargo',
    ];

    public function ordemServico()
    {
        return $this->belongsTo(OrdemServico::class, 'ordem_servico_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function getUsuarioNomeAttribute()
    {
        return $this->usuario?->nome ?? 'Usuário Removido';
    }

    public function getUsuarioCargoAttribute()
    {
        $cargo = $this->usuario?->cargo;
        return is_string($cargo) ? $cargo : ($cargo?->nome ?? '');
    }
}
