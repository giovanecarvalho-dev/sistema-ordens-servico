<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificacao;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Notificacoes", description: "Gerenciamento das notificações de sistema")]
class NotificacaoController extends Controller
{
    #[OA\Get(
        path: "/api/notificacoes",
        summary: "Lista Notificações",
        description: "Retorna todas as notificações do usuário logado, ordenadas das mais recentes para as mais antigas.",
        tags: ["Notificacoes"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Lista de notificações retornada com sucesso"),
            new OA\Response(response: 401, description: "Não autenticado")
        ]
    )]
    public function index(Request $request)
    {
        $usuario = $request->user();
        $notificacoes = Notificacao::where('usuario_id', $usuario->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($notificacoes);
    }

    #[OA\Put(
        path: "/api/notificacoes/{id}/ler",
        summary: "Marcar Notificação como Lida",
        description: "Marca uma notificação específica do usuário logado como lida.",
        tags: ["Notificacoes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID da notificação", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Notificação marcada como lida"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 404, description: "Notificação não encontrada ou não pertence ao usuário")
        ]
    )]
    public function ler(Request $request, $id)
    {
        $usuario = $request->user();
        $notificacao = Notificacao::where('usuario_id', $usuario->id)
            ->where('id', $id)
            ->firstOrFail();

        $notificacao->update(['lida' => true]);

        return response()->json(['message' => 'Notificação marcada como lida']);
    }
    
    #[OA\Put(
        path: "/api/notificacoes/ler-todas",
        summary: "Marcar Todas as Notificações como Lidas",
        description: "Marca todas as notificações não lidas do usuário logado como lidas.",
        tags: ["Notificacoes"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Todas as notificações marcadas como lidas"),
            new OA\Response(response: 401, description: "Não autenticado")
        ]
    )]
    public function lerTodas(Request $request)
    {
        $usuario = $request->user();
        Notificacao::where('usuario_id', $usuario->id)
            ->where('lida', false)
            ->update(['lida' => true]);

        return response()->json(['message' => 'Todas as notificações marcadas como lidas']);
    }
}
