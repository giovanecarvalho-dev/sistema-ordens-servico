<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracao extends Model
{
    protected $table = 'configuracoes';
    protected $primaryKey = 'chave';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = ['chave', 'valor'];

    /**
     * Retorna o valor de uma chave ou o default se não existir.
     */
    public static function get(string $chave, mixed $default = null): mixed
    {
        return static::where('chave', $chave)->value('valor') ?? $default;
    }

    /**
     * Grava (upsert) uma chave/valor.
     */
    public static function set(string $chave, mixed $valor): void
    {
        static::updateOrCreate(
            ['chave' => $chave],
            ['valor' => (string) $valor]
        );
    }

    /**
     * Retorna todos os limites de SLA em horas como array.
     */
    public static function slaLimites(): array
    {
        $rows = static::whereIn('chave', [
            'sla_muito_alta',
            'sla_alta',
            'sla_media',
            'sla_baixa',
        ])->pluck('valor', 'chave');

        return [
            'Muito Alta' => (int) ($rows['sla_muito_alta'] ?? 2),
            'Alta'       => (int) ($rows['sla_alta']       ?? 4),
            'Média'      => (int) ($rows['sla_media']      ?? 8),
            'Baixa'      => (int) ($rows['sla_baixa']      ?? 24),
        ];
    }
}
