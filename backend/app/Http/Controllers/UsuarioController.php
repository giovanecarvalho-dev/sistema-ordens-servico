<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Cargo; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Usuarios", description: "Endpoints para gerenciamento de usuários")]
class UsuarioController extends Controller
{
    #[OA\Get(
        path: "/api/usuarios",
        tags: ["Usuarios"],
        summary: "Lista usuários com filtros, paginação e contagem de ordens",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "query",
                description: "Filtrar por ID específico",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "ativo",
                in: "query",
                description: "Filtrar por status ativo/inativo",
                required: false,
                schema: new OA\Schema(type: "boolean")
            ),
            new OA\Parameter(
                name: "nome",
                in: "query",
                description: "Buscar por parte do nome",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "email",
                in: "query",
                description: "Buscar por e-mail",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "cpf",
                in: "query",
                description: "Buscar por início do CPF",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "cargo",
                in: "query",
                description: "Filtrar pelo nome do cargo (ex: Admin, Tecnico, Usuario)",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "busca",
                in: "query",
                description: "Busca global (nome, email ou cpf)",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                description: "Número da página (padrão: 1)",
                required: false,
                schema: new OA\Schema(type: "integer", default: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                description: "Itens por página (padrão: 15, máximo: 100)",
                required: false,
                schema: new OA\Schema(type: "integer", default: 15)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Lista paginada de usuários"),
            new OA\Response(response: 401, description: "Não autenticado"),
            new OA\Response(response: 403, description: "Acesso negado")
        ]
    )]
    public function index(Request $request)
{
    $query = User::with('cargo');

    // Contagem de ordens ativas baseada no relacionamento status
    $query->withCount(['ordensSolicitadas as ordens_ativas' => function ($q) {
        $q->whereHas('status', function($sq) {
            $sq->where('nome', '!=', 'Fechado');
        });
    }]);

    // Filtros de Identidade
    if ($request->filled('id')) {
        $query->where('id', $request->id);
    }

    if ($request->has('ativo')) {
        $query->where('ativo', $request->boolean('ativo'));
    } else {
        $query->where('ativo', true);
    }

    // Filtros Textuais Específicos
    if ($request->filled('nome')) {
        $query->where('nome', 'ilike', '%' . $request->nome . '%');
    }

    if ($request->filled('email')) {
        $query->where('email', 'ilike', '%' . $request->email . '%');
    }

    if ($request->filled('cpf')) {
        $query->where('cpf', 'like', $request->cpf . '%');
    }

    // Filtro por Nome do Cargo (suporta múltiplos cargos separados por vírgula)
    if ($request->filled('cargo')) {
        $cargoInput = $request->cargo;
        if (is_string($cargoInput) && str_contains($cargoInput, ',')) {
            $cargos = array_map('trim', explode(',', $cargoInput));
            $query->whereHas('cargo', fn($q) => 
                $q->whereIn('nome', $cargos)
            );
        } else {
            $query->whereHas('cargo', fn($q) => 
                $q->where('nome', $cargoInput)
            );
        }
    }

    // Busca Global (Nome, E-mail ou CPF)
    if ($request->filled('busca')) {
        $query->where(function ($q) use ($request) {
            $busca = '%' . $request->busca . '%';
            $q->where('nome', 'ilike', $busca)
              ->orWhere('email', 'ilike', $busca)
              ->orWhere('cpf', 'like', $request->busca . '%');
        });
    }

    $perPage = min((int) $request->query('per_page', 15), 100);

    return response()->json(
        $query->orderBy('nome', 'asc')->paginate($perPage)
    );
}

    #[OA\Post(
        path: "/api/usuarios",
        tags: ["Usuarios"],
        summary: "Cria um novo usuário",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "João Silva"),
                    new OA\Property(property: "cpf", type: "string", example: "12345678901"),
                    new OA\Property(property: "email", type: "string", example: "joao@email.com"),
                    new OA\Property(property: "senha", type: "string", example: "1234"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Usuário criado"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'nome'  => 'required|string|max:80',
            'cpf'   => 'required|string|size:11|unique:usuarios,cpf',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:4',
        ]);

        // INTEGRAÇÃO COM CARGOS: Pega o ID do 'Usuario' no banco
        $cargoId = Cargo::where('nome', 'Usuario')->value('id');

        $usuario = User::create([
            'nome'     => $request->nome,
            'cpf'      => $request->cpf,
            'email'    => $request->email,
            'senha'    => Hash::make($request->senha),
            'cargo_id' => $cargoId, 
            'jti_token'=> \Illuminate\Support\Str::uuid()->toString(),
            'jti_token_created_at' => now(),
        ]);

        return response()->json($usuario->load('cargo'), 201);
    }

    #[OA\Post(
        path: "/api/login",
        tags: ["Usuarios"],
        summary: "Login do usuário",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "cpf", type: "string", example: "12345678901"),
                    new OA\Property(property: "senha", type: "string", example: "1234")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Login realizado"),
            new OA\Response(response: 401, description: "Credenciais inválidas")
        ]
    )]
    
    public function login(Request $request)
    {
        $request->validate([
            'cpf'   => 'required',
            'senha' => 'required',
        ]);

        $usuario = User::where('cpf', $request->cpf)->first();

        if (!$usuario || !$usuario->ativo) {
            return response()->json([
                'message' => 'Usuário inativo ou inexistente'
            ], 401);
        }

        $credenciais = [
            'cpf'      => $request->cpf,
            'password' => $request->senha,
        ];

        if (!$token = auth('api')->attempt($credenciais)) {
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        //Uma sessão por usuario
        //Gerar novo JTI (JWT ID) único para esta sessão
        //Invalidar qualquer token anterior deste usuário
        $usuario->update([
            'jti_token' => \Illuminate\Support\Str::uuid()->toString(),
            'jti_token_created_at' => now(),
        ]);

        // Invalidar o token temporário do attempt() (ele carrega o JTI antigo)
        auth('api')->invalidate(true);

        // Gerar um token novo — login() chama getJWTCustomClaims() no $usuario atualizado,
        // garantindo que o JTI no token bata com o JTI no banco
        $token = auth('api')->login($usuario);

        return response()->json([
            'user'  => auth('api')->user()->load('cargo'),
            'token' => $token
        ]);
    }

    #[OA\Post(
        path: "/api/logout",
        tags: ["Usuarios"],
        summary: "Logout do usuário",
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Logout realizado"),
            new OA\Response(response: 401, description: "Não autenticado")
        ]
    )]
    public function logout(Request $request)
    {
        // Obter usuário antes de fazer logout
        $user = auth('api')->user();
        
        // Fazer logout (revoga o token)
        auth('api')->logout();
        
        // Limpar JTI do banco (sessão invalidada)
        if ($user) {
            $user->update([
                'jti_token' => null,
                'jti_token_created_at' => null,
            ]);
        }

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    #[OA\Put(
        path: "/api/usuarios/{id}",
        tags: ["Usuarios"],
        summary: "Atualiza o cargo de um usuário",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["cargo"],
                properties: [
                    new OA\Property(property: "cargo", type: "string", example: "Tecnico", enum: ["Usuario", "Tecnico", "Admin"])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Cargo atualizado"),
            new OA\Response(response: 404, description: "Usuário não encontrado"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        $request->validate([
            'cargo' => 'required|string|in:Usuario,Tecnico,Admin',
        ]);

        // Atualiza pelo ID do cargo
        $cargoId = Cargo::where('nome', $request->cargo)->value('id');
        
        $usuario->cargo_id = $cargoId;
        $usuario->save();

        return response()->json($usuario->load('cargo'));
    }

    #[OA\Get(
        path: "/api/perfil",
        tags: ["Usuarios"],
        summary: "Retorna os dados do usuário logado atual",
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Dados do usuário logado"),
            new OA\Response(response: 401, description: "Não autenticado")
        ]
    )]
    public function me(Request $request)
    {
        // Envia o usuário logado e já traz o nome do cargo empacotado
        return response()->json($request->user()->load('cargo'));
    }

    #[OA\Put(
        path: "/api/usuarios/{id}/perfil",
        tags: ["Usuarios"],
        summary: "Atualiza perfil do usuário logado",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nome", "email"],
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "João Silva"),
                    new OA\Property(property: "email", type: "string", example: "joao@email.com"),
                    new OA\Property(property: "senha_atual", type: "string", example: "1234"),
                    new OA\Property(property: "nova_senha", type: "string", example: "4321"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Perfil atualizado"),
            new OA\Response(response: 400, description: "Senha atual incorreta"),
            new OA\Response(response: 404, description: "Usuário não encontrado"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function updatePerfil(Request $request, $id)
    {
        if ($request->user()->id != $id) {
            return response()->json(['message' => 'Você não tem permissão para editar este perfil.'], 403);
        }
        
        $usuario = User::findOrFail($id);

        $request->validate([
            'nome'       => 'required|string|max:80',
            'email' => 'required|email|unique:usuarios,email,' . $id,
            'nova_senha' => 'sometimes|nullable|string|min:4',
            'senha_atual'=> 'sometimes|nullable|string',
        ]);

        $usuario->nome  = $request->nome;
        $usuario->email = $request->email;

        if ($request->nova_senha) {
            if (!Hash::check($request->senha_atual, $usuario->senha)) {
                return response()->json(['message' => 'Senha atual incorreta.'], 400);
            }
            $usuario->senha = Hash::make($request->nova_senha);
        }

        $usuario->save();

        return response()->json($usuario->load('cargo'));
    }

    #[OA\Delete(
        path: "/api/usuarios/{id}",
        tags: ["Usuarios"],
        summary: "Remove um usuário",
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Usuário removido"),
            new OA\Response(response: 404, description: "Usuário não encontrado")
        ]
    )]
    public function destroy($id)
    {
        $usuario = User::findOrFail($id);
        $usuario->update([
            'ativo' => false,
            'jti_token' => null, // Invalida a sessão ativa imediatamente
        ]);
        return response()->json(['message' => 'Usuário removido com sucesso']);
    }
}