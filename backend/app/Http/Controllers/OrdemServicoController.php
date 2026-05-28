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
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        if ($userCargo === 'Tecnico') {
            // Técnico SÓ VÊ o que está atribuído a ele, ignorando o filtro livre
            $query->where('tecnico_id', $user->id);
        } elseif ($userCargo === 'Usuario') {
            // Cliente comum SÓ VÊ os chamados abertos por ele mesmo
            $query->where('usuario_id', $user->id);
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

        // Ordenar primeiro por chamados fixados e depois pela chave de partição (criado_em) e paginar
        $perPage = min((int) $request->input('per_page', 15), 100);
        return response()->json(
            $query->orderBy('fixada', 'desc')->orderBy('criado_em', 'desc')->paginate($perPage),
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
            'fixada'        => false,       
        ]);

        $novaOrdem->historicos()->create([
            'usuario_id' => $usuarioLogado->id,
            'acao'       => 'Criado',
            'descricao'  => 'Chamado aberto por ' . $usuarioLogado->nome,
            'criado_em'  => now()
        ]);

        return response()->json(
            $novaOrdem->load(['usuario', 'tecnico', 'status', 'categoria', 'urgencia', 'prioridade']), 
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
            'urgencia', 'prioridade',
            'historicos.usuario',
            'comentarios.usuario',
            'comentarios.parent.usuario'
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

        $user = request()->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        if ($ordem->relationLoaded('comentarios')) {
            // Filtra comentários excluídos para o usuário atual
            $comentariosFiltrados = $ordem->comentarios->filter(function($c) use ($user) {
                $excluidoPara = $c->excluido_para ?? [];
                return !in_array($user->id, $excluidoPara);
            })->values();

            // Adiciona flags de permissão calculadas pelo backend
            $comentariosFiltrados->each(function($c) use ($user, $userCargo) {
                $isAutor = $c->usuario_id === $user->id;
                $tempoExpirado = $c->criado_em ? $c->criado_em->diffInMinutes(now()) > 5 : true;

                $c->pode_editar = $isAutor && ($userCargo === 'Admin' || !$tempoExpirado);
                $c->pode_deletar = $isAutor || $userCargo === 'Admin';
            });

            $ordem->setRelation('comentarios', $comentariosFiltrados);
        }

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

        \Illuminate\Support\Facades\Gate::authorize('view', $item);

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
            $item = OrdemServico::where('codigo_rastreio', $id)->firstOrFail(); //uuid
        } else {
            $item = OrdemServico::where('id', is_numeric($id) ? $id : 0)->firstOrFail(); //id
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

        if ($request->hasFile('anexo')) {
            if ($item->anexo && Storage::disk('public')->exists($item->anexo)) {
                Storage::disk('public')->delete($item->anexo);
            }
            $dados['anexo'] = $request->file('anexo')->store('anexos', 'public');
        }

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

        $usuarioLogado = $request->user();
        
        $antigoStatus = $item->status?->nome;
        $antigoTecnico = $item->tecnico?->nome ?? 'Não atribuído';
        $antigoTecnicoId = $item->tecnico_id;
        $antigaUrgencia = $item->urgencia?->nome;
        $antigaPrioridade = $item->prioridade?->nome;

        $item->update($dados);

        // Recarrega as relações atualizadas
        $item->load(['status', 'tecnico', 'urgencia', 'prioridade']);

        if ($antigoTecnicoId != $item->tecnico_id && !empty($item->tecnico_id)) {
            \App\Models\Notificacao::create([
                'usuario_id' => $item->tecnico_id,
                'ordem_servico_id' => $item->id,
                'titulo' => 'Nova OS atribuída',
                'mensagem' => "Você foi atribuído à ordem de serviço #{$item->id}: '{$item->titulo}'",
                'lida' => false,
                'criado_em' => now()
            ]);
        }

        $alteracoes = [];
        if ($antigoStatus !== $item->status?->nome) {
            $alteracoes[] = "Status alterado de '{$antigoStatus}' para '{$item->status?->nome}'";
        }
        if ($antigoTecnico !== ($item->tecnico?->nome ?? 'Não atribuído')) {
            $alteracoes[] = "Técnico alterado de '{$antigoTecnico}' para '" . ($item->tecnico?->nome ?? 'Não atribuído') . "'";
        }
        if ($antigaUrgencia !== $item->urgencia?->nome) {
            $alteracoes[] = "Urgência alterada de '{$antigaUrgencia}' para '{$item->urgencia?->nome}'";
        }
        if ($antigaPrioridade !== $item->prioridade?->nome) {
            $alteracoes[] = "Prioridade alterada de '{$antigaPrioridade}' para '{$item->prioridade?->nome}'";
        }
        if ($request->filled('solucao')) {
            $alteracoes[] = "Solução adicionada/atualizada";
        }
        if ($request->hasFile('anexo')) {
            $alteracoes[] = "Novo anexo adicionado";
        }

        if (count($alteracoes) > 0) {
            $item->historicos()->create([
                'usuario_id' => $usuarioLogado->id,
                'acao'       => 'Atualizado',
                'descricao'  => 'Atualizações por ' . $usuarioLogado->nome . ': ' . implode(', ', $alteracoes),
                'criado_em'  => now()
            ]);
        }

        return response()->json(
            $item->load(['usuario', 'tecnico', 'status', 'categoria', 'urgencia', 'prioridade', 'historicos.usuario']),
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
            
        $item->historicos()->create([
            'usuario_id' => request()->user()->id,
            'acao'       => 'Excluído',
            'descricao'  => 'Chamado excluído logicamente por ' . request()->user()->nome,
            'criado_em'  => now()
        ]);

        return response()->json([
            'message' => 'Enviado para a lixeira com sucesso'
        ], 200);
    }

    public function categorias()
    {
        return response()->json(\App\Models\Categoria::orderBy('nome', 'asc')->get());
    }

    public function status()
    {
        return response()->json(\App\Models\Status::orderBy('id', 'asc')->get());
    }

    public function urgencias()
    {
        return response()->json(\App\Models\Urgencia::orderBy('id', 'asc')->get());
    }

    public function prioridades()
    {
        return response()->json(\App\Models\Prioridade::orderBy('id', 'asc')->get());
    }

    #[OA\Get(
        path: "/api/ordens/{id}/comentarios",
        summary: "Lista Categorias (Ignorar este endpoint, apenas placeholder se houvesse route)"
    )]
    
    #[OA\Post(
        path: "/api/ordens/{id}/comentarios",
        summary: "Adicionar Comentário",
        description: "Adiciona um novo comentário a uma ordem de serviço. Apenas o criador, técnico responsável ou Admin podem comentar.",
        tags: ["Ordens de Serviço"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID numérico ou Código de Rastreio (UUID) da OS", schema: new OA\Schema(type: "string"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["conteudo"],
                    properties: [
                        new OA\Property(property: "conteudo", type: "string", description: "Conteúdo do comentário (máx 1000 chars)"),
                        new OA\Property(property: "parent_id", type: "integer", nullable: true, description: "ID do comentário pai (para respostas)")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Comentário adicionado com sucesso"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 403, description: "Acesso negado"),
            new OA\Response(response: 404, description: "Ordem de serviço não encontrada"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function addComentario(\Illuminate\Http\Request $request, $id)
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            $ordem = OrdemServico::where('codigo_rastreio', $id)->first();
        } else {
            $ordem = OrdemServico::where('id', is_numeric($id) ? $id : 0)->first();
        }

        if (!$ordem) {
            return response()->json(['message' => 'Ordem de serviço não encontrada.'], 404);
        }

        $user = $request->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        // Autorização: Apenas criador da OS, técnico atribuído ou Admin podem comentar
        if ($userCargo !== 'Admin' && $ordem->usuario_id !== $user->id && $ordem->tecnico_id !== $user->id) {
            return response()->json(['message' => 'Você não tem permissão para comentar nesta ordem de serviço.'], 403);
        }

        $request->validate([
            'conteudo' => 'required|string|max:1000'
        ]);

        $conteudoSeguro = strip_tags($request->conteudo);

        $comentario = $ordem->comentarios()->create([
            'usuario_id' => $user->id,
            'conteudo' => $conteudoSeguro,
            'parent_id' => $request->parent_id
        ]);

        // Registrar no histórico da OS
        $ordem->historicos()->create([
            'usuario_id' => $user->id,
            'acao'       => 'Comentado',
            'descricao'  => 'Comentário adicionado por ' . $user->nome . ': ' . \Illuminate\Support\Str::limit($conteudoSeguro, 60),
            'criado_em'  => now()
        ]);

        // Notificar o dono da OS se não foi ele quem comentou
        if ($ordem->usuario_id !== $user->id) {
            \App\Models\Notificacao::create([
                'usuario_id' => $ordem->usuario_id,
                'ordem_servico_id' => $ordem->id,
                'titulo' => 'Nova mensagem no chamado',
                'mensagem' => "{$user->nome} respondeu no seu chamado #{$ordem->id}: '{$ordem->titulo}'.",
                'lida' => false,
                'criado_em' => now()
            ]);
        }

        // Notificar o técnico caso exista, e ele não seja o autor do comentário
        if (!empty($ordem->tecnico_id) && $ordem->tecnico_id !== $user->id) {
            \App\Models\Notificacao::create([
                'usuario_id' => $ordem->tecnico_id,
                'ordem_servico_id' => $ordem->id,
                'titulo' => 'Nova mensagem no chamado',
                'mensagem' => "{$user->nome} comentou no chamado #{$ordem->id} que você está acompanhando.",
                'lida' => false,
                'criado_em' => now()
            ]);
        }

        return response()->json($comentario->load(['usuario', 'parent.usuario']), 201);
    }

    #[OA\Put(
        path: "/api/ordens/{id}/comentarios/{comentarioId}",
        summary: "Editar Comentário",
        description: "Edita um comentário existente. Usuários comuns só podem editar seus próprios comentários dentro de 5 minutos. Admin não tem limite de tempo.",
        tags: ["Ordens de Serviço"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID numérico ou Código de Rastreio (UUID) da OS", schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "comentarioId", in: "path", required: true, description: "ID do comentário", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["conteudo"],
                    properties: [
                        new OA\Property(property: "conteudo", type: "string", description: "Novo conteúdo (máx 1000 chars)")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Comentário editado com sucesso"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 403, description: "Acesso negado / Tempo limite expirado"),
            new OA\Response(response: 404, description: "Comentário não encontrado"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function updateComentario(\Illuminate\Http\Request $request, $id, $comentarioId)
    {
        $comentario = \App\Models\OrdemServicoComentario::findOrFail($comentarioId);
        
        $user = $request->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        if ($userCargo !== 'Admin' && $comentario->usuario_id !== $user->id) {
            return response()->json(['message' => 'Você só pode editar seus próprios comentários.'], 403);
        }

        if ($userCargo !== 'Admin' && $comentario->criado_em && $comentario->criado_em->diffInMinutes(now()) > 5) {
            return response()->json(['message' => 'O tempo limite de 5 minutos para editar mensagens já expirou.'], 403);
        }

        $request->validate(['conteudo' => 'required|string|max:1000']);

        $conteudoSeguro = strip_tags($request->conteudo);

        $comentario->update([
            'conteudo' => $conteudoSeguro,
            'editado' => true
        ]);

        return response()->json($comentario->load('usuario'), 200);
    }

    #[OA\Delete(
        path: "/api/ordens/{id}/comentarios/{comentarioId}",
        summary: "Excluir Comentário",
        description: "Exclui um comentário. Pode ser excluído apenas para o usuário atual ou para todos (deleção lógica). Apenas o autor ou Admin podem excluir.",
        tags: ["Ordens de Serviço"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID numérico ou Código de Rastreio (UUID) da OS", schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "comentarioId", in: "path", required: true, description: "ID do comentário", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    required: ["tipo"],
                    properties: [
                        new OA\Property(property: "tipo", type: "string", enum: ["mim", "todos"], description: "Tipo de exclusão: 'mim' ou 'todos'")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Comentário excluído com sucesso"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 403, description: "Acesso negado"),
            new OA\Response(response: 404, description: "Comentário não encontrado"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function deleteComentario(\Illuminate\Http\Request $request, $id, $comentarioId)
    {
        $comentario = \App\Models\OrdemServicoComentario::findOrFail($comentarioId);
        
        $user = $request->user();
        $userCargo = is_string($user->cargo) ? $user->cargo : ($user->cargo?->nome ?? '');

        $tipoExclusao = $request->query('tipo', 'mim'); // 'mim' ou 'todos'

        if ($tipoExclusao === 'todos') {
            if ($userCargo !== 'Admin' && $comentario->usuario_id !== $user->id) {
                return response()->json(['message' => 'Você não tem permissão para excluir este comentário para todos.'], 403);
            }
            $comentario->delete();
            return response()->json(['message' => 'Comentário excluído para todos.'], 200);
        } else {
            $excluidoPara = $comentario->excluido_para ?? [];
            if (!in_array($user->id, $excluidoPara)) {
                $excluidoPara[] = $user->id;
                $comentario->update(['excluido_para' => $excluidoPara]);
            }
            return response()->json(['message' => 'Comentário excluído para você.'], 200);
        }
    }

    public function fixar($id)
    {
        $ordem = OrdemServico::findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('fixar', $ordem);

        $ordem->fixada = !$ordem->fixada;
        $ordem->save();
        if ($ordem->fixada) {
            return response()->json([
                'message' => 'Ordem de Serviço fixada com sucesso',
                'fixada' => $ordem->fixada
            ], 200);
        } else {
            return response()->json([
                'message' => 'Ordem de Serviço desfixada com sucesso',
                'fixada' => $ordem->fixada
            ], 200);
        }
    }
}