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
        summary: "Lista e filtra as ordens de serviço",
        description: "Acesso para Técnicos e Admins. Filtro por ID ou Status de Ativação.",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "query", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "ativo", in: "query", schema: new OA\Schema(type: "boolean"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Lista de OS encontrada"),
            new OA\Response(response: 403, description: "Acesso negado")
        ]
    )]
    public function index(Request $request)
    {
        $usuarioLogado = $request->user(); 
        if (!$usuarioLogado || !in_array($usuarioLogado->cargo, ['Tecnico', 'Admin'])) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $query = OrdemServico::with(['usuario', 'tecnico'])->orderBy('criado_em', 'desc');

        if ($request->has('id')) {
            $query->where('id', $request->query('id'));
        }

        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }
    
        return response()->json($query->get());
    }

    #[OA\Post(
        path: "/api/ordens",
        tags: ["OrdensServico"],
        summary: "Cria uma nova ordem de serviço",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["titulo", "descricao", "usuario_id", "localizacao"],
                properties: [
                    new OA\Property(property: "titulo", type: "string", example: "Troca de toner"),
                    new OA\Property(property: "descricao", type: "string", example: "Impressora do RH sem tinta"),
                    new OA\Property(property: "usuario_id", type: "integer", example: 1),
                    new OA\Property(property: "categoria", type: "string", example: "Rede", enum: ["Rede", "Infraestrutura", "Acesso"]),
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
        // Validação estrita para não quebrar o dashboard
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
            'ativo'       => true,
        ]);

        return response()->json($novaOrdem->load(['usuario', 'tecnico']), 201);
    }

    #[OA\Get(
        path: "/api/ordens/{id}",
        tags: ["OrdensServico"],
        summary: "Mostra detalhes de uma ordem",
        security: [["bearerAuth" => []]],
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
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "status", type: "string", example: "Pausado", enum: ["Novo", "Em andamento", "Pausado", "Aguardando Peça", "Fechado"]),
                    new OA\Property(property: "motivo_pausa", type: "string", example: "Aguardando chegada de um novo roteador", nullable: true),
                    new OA\Property(property: "urgencia", type: "string", example: "Alta", enum: ["Baixa", "Média", "Alta", "Muito Alta"]),
                    new OA\Property(property: "prioridade", type: "string", example: "Alta", enum: ["Baixa", "Média", "Alta", "Muito Alta"]),
                    new OA\Property(property: "tecnico_id", type: "integer", example: 2),
                    new OA\Property(property: "solucao", type: "string", example: "Problema resolvido"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Ordem atualizada"),
            new OA\Response(response: 404, description: "Ordem não encontrada"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function update(Request $request, $id)
    {
        $item = OrdemServico::findOrFail($id);

        // Validação estrita incluindo os novos status e o motivo
        $request->validate([
            'status'       => 'sometimes|string|in:Novo,Em andamento,Pausado,Aguardando Peça,Fechado',
            'motivo_pausa' => 'sometimes|nullable|string|max:255',
            'urgencia'     => 'sometimes|string|in:Baixa,Média,Alta,Muito Alta',
            'prioridade'   => 'sometimes|string|in:Baixa,Média,Alta,Muito Alta',
            'solucao'      => 'sometimes|nullable|string|max:500',
            'tecnico_id'   => 'sometimes|nullable|exists:usuarios,id',
        ]);

        // Descobre qual será o status e o motivo finais após essa requisição
        $statusNovo = $request->has('status') ? $request->status : $item->status;
        $motivoNovo = $request->has('motivo_pausa') ? $request->motivo_pausa : $item->motivo_pausa;

        // se o status nao for pausa, o campo motivo é limpado automaticamente
        if (!in_array($statusNovo, ['Pausado', 'Aguardando Peça'])) {
            $motivoNovo = null;
        }

        $item->update([
            'status'       => $statusNovo,
            'motivo_pausa' => $motivoNovo,
            'urgencia'     => $request->urgencia   ?? $item->urgencia,
            'prioridade'   => $request->prioridade ?? $item->prioridade,
            'solucao'      => $request->solucao    ?? $item->solucao,
            'tecnico_id'   => $request->has('tecnico_id') ? ($request->tecnico_id ?: null) : $item->tecnico_id,
        ]);

        return response()->json($item->load(['usuario', 'tecnico']), 200);
    }

    #[OA\Delete(
        path: "/api/ordens/{id}",
        tags: ["OrdensServico"],
        summary: "Remove uma ordem (Manda para lixeira)",
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Ordem removida"),
            new OA\Response(response: 404, description: "Ordem não encontrada")
        ]
    )]
    public function destroy($id)
    {
        $item = OrdemServico::findOrFail($id);
        $item->update(['ativo' => false]);
        return response()->json(['message' => 'Enviado para a lixeira com sucesso'], 200);
    }

    #[OA\Put(
        path: "/api/ordens/{id}/restaurar",
        tags: ["OrdensServico"],
        summary: "Restaura uma ordem inativa (Apenas Admin)",
        description: "Muda o campo ativo de false para true.",
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Ordem restaurada"),
            new OA\Response(response: 403, description: "Acesso negado"),
            new OA\Response(response: 404, description: "Ordem não encontrada")
        ]
    )]
    public function restaurar(Request $request, $id)
    {
        $usuarioLogado = $request->user();
        if (!$usuarioLogado || $usuarioLogado->cargo !== 'Admin') {
            return response()->json(['message' => 'Acesso negado. Apenas administradores.'], 403);
        }

        $item = OrdemServico::findOrFail($id);
        $item->update(['ativo' => true]);
        
        return response()->json(['message' => 'Ordem de serviço restaurada com sucesso!', 'data' => $item], 200);
    }
}