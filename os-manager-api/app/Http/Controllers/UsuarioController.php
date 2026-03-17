<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Usuarios", description: "Endpoints para gerenciamento de usuários")]
class UsuarioController extends Controller
{
    #[OA\Get(
        path: "/api/usuarios",
        tags: ["Usuarios"],
        summary: "Lista todos os usuários",
        security: [["bearerAuth" => []]],
        responses: [new OA\Response(response: 200, description: "Lista de usuários")]
    )]
    public function index()
    {
        return response()->json(User::all());
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
                    new OA\Property(property: "cargo", type: "string", example: "Usuario", enum: ["Usuario", "Tecnico", "Admin"])
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
            'cargo' => 'sometimes|string|in:Usuario,Tecnico,Admin',
        ]);

        $usuario = User::create([
            'nome'  => $request->nome,
            'cpf'   => $request->cpf,
            'email' => $request->email,
            'senha' => Hash::make($request->senha),
            'cargo' => 'Usuario',
        ]);

        return response()->json($usuario, 201);
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
        $usuario = User::where('cpf', $request->cpf)->first();

        if (!$usuario || !Hash::check($request->senha, $usuario->senha)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $usuario,
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
        $request->user()->currentAccessToken()->delete();
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

        $usuario->cargo = $request->cargo;
        $usuario->save();

        return response()->json($usuario);
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
        $usuario = User::findOrFail($id);

        $request->validate([
            'nome'       => 'required|string|max:80',
            'email'      => 'required|email|unique:usuarios,email,' . $id,
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

        return response()->json($usuario);
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
        $usuario->delete();
        return response()->json(['message' => 'Usuário removido com sucesso']);
    }
}