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
        summary: "Lista e filtra as ordens de serviço (Autenticado)",
        description: "Retorna a lista completa de OS com filtros avançados. O campo 'ativo' filtra entre chamados ativos e desativados.",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "query", description: "Buscar por ID específico", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "ativo", in: "query", description: "Filtrar por ativos/inativos", required: false, schema: new OA\Schema(type: "boolean", default: true)),
            new OA\Parameter(name: "busca", in: "query", description: "Busca por título ou descrição", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(
                name: "status", 
                in: "query", 
                description: "Selecionar Status", 
                required: false, 
                schema: new OA\Schema(type: "string", enum: ["Novo", "Em andamento", "Pausado", "Aguardando Peça", "Fechado"])
            ),
            new OA\Parameter(
                name: "categoria", 
                in: "query", 
                description: "Selecionar Categoria", 
                required: false, 
                schema: new OA\Schema(type: "string", enum: ["Rede", "Infraestrutura", "Acesso"])
            ),
            new OA\Parameter(
                name: "urgencia", 
                in: "query", 
                description: "Selecionar Urgência", 
                required: false, 
                schema: new OA\Schema(type: "string", enum: ["Baixa", "Média", "Alta", "Muito Alta"])
            ),
            new OA\Parameter(name: "tecnico_id", in: "query", description: "Filtrar por técnico responsável", required: false, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Lista paginada de OS")
        ]
    )]
    public function index(Request $request)
    {
        $query = OrdemServico::with(['usuario', 'tecnico']);

        // Mantendo o filtro de 'ativo' que já existia
        if ($request->has('ativo')) {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('id')) $query->where('id', $request->id);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('categoria')) $query->where('categoria', $request->categoria);
        if ($request->filled('urgencia')) $query->where('urgencia', $request->urgencia);
        if ($request->filled('tecnico_id')) $query->where('tecnico_id', $request->tecnico_id);
        
        if ($request->filled('busca')) {
            $query->where('titulo', 'ilike', '%' . $request->busca . '%');
        }

        return response()->json($query->orderBy('id', 'desc')->get(), 200);
    }

    #[OA\Post(
        path: "/api/ordens",
        tags: ["OrdensServico"],
        summary: "Cria uma nova ordem de serviço",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["titulo", "descricao", "localizacao"], 
                properties: [
                    new OA\Property(property: "titulo", type: "string", example: "Troca de toner"),
                    new OA\Property(property: "descricao", type: "string", example: "Impressora do RH sem tinta"),
                    new OA\Property(property: "categoria", type: "string", example: "Rede", enum: ["Rede", "Infraestrutura", "Acesso"]),
                    new OA\Property(property: "localizacao", type: "string", example: "Bloco A - Sala 10"),
                    new OA\Property(property: "usuario_id", type: "integer", description: "Opcional. Apenas Admins/Técnicos podem abrir em nome de outros.", example: 2),
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
        $usuarioLogado = $request->user();

        // Validação: Aceita o usuario_id opcionalmente, verificando se ele existe na tabela
        $request->validate([
            'titulo'      => 'required|string|max:100',
            'descricao'   => 'required|string|max:200',
            'categoria'   => 'nullable|string|in:Rede,Infraestrutura,Acesso',
            'localizacao' => 'required|string|max:120',
            'usuario_id'  => 'sometimes|nullable|exists:usuarios,id',
        ]);

        // REGRA DE SEGURANÇA E CONTROLE:
        $idDonoDoChamado = $usuarioLogado->id; // Por padrão, o dono é quem está logado

        // Se quem está logado for Admin ou Técnico E enviou um ID no formulário, alteramos o dono
        if (in_array($usuarioLogado->cargo, ['Admin', 'Tecnico']) && $request->filled('usuario_id')) {
            $idDonoDoChamado = $request->usuario_id;
        }

        $novaOrdem = OrdemServico::create([
            'titulo'      => $request->titulo,
            'descricao'   => $request->descricao,
            'usuario_id'  => $idDonoDoChamado, 
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
        summary: "Atualiza uma ordem (Com Cálculo Inteligente de SLA e Pausa)",
        description: "Atualiza a OS. Se o status mudar para 'Pausado', o sistema registra o início da pausa. Se sair da pausa, o sistema calcula os minutos em que ficou pausado, soma ao histórico da OS (para descontar do SLA) e limpa o motivo.",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "status", type: "string", example: "Pausado", enum: ["Novo", "Em andamento", "Pausado", "Aguardando Peça", "Fechado"]),
                    new OA\Property(property: "motivo_pausa", type: "string", maxLength: 150, example: "Aguardando peça do fornecedor", nullable: true),
                    new OA\Property(property: "urgencia", type: "string", example: "Alta", enum: ["Baixa", "Média", "Alta", "Muito Alta"]),
                    new OA\Property(property: "prioridade", type: "string", example: "Alta", enum: ["Baixa", "Média", "Alta", "Muito Alta"]),
                    new OA\Property(property: "tecnico_id", type: "integer", example: 2),
                    new OA\Property(property: "solucao", type: "string", example: "Peça trocada com sucesso", nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Ordem atualizada com sucesso"),
            new OA\Response(response: 404, description: "Ordem não encontrada"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function update(Request $request, $id)
    {
        $item = OrdemServico::findOrFail($id);

        $request->validate([
            'status'       => 'sometimes|string|in:Novo,Em andamento,Pausado,Aguardando Peça,Fechado',
            'motivo_pausa' => 'sometimes|nullable|string|max:150',
            'urgencia'     => 'sometimes|string|in:Baixa,Média,Alta,Muito Alta',
            'prioridade'   => 'sometimes|string|in:Baixa,Média,Alta,Muito Alta',
            'solucao'      => 'sometimes|nullable|string|max:500',
            'tecnico_id'   => 'sometimes|nullable|exists:usuarios,id',
        ]);

        $statusAntigo = $item->status;
        $statusNovo = $request->status ?? $item->status;
        $dados = $request->all();

        $estadosPausa = ['Pausado', 'Aguardando Peça'];

        
        if (in_array($statusNovo, $estadosPausa)) {
           
            if (!in_array($statusAntigo, $estadosPausa)) {
                $dados['pausado_em'] = now();
            }
        } else {
     
            if (in_array($statusAntigo, $estadosPausa) && $item->pausado_em) {
                // Calcula os minutos passados desde o início dessa pausa até agora
                $minutosDestaPausa = now()->diffInMinutes($item->pausado_em);
                

                $dados['tempo_pausado_minutos'] = ($item->tempo_pausado_minutos ?? 0) + $minutosDestaPausa;
                
                // Limpa os campos de controle, pois a pausa acabou
                $dados['pausado_em'] = null;
                $dados['motivo_pausa'] = null;
            }
        }

        $item->update($dados);

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