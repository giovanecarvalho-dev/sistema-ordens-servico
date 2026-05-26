<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacao extends Model
{
    protected $table = 'gestoes.notificacoes';
    
    public $timestamps = false; 

    protected $fillable = [
        'usuario_id', 
        'ordem_servico_id', 
        'titulo', 
        'mensagem', 
        'lida', 
        'criado_em'
    ];

    protected $casts = [
        'lida' => 'boolean',
    ];

    // Relação com o Usuário (Técnico)
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Relação com a Ordem de Serviço
    public function ordemServico()
    {
        return $this->belongsTo(OrdemServico::class, 'ordem_servico_id');
    }
}
