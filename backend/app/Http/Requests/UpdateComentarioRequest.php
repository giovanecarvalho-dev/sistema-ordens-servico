<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\OrdemServicoComentario;
use Illuminate\Auth\Access\AuthorizationException;

class UpdateComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $comentarioId = $this->route('comentarioId');
        $comentario = OrdemServicoComentario::find($comentarioId);
        
        if (!$comentario) return true; // Controller cuida do 404

        $user = $this->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        if ($userCargo !== 'Admin' && $comentario->usuario_id !== $user->id) {
            throw new AuthorizationException('Você só pode editar seus próprios comentários.');
        }

        if ($userCargo !== 'Admin' && $comentario->criado_em && $comentario->criado_em->diffInMinutes(now()) > 5) {
            throw new AuthorizationException('O tempo limite de 5 minutos para editar mensagens já expirou.');
        }

        return true;
    }

    public function rules(): array
    {
        return ['conteudo' => 'required|string|max:1000'];
    }
}
