<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Importação da classe Rule para validação avançada (Estudar essa classe para entender melhor as validações personalizadas)
use App\Models\Status;
use App\Models\Categoria;
use App\Models\Urgencia;
use App\Models\Prioridade;

class OrdemServicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'        => 'required|string|max:100',
            'descricao'     => 'required|string|max:200',
            'localizacao'   => 'nullable|string|max:120',
            'motivo_pausa'  => 'sometimes|nullable|string|max:150',
            'solucao'       => 'sometimes|nullable|string|max:500',
            'anexo'         => 'sometimes|nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', //5mb, é pq o laravel usa kb
            
            // Validação das strings usando a classe Rule (Evita o bug do schema "core")
            'categoria'     => ['required', 'string', Rule::exists(Categoria::class, 'nome')],
            'status'        => ['sometimes', 'string', Rule::exists(Status::class, 'nome')],
            'urgencia'      => ['sometimes', 'nullable', 'string', Rule::exists(Urgencia::class, 'nome')],
            'prioridade'    => ['sometimes', 'nullable', 'string', Rule::exists(Prioridade::class, 'nome')],
            
            // Chaves Estrangeiras de Usuários (Avisando explicitamente que a conexão é pgsql)
            'usuario_id'    => 'sometimes|nullable|exists:pgsql.gestoes.usuarios,id',
            'tecnico_id'    => 'sometimes|nullable|exists:pgsql.gestoes.usuarios,id',

            // Validação dos IDs convertidos internamente usando a classe Rule
            'status_id'     => ['sometimes', 'nullable', 'integer', Rule::exists(Status::class, 'id')],
            'categoria_id'  => ['required', 'integer', Rule::exists(Categoria::class, 'id')],
            'urgencia_id'   => ['required', 'integer', Rule::exists(Urgencia::class, 'id')],
            'prioridade_id' => ['required', 'integer', Rule::exists(Prioridade::class, 'id')],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'status_id'     => $this->resolveId(Status::class, $this->status),
            'categoria_id'  => $this->resolveId(Categoria::class, $this->categoria),
        ];

        if ($this->filled('urgencia')) {
            $merge['urgencia_id'] = $this->resolveId(Urgencia::class, $this->urgencia);
        }

        if ($this->filled('prioridade')) {
            $merge['prioridade_id'] = $this->resolveId(Prioridade::class, $this->prioridade);
        }

        $this->merge($merge);
    }

    private function resolveId(string $model, ?string $value): ?int
    {
        return $value ? $model::where('nome', $value)->value('id') : null;
    }
}