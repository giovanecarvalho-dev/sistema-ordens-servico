<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\OrdemServicoComentario;
use Illuminate\Auth\Access\AuthorizationException;

class DeleteComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $comentarioId = $this->route('comentarioId');
        $comentario = OrdemServicoComentario::find($comentarioId);
        
        if (!$comentario) return true; // Controller cuida do 404

        $user = $this->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');
        $tipoExclusao = $this->query('tipo', 'mim');

        if ($tipoExclusao === 'todos') {
            if ($userCargo !== 'Admin' && $comentario->usuario_id !== $user->id) {
                throw new AuthorizationException('Você não tem permissão para excluir este comentário para todos.');
            }
        }
        
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
