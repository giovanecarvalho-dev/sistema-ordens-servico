<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    // 1. Aponta para o schema e o nome exato da tabela no banco
    protected $table = 'core.categoria'; 

    // 2. Se a sua tabela não tiver as colunas created_at e updated_at, descomente a linha abaixo:
    public $timestamps = false;

    protected $fillable = ['nome'];

    // 3. Relacionamento Inverso (Opcional, mas muito útil)
    // "Uma categoria tem várias Ordens de Serviço"
    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'categoria_id');
    }
}