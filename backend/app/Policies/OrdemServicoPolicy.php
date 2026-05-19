<?php

namespace App\Policies;

use App\Models\OrdemServico;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrdemServicoPolicy
{
    use HandlesAuthorization;

    /**
     * Intercepta todas as checagens. 
     * Se for Admin, o acesso é garantido instantaneamente.
     */
    public function before(User $user, $ability)
    {
        if ($user->cargo?->nome === 'Admin') {
            return true;
        }
    }

    /**
     * Determina se o usuário pode ver a listagem (index).
     */
    public function viewAny(User $user): bool
    {
        return $user->temPermissao('os.visualizar_tudo') || 
               $user->temPermissao('os.visualizar_propria');
    }

    /**
     * Determina se o usuário pode visualizar uma OS específica.
     */
    public function view(User $user, OrdemServico $os): bool
    {
        // Pode ver se tiver permissão geral
        if ($user->temPermissao('os.visualizar_tudo')) {
            return true;
        }

        // Ou se for o dono (solicitante) ou o técnico atribuído
        return $user->id === $os->usuario_id || $user->id === $os->tecnico_id;
    }

    /**
     * Determina se o usuário pode criar uma OS.
     */
    public function create(User $user): bool
    {
        return $user->temPermissao('os.criar');
    }

    /**
     * Determina se o usuário pode editar uma OS específica.
     */
    public function update(User $user, OrdemServico $os): bool
    {
        if (!$user->temPermissao('os.editar')) {
            return false;
        }

        // Regra para Técnicos: só editam o que está atribuído a eles
        if ($user->cargo?->nome === 'Tecnico') {
            return $user->id === $os->tecnico_id;
        }

        return true;
    }

    /**
     * Determina se o usuário pode deletar uma OS.
     */
    public function delete(User $user, OrdemServico $os): bool
    {
        return $user->temPermissao('os.deletar');
    }
}