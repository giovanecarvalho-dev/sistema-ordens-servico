<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdemServico extends Model
{
    use HasFactory;

    protected $table = 'ordem_servicos';

    // Mapeamento dos timestamps para português
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'titulo', 
        'descricao', 
        'status', 
        'urgencia',
        'prioridade',
        'localizacao',
        'solucao',
        'usuario_id' 
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}