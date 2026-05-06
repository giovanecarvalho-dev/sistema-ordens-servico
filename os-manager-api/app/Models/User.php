<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;


    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'cpf',
        'email',
        'senha',
        'cargo_id', 
        'ativo',
    ];

    protected $hidden = [
        'senha',
        'remember_token',
    ];

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    public function getAuthPassword()
    {
        return $this->senha;
    }

    protected function casts(): array
    {
        return [
            'senha' => 'hashed',
            'ativo' => 'boolean',
        ];
    }

    // ==========================================
    // RELACIONAMENTOS COM ORDEM DE SERVIÇO
    // ==========================================
    public function ordensSolicitadas()
    {
        return $this->hasMany(OrdemServico::class, 'usuario_id')
                    ->orderBy('criado_em', 'desc');
    }

    
    public function ordensTecnico()
    {
        return $this->hasMany(OrdemServico::class, 'tecnico_id')
                    ->orderBy('criado_em', 'desc');
    }

    // ==========================================
    // GESTÃO DE ACESSOS
    // ==========================================

    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'cargo_id');
    }

    public function permissoesEspecificas()
    {
        return $this->belongsToMany(
            Permissao::class, 
            'usuario_permissoes',
            'usuario_id', 
            'permissao_id'
        );
    }

    /**
     * Verifica permissão com hierarquia (Admin > Específica > Cargo)
     */
    public function temPermissao(string $nomePermissao): bool
    {
        // 1. Admin (ID 1)
        if ($this->cargo_id === 1) {
            return true;
        }

        // 2. Permissão Específica (Individual)
        if ($this->permissoesEspecificas()->where('nome', $nomePermissao)->exists()) {
            return true;
        }

        // 3. Permissão via Cargo
        return $this->cargo ? $this->cargo->permissoes()->where('nome', $nomePermissao)->exists() : false;
    }

    // ==========================================
    // MÉTODOS JWT
    // ==========================================

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'nome'  => $this->nome,
            'cargo' => $this->cargo?->nome
        ];
    }
}