<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permissao extends Model
{
    // Apontando para o schema e tabela corretos
    protected $table = 'permissoes';
    
    // Desativando timestamps
    public $timestamps = false;

    protected $fillable = ['nome', 'descricao'];

    // Relacionamento inverso (Opcional, mas bom ter): Quais cargos têm essa permissão
    public function cargos()
    {
        return $this->belongsToMany(
            Cargo::class, 
            'cargo_permissoes', 
            'permissao_id', 
            'cargo_id'
        );
    }

    // Relacionamento inverso (Opcional): Quais usuários têm essa permissão como EXCEÇÃO
    public function usuarios()
    {
        return $this->belongsToMany(
            User::class, 
            'usuario_permissoes', 
            'permissao_id', 
            'usuario_id'
        );
    }
}