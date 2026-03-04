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
        // Ordenando pela nova coluna em português que está no seu DBeaver
        return OrdemServico::with('usuario')
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
                required: ["titulo","descricao","usuario_id","prioridade","urgencia"],
                properties: [
                    new OA\Property(property: "titulo", type: "string", example: "Troca de toner"),
                    new OA\Property(property: "descricao", type: "string", example: "Impressora do RH sem tinta"),
                    new OA\Property(property: "usuario_id", type: "integer", example: 1),
                    new OA\Property(property: "prioridade", type: "string", example: "Média"),
                    new OA\Property(property: "urgencia", type: "string", example: "Alta"),
                    new OA\Property(property: "localizacao", type: "string", example: "Bloco A - Sala 10")
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
            'titulo' => 'required|string',
            'descricao' => 'required|string',
            'usuario_id' => 'required|exists:usuarios,id',
            'prioridade' => 'required|string',
            'urgencia' => 'required|string',
        ]);

        $novaOrdem = OrdemServico::create($request->all());

        return response()->json($novaOrdem->load('usuario'), 201);
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
        return OrdemServico::with('usuario')->findOrFail($id);
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
        $item->update($request->all());

        return response()->json($item->load('usuario'), 200);
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