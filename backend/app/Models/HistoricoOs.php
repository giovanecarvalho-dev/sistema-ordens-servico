<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoricoOs extends Model
{
    protected $table = 'historico_os';
    
    // Como só temos a data de criação no banco, desativamos os timestamps automáticos do Laravel
    public $timestamps = false; 

    protected $fillable = [
        'ordem_servico_id', 
        'usuario_id', 
        'acao', 
        'descricao', 
        'criado_em'
    ];

    // O histórico pertence a uma OS
    public function ordemServico()
    {
        return $this->belongsTo(OrdemServico::class, 'ordem_servico_id');
    }

    // O histórico foi registrado por um Usuário
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}