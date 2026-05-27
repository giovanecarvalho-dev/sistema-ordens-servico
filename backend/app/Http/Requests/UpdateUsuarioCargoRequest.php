<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioCargoRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'cargo' => 'required|string|in:Usuario,Tecnico,Admin',
        ];
    }
}
