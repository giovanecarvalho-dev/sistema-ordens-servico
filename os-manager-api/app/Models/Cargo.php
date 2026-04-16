<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    // Apontando para o schema e tabela corretos
    protected $table = 'gestoes.cargos';
    
    // Desativando os timestamps pois essa tabela é só um dicionário
    public $timestamps = false;

    protected $fillable = ['nome']; 

    // Relacionamento: Um cargo tem muitas permissões (N:N)
    public function permissoes()
    {
        return $this->belongsToMany(
            Permissao::class, 
            'gestoes.cargo_permissoes', // Nome da tabela pivot
            'cargo_id',                 // Chave estrangeira deste model na pivot
            'permissao_id'              // Chave estrangeira do model alvo na pivot
        );
    }
}