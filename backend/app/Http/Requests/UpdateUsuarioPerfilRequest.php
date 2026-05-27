<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Auth\Access\AuthorizationException;

class UpdateUsuarioPerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()->id != $this->route('id')) {
            throw new AuthorizationException('Você não tem permissão para editar este perfil.');
        }
        return true;
    }

    public function rules(): array
    {
        return [
            'nome'       => 'required|string|max:80',
            'email'      => 'required|email|unique:usuarios,email,' . $this->route('id'),
            'senha_atual'=> 'nullable|string',
            'nova_senha' => 'nullable|string|min:4',
        ];
    }
}
