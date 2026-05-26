<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{

    protected $table = 'categoria'; 

    public $timestamps = false;

    protected $fillable = ['nome'];

    //  Relacionamento Inverso (Opcional, mas muito útil)
    // "Uma categoria tem várias Ordens de Serviço"
    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'categoria_id');
    }
}