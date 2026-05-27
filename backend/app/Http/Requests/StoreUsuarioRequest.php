<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome'  => 'required|string|max:80',
            'cpf'   => 'required|string|size:11|regex:/^[0-9]+$/|unique:usuarios,cpf',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:4',
        ];
    }

    public function messages(): array
    {
        return [
            'cpf.unique'   => 'Este CPF já está cadastrado.',
            'email.unique' => 'Este e-mail já está em uso.',
            'cpf.size'     => 'O CPF deve conter exatamente 11 dígitos.',
        ];
    }
}