<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'core.status'; 
    // public $timestamps = false;

    protected $fillable = ['nome'];

    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'status_id');
    }
}