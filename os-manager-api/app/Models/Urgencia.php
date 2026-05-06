<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Urgencia extends Model
{
    protected $table = 'urgencia'; 
    public $timestamps = false;

    protected $fillable = ['nome'];

    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'urgencia_id');
    }
}