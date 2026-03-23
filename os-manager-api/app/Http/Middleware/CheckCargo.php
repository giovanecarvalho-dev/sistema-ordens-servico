<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCargo
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$cargos)
{
    $usuario = $request->user();

    // Se o usuário não estiver logado ou o cargo dele não estiver na lista permitida
    if (!$usuario || !in_array($usuario->cargo, $cargos)) {
        return response()->json(['message' => 'Acesso negado. Cargo invalido pra essa operação.'], 403);
    }

    return $next($request);
}
}
