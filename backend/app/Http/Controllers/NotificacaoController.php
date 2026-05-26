<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificacao;

class NotificacaoController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();
        $notificacoes = Notificacao::where('usuario_id', $usuario->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($notificacoes);
    }

    public function ler(Request $request, $id)
    {
        $usuario = $request->user();
        $notificacao = Notificacao::where('usuario_id', $usuario->id)
            ->where('id', $id)
            ->firstOrFail();

        $notificacao->update(['lida' => true]);

        return response()->json(['message' => 'Notificação marcada como lida']);
    }
    
    public function lerTodas(Request $request)
    {
        $usuario = $request->user();
        Notificacao::where('usuario_id', $usuario->id)
            ->where('lida', false)
            ->update(['lida' => true]);

        return response()->json(['message' => 'Todas as notificações marcadas como lidas']);
    }
}
