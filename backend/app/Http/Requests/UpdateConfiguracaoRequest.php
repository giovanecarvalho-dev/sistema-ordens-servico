<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConfiguracaoRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'sla_muito_alta' => 'required|integer|min:1',
            'sla_alta'       => 'required|integer|min:1',
            'sla_media'      => 'required|integer|min:1',
            'sla_baixa'      => 'required|integer|min:1',
            'nome_sistema'   => 'nullable|string|max:100',
        ];
    }
}
