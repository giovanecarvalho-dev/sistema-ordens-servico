<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrdemServico;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA; 

class DashboardController extends Controller
{
    #[OA\Get(
        path: "/api/dashboard/estatisticas",
        tags: ["Dashboard"],
        summary: "Retorna dados estatísticos do sistema",
        description: "Acesso restrito: Apenas usuários com cargo de Admin podem visualizar as estatísticas.",
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Estatísticas geradas com sucesso"),
            new OA\Response(response: 403, description: "Acesso negado")
        ]
    )]
    public function estatisticas(Request $request)
    {
        $usuarioLogado = $request->user();
        if (!$usuarioLogado || $usuarioLogado->cargo !== 'Admin') {
            return response()->json([
                'error' => 'Acesso negado',
                'message' => 'Apenas administradores podem visualizar as estatísticas do sistema.',
                'code' => 403
            ], 403);
        }

        // Filtra os totais por Ativo e Inativo
        $totalAtivos = OrdemServico::where('ativo', true)->count();
        $excluidos = OrdemServico::where('ativo', false)->count(); 
        
        $resolvidos = OrdemServico::where('ativo', true)->where('status', 'Fechado')->count();
        $abertos = OrdemServico::where('ativo', true)->whereIn('status', ['Novo', 'Em andamento'])->count();
        
        $semTecnico = OrdemServico::where('ativo', true)
                                  ->whereNull('tecnico_id')
                                  ->where('status', '!=', 'Fechado')
                                  ->count();

        $topTecnicos = OrdemServico::select('tecnico_id', DB::raw('count(*) as resolvidos'))
            ->with('tecnico:id,nome') 
            ->where('ativo', true)
            ->where('status', 'Fechado')
            ->whereNotNull('tecnico_id')
            ->groupBy('tecnico_id')
            ->orderBy('resolvidos', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->tecnico_id,
                    'nome' => $item->tecnico ? $item->tecnico->nome : 'Desconhecido',
                    'resolvidos' => $item->resolvidos
                ];
            });

        $categorias = OrdemServico::select(
                'categoria', 
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN status != \'Fechado\' THEN 1 ELSE 0 END) as abertos')
            )
            ->where('ativo', true)
            ->whereNotNull('categoria')
            ->groupBy('categoria')
            ->get();

        return response()->json([
            'data' => [
                'geral' => [
                    'total' => $totalAtivos,
                    'excluidos' => $excluidos,
                    'resolvidos' => $resolvidos,
                    'abertos' => $abertos,
                    'sem_tecnico' => $semTecnico,
                    'perc_resolvidos' => $totalAtivos > 0 ? round(($resolvidos / $totalAtivos) * 100, 2) : 0,
                ],
                'top_tecnicos' => $topTecnicos,
                'categorias' => $categorias
            ],
            'message' => 'Estatísticas recuperadas com sucesso'
        ]);
    }
}