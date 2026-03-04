<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'cpf',
        'senha',
        'cargo',
    ];

    protected $hidden = [
        'senha',
        'remember_token',
    ];

    // Avisa o Laravel que os nomes das colunas de data mudaram no DBeaver
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    // O Laravel procura 'password' por padrão, aqui dizemos para usar 'senha'
    public function getAuthPassword()
    {
        return $this->senha;
    }

    protected function casts(): array
    {
        return [
            'senha' => 'hashed',
        ];
    }
}