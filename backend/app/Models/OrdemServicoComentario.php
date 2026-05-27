<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class OrdemServicoComentario extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'core.ordem_servico_comentarios';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';
    const DELETED_AT = 'deleted_at';

    protected $fillable = [
        'ordem_servico_id',
        'usuario_id',
        'conteudo',
        'editado',
        'excluido_para',
        'parent_id',
    ];

    protected $casts = [
        'editado' => 'boolean',
        'excluido_para' => 'array',
    ];

    protected $appends = [
        'usuario_nome',
        'usuario_cargo',
    ];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

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
