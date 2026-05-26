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
    $regrasComuns = [
        'urgencia'      => ['sometimes', 'nullable', 'string', Rule::exists(Urgencia::class, 'nome')],
        'prioridade'    => ['sometimes', 'nullable', 'string', Rule::exists(Prioridade::class, 'nome')],
        'urgencia_id'   => ['sometimes', 'nullable', 'integer', Rule::exists(Urgencia::class, 'id')],
        'prioridade_id' => ['sometimes', 'nullable', 'integer', Rule::exists(Prioridade::class, 'id')],
    ];

    // POST = criação → campos obrigatórios
    if ($this->isMethod('post')) {
        return array_merge($regrasComuns, [
            'titulo'       => ['required', 'string', 'max:120'],
            'descricao'    => ['required', 'string'],
            'localizacao'  => ['required', 'string', 'max:80'],
            'categoria'    => ['sometimes', 'nullable', 'string', Rule::exists(Categoria::class, 'nome')],
            'categoria_id' => ['sometimes', 'nullable', 'integer', Rule::exists(Categoria::class, 'id')],
            'status'       => ['sometimes', 'nullable', 'string', Rule::exists(Status::class, 'nome')],
            'status_id'    => ['sometimes', 'nullable', 'integer', Rule::exists(Status::class, 'id')],
            'anexo'        => ['sometimes', 'nullable', 'file', 'max:10240'],
        ]);
    }

    // PUT = edição → tudo opcional
    return array_merge($regrasComuns, [
        'status'        => ['sometimes', 'nullable', 'string', Rule::exists(Status::class, 'nome')],
        'status_id'     => ['sometimes', 'nullable', 'integer', Rule::exists(Status::class, 'id')],
        'categoria'     => ['sometimes', 'nullable', 'string', Rule::exists(Categoria::class, 'nome')],
        'categoria_id'  => ['sometimes', 'nullable', 'integer', Rule::exists(Categoria::class, 'id')],
        'tecnico_id'    => ['sometimes', 'nullable', 'integer'],
        'motivo_pausa'  => ['sometimes', 'nullable', 'string', 'max:150'],
        'solucao'       => ['sometimes', 'nullable', 'string'],
    ]);
}

    protected function prepareForValidation(): void
{
    $merge = [];

    if ($this->filled('status')) {
        $merge['status_id'] = $this->resolveId(Status::class, $this->status);
    }

    if ($this->filled('categoria')) {
        $merge['categoria_id'] = $this->resolveId(Categoria::class, $this->categoria);
    }

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