<?php

namespace App\Http\Controllers;

use App\Models\OrdemServico;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "OrdensServico", description: "Endpoints para gerenciamento de ordens de serviço")]
class OrdemServicoController extends Controller
{
    #[OA\Get(
        path: "/api/ordens",
        tags: ["OrdensServico"],
        summary: "Lista todas as ordens de serviço",
        responses: [new OA\Response(response: 200, description: "Lista recuperada com sucesso")]
    )]
    public function index()
    {
        return OrdemServico::with(['usuario', 'tecnico'])
            ->orderBy('criado_em', 'desc')
            ->get();
    }

    #[OA\Post(
        path: "/api/ordens",
        tags: ["OrdensServico"],
        summary: "Cria uma nova ordem de serviço",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["titulo", "descricao", "usuario_id", "localizacao"],
                properties: [
                    new OA\Property(property: "titulo", type: "string", example: "Troca de toner"),
                    new OA\Property(property: "descricao", type: "string", example: "Impressora do RH sem tinta"),
                    new OA\Property(property: "usuario_id", type: "integer", example: 1),
                    new OA\Property(property: "categoria", type: "string", example: "Rede"),
                    new OA\Property(property: "localizacao", type: "string", example: "Bloco A - Sala 10"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Ordem criada com sucesso"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'titulo'      => 'required|string|max:100',
            'descricao'   => 'required|string|max:200',
            'usuario_id'  => 'required|exists:usuarios,id',
            'categoria'   => 'nullable|string|in:Rede,Infraestrutura,Acesso',
            'localizacao' => 'required|string|max:120',
        ]);

        $novaOrdem = OrdemServico::create([
            'titulo'      => $request->titulo,
            'descricao'   => $request->descricao,
            'usuario_id'  => $request->usuario_id,
            'categoria'   => $request->categoria,
            'localizacao' => $request->localizacao,
            'status'      => 'Novo',
        ]);

        return response()->json($novaOrdem->load(['usuario', 'tecnico']), 201);
    }

    #[OA\Get(
        path: "/api/ordens/{id}",
        tags: ["OrdensServico"],
        summary: "Mostra detalhes de uma ordem",
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Ordem encontrada"),
            new OA\Response(response: 404, description: "Ordem não encontrada")
        ]
    )]
    public function show($id)
    {
        return OrdemServico::with(['usuario', 'tecnico'])->findOrFail($id);
    }

    #[OA\Put(
        path: "/api/ordens/{id}",
        tags: ["OrdensServico"],
        summary: "Atualiza uma ordem",
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Ordem atualizada")]
    )]
    public function update(Request $request, $id)
    {
        $item = OrdemServico::findOrFail($id);

        $item->update([
            'status'     => $request->status     ?? $item->status,
            'urgencia'   => $request->urgencia   ?? $item->urgencia,
            'prioridade' => $request->prioridade ?? $item->prioridade,
            'solucao'    => $request->solucao    ?? $item->solucao,
            'tecnico_id' => $request->tecnico_id ?? $item->tecnico_id,
        ]);

        return response()->json($item->load(['usuario', 'tecnico']), 200);
    }

    #[OA\Delete(
        path: "/api/ordens/{id}",
        tags: ["OrdensServico"],
        summary: "Remove uma ordem",
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Ordem removida")]
    )]
    public function destroy($id)
    {
        OrdemServico::destroy($id);
        return response()->json(['message' => 'Excluído com sucesso'], 200);
    }
}