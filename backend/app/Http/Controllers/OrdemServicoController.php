<?php

namespace App\Http\Controllers;

use App\Models\OrdemServico;
use App\Models\Status;
use App\Models\Urgencia;
use App\Models\Prioridade;
use App\Http\Requests\OrdemServicoRequest;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "OrdensServico", description: "Endpoints para gerenciamento de ordens de serviço")]
class OrdemServicoController extends Controller
{
   #[OA\Get(
        path: "/api/ordens",
        tags: ["Ordens de Servico"],
        summary: "Lista todas as ordens de serviço com filtros",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "status",
                in: "query",
                description: "Filtrar por nome do status",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "categoria",
                in: "query",
                description: "Filtrar por nome da categoria",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "busca",
                in: "query",
                description: "Busca por título ou descrição",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "ID",
                in: "query",
                description: "Filtrar por ID numérico ou código de rastreio (UUID)",
                required: false,
                schema: new OA\Schema(type: "string") 
            )
        ],
        responses: [
            new OA\Response(
                response: 200, 
                description: "Lista de ordens recuperada com sucesso"
            ),
            new OA\Response(
                response: 401, 
                description: "Não autenticado"
            ),
            new OA\Response(
                response: 404, 
                description: "Ordens de serviço não encontradas"
            )
        ]
    )]
   public function index(\Illuminate\Http\Request $request)
    {
        $query = OrdemServico::with([
            'usuario', 'tecnico',
            'status', 'categoria',
            'urgencia', 'prioridade'
        ]);

        $statusAtivo = $request->has('ativo')
            ? filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN)
            : true;

        $query->where('ativo', $statusAtivo);

        // Captura tanto o 'id' minúsculo quanto o 'ID' maiúsculo do Swagger
        $buscaId = $request->input('id') ?? $request->input('ID');

       // Se o front mandar o ID, verifica o formato antes de buscar
        if (!empty($buscaId)) {
            $query->where(function ($q) use ($buscaId) {
                // Se o que foi digitado tiver formato de UUID (ex: 123e4567-e89b-12d3-a456-426614174000)
                if (\Illuminate\Support\Str::isUuid($buscaId)) {
                    $q->where('codigo_rastreio', $buscaId);
                } 
                // Se não for UUID, assume que é uma busca por ID numérico (e previne quebra se digitarem letras)
                else {
                    $q->where('id', is_numeric($buscaId) ? $buscaId : 0);
                }
            }); //tava dando erro porque ele tava verificando o ID como se fosse UUID na query, aí dava erro de formato. Agora ele só tenta buscar por UUID se o formato for realmente de UUID, senão ele busca por ID numérico normalmente.
        }

        // Filtros por relacionamentos
        if ($request->filled('status')) {
            $query->whereHas('status', fn($q) =>
                $q->where('nome', $request->status)
            );
        }

        if ($request->filled('categoria')) {
            $query->whereHas('categoria', fn($q) =>
                $q->where('nome', $request->categoria)
            );
        }

        if ($request->filled('urgencia')) {
            $query->whereHas('urgencia', fn($q) =>
                $q->where('nome', $request->urgencia)
            );
        }

        if ($request->filled('prioridade')) {
            $query->whereHas('prioridade', fn($q) =>
                $q->where('nome', $request->prioridade)
            );
        }

        $user = $request->user();
        if ($user->cargo?->nome === 'Tecnico') {
            // Técnico SÓ VÊ o que está atribuído a ele, ignorando o filtro livre
            $query->where('tecnico_id', $user->id);
        } else {
            // Admin ou outro cargo com permissão total pode filtrar livremente
            if ($request->filled('tecnico_id')) {
                $query->where('tecnico_id', $request->tecnico_id);
            }
        }

        // GIN INDEX: Busca otimizada usando Trigramas no Postgres
        if ($request->filled('busca')) {
            $query->where(function ($q) use ($request) {
                $q->where('titulo', 'ilike', '%' . $request->busca . '%')
                  ->orWhere('descricao', 'ilike', '%' . $request->busca . '%');
            });
        }

        // Ordenar pela chave de partição (criado_em) e paginar
        $perPage = min((int) $request->input('per_page', 15), 100);
        return response()->json(
            $query->orderBy('criado_em', 'desc')->paginate($perPage),
            200
        );
    }

    #[OA\Post(
        path: "/api/ordens",
        tags: ["Ordens de Servico"],
        summary: "Cria uma nova ordem de serviço",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "titulo", type: "string", example: "Estagiário esqueceu a senha"),
                    new OA\Property(property: "descricao", type: "string", example: "O estagiário João da Silva esqueceu a senha do sistema e precisa de ajuda para resetar o acesso."),
                    new OA\Property(property: "localizacao", type: "string", example: "Bloco A, Sala 102"),
                    new OA\Property(property: "categoria", type: "string", example: "Acesso"),
                    new OA\Property(property: "urgencia", type: "string", example: "Alta"),
                    new OA\Property(property: "prioridade", type: "string", example: "Muito Alta")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Ordem de serviço criada com sucesso"),
            new OA\Response(response: 422, description: "Erro de validação nos dados enviados"),
            new OA\Response(response: 401, description: "Não autenticado")
        ]
    )]
    public function store(OrdemServicoRequest $request)
    {


        $usuarioLogado = $request->user();

        $idDonoDoChamado = $usuarioLogado->id;

        $cargoId = $usuarioLogado->cargo_id;
        
        $cargosPrivilegiados = [1, 2]; 

        if (in_array($cargoId, $cargosPrivilegiados) && $request->filled('usuario_id')) {
            $idDonoDoChamado = $request->usuario_id;
        }

        $statusNovoId = Status::where('nome', 'Novo')->value('id');

        $urgenciaBaixaId = Urgencia::where('nome', 'Baixa')->value('id');
        $prioridadeBaixaId = Prioridade::where('nome', 'Baixa')->value('id');

        $caminhoAnexo = null;
        if ($request->hasFile('anexo')) {
            $caminhoAnexo = $request->file('anexo')->store('anexos', 'public');
        }

        $novaOrdem = OrdemServico::create([
            'titulo'        => $request->titulo,
            'descricao'     => $request->descricao,
            'usuario_id'    => $idDonoDoChamado,
            'categoria_id'  => $request->categoria_id,
            'localizacao'   => $request->localizacao,
            'status_id'     => $request->status_id ?? $statusNovoId,
            'urgencia_id'   => $request->urgencia_id ?? $urgenciaBaixaId,
            'prioridade_id' => $request->prioridade_id ?? $prioridadeBaixaId,
            'anexo'         => $caminhoAnexo,
            'ativo'         => true,
        ]);

        return response()->json(
            $novaOrdem->load(['usuario', 'tecnico', 'status', 'categoria', 'urgencia', 'prioridade']), //.
            201
        );
    }

   #[OA\Get(
        path: "/api/ordens/{id}",
        tags: ["Ordens de Servico"],
        summary: "Exibe detalhes de uma ordem de serviço específica",
        description: "Busca uma Ordem de Serviço pelo ID numérico ou pelo Código de Rastreio (UUID)",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID numérico ou Código de Rastreio (UUID)",
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Dados da ordem de serviço"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 404, description: "Ordem de serviço não encontrada")
        ]
    )]
    public function show($id)
    {
        $query = OrdemServico::with([
            'usuario', 'tecnico',
            'status', 'categoria',
            'urgencia', 'prioridade'
        ]);

        // Verifica se o que veio na URL é um UUID válido
        if (\Illuminate\Support\Str::isUuid($id)) { 
            $ordem = $query->where('codigo_rastreio', $id)->first();
        } 
        // Se não for UUID, tenta buscar pelo ID numérico
        else {
            $ordem = $query->where('id', is_numeric($id) ? $id : 0)->first();
        }

        if (!$ordem) {
            return response()->json([
                'message' => 'Ordem de serviço não encontrada'
            ], 404);
        }

        \Illuminate\Support\Facades\Gate::authorize('view', $ordem);

        return response()->json($ordem, 200);
    }

    #[OA\Get(
        path: "/api/ordens/{id}/anexo",
        tags: ["Ordens de Servico"],
        summary: "Faz o download do anexo da ordem de serviço",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Arquivo em anexo"),
            new OA\Response(response: 404, description: "Ordem de serviço ou anexo não encontrado")
        ]
    )]
    public function downloadAnexo($id)
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            $item = OrdemServico::where('codigo_rastreio', $id)->firstOrFail();
        } else {
            $item = OrdemServico::where('id', is_numeric($id) ? $id : 0)->firstOrFail();
        }

        if (!$item->anexo) {
            return response()->json(['message' => 'Nenhum anexo encontrado'], 404);
        }

        if (!Storage::disk('public')->exists($item->anexo)) {
            return response()->json(['message' => 'Arquivo não encontrado no servidor'], 404);
        }

        return Storage::disk('public')->download($item->anexo);
    }
    #[OA\Put(
        path: "/api/ordens/{id}",
        tags: ["Ordens de Servico"],
        summary: "Atualiza uma ordem de serviço",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Ordem de serviço atualizada"),
            new OA\Response(response: 403, description: "Acesso negado"),
            new OA\Response(response: 404, description: "Ordem de serviço não encontrada")
        ]
    )]
    public function update(OrdemServicoRequest $request, $id)
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            $item = OrdemServico::where('codigo_rastreio', $id)->firstOrFail();
        } else {
            $item = OrdemServico::where('id', is_numeric($id) ? $id : 0)->firstOrFail();
        }

        \Illuminate\Support\Facades\Gate::authorize('update', $item);

        $dados = $request->only([
            'status_id',
            'urgencia_id',
            'prioridade_id',
            'tecnico_id',
            'motivo_pausa',
            'solucao'
        ]);

        // Lógica de pausa
        $statusAntigo = $item->status?->nome;

        $statusNovo = $request->status
            ?? $item->status?->nome;

        $estadosPausa = ['Pausado', 'Aguardando Peça']; 

        if (in_array($statusNovo, $estadosPausa)) {
            if (!in_array($statusAntigo, $estadosPausa)) {
                $dados['pausado_em'] = now();
            }
        } else {
            if (in_array($statusAntigo, $estadosPausa) && $item->pausado_em) {
                $minutos = now()->diffInMinutes($item->pausado_em);

                $dados['tempo_pausado_minutos'] =
                    ($item->tempo_pausado_minutos ?? 0) + $minutos;

                $dados['pausado_em'] = null;
                $dados['motivo_pausa'] = null;
            }  
        }

        $item->update($dados);

        return response()->json(
            $item->load(['usuario', 'tecnico', 'status', 'categoria', 'urgencia', 'prioridade']), //alterar pelo ID do Banco de dados
            200
        );
    }

    #[OA\Delete(
        path: "/api/ordens/{id}",
        tags: ["Ordens de Servico"],
        summary: "Remove (desativa) uma ordem de serviço",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Ordem de serviço removida"),
            new OA\Response(response: 403, description: "Acesso negado")
        ]
    )]
    public function destroy($id)
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            $item = OrdemServico::where('codigo_rastreio', $id)->firstOrFail();
        } else {
            $item = OrdemServico::where('id', is_numeric($id) ? $id : 0)->firstOrFail();
        }

        \Illuminate\Support\Facades\Gate::authorize('delete', $item);
            
        $item->update(['ativo' => false]);

        return response()->json([
            'message' => 'Enviado para a lixeira com sucesso'
        ], 200);
    }
}