<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginUsuarioRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'cpf'   => 'required|string|size:11|regex:/^[0-9]+$/',
            'senha' => 'required|string|min:4',
        ];
    }
}
