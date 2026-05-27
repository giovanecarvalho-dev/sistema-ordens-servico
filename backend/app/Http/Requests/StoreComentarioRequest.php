<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\OrdemServico;
use Illuminate\Auth\Access\AuthorizationException;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $id = $this->route('id');
        $ordem = \Illuminate\Support\Str::isUuid($id) 
            ? OrdemServico::where('codigo_rastreio', $id)->first() 
            : OrdemServico::find($id);

        if (!$ordem) return true; // Deixa o controller soltar o 404

        $user = $this->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        if ($userCargo !== 'Admin' && $ordem->usuario_id !== $user->id && $ordem->tecnico_id !== $user->id) {
            throw new AuthorizationException('Você não tem permissão para comentar nesta ordem de serviço.');
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'conteudo' => 'required|string|max:1000'
        ];
    }
}
