<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prioridade extends Model
{
    protected $table = 'core.prioridade'; 
    public $timestamps = false;

    protected $fillable = ['nome'];

    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'prioridade_id');
    }
}