<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Garantia de acesso total ao Administrador.
     */
    public function before(User $user, $ability)
    {
        if ($user->cargo?->nome === 'Admin') {
            return true;
        }
    }

    /**
     * Determina se o usuário pode visualizar detalhes de outro usuário.
     */
    public function view(User $user, User $model): bool
    {
        // Permite visualização do próprio perfil ou se possuir permissão específica.
        return $user->id === $model->id || $user->temPermissao('usuarios.visualizar');
    }

    /**
     * Determina se o usuário pode atualizar dados de um usuário.
     */
    public function update(User $user, User $model): bool
    {
        // Permite edição do próprio perfil ou se possuir permissão específica.
        return $user->id === $model->id || $user->temPermissao('usuarios.editar');
    }

    /**
     * Determina se o usuário pode remover um registro de usuário.
     */
    public function delete(User $user, User $model): bool
    {
        // Acesso negado para usuários comuns (Administradores tratados no 'before').
        return false;
    }
}