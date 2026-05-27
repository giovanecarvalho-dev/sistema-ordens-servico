<?php

namespace App\Http\Controllers;

use App\Models\Configuracao;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Configuracoes", description: "Configurações do sistema (SLA, nome, etc.)")]
class ConfiguracaoController extends Controller
{
    #[OA\Get(
        path: "/api/configuracoes",
        tags: ["Configuracoes"],
        summary: "Retorna as configurações do sistema",
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Configurações retornadas"),
            new OA\Response(response: 403, description: "Acesso negado"),
        ]
    )]
    public function index()
    {
        $limites = Configuracao::slaLimites();

        return response()->json([
            'sla_muito_alta' => $limites['Muito Alta'],
            'sla_alta'       => $limites['Alta'],
            'sla_media'      => $limites['Média'],
            'sla_baixa'      => $limites['Baixa'],
            'nome_sistema'   => Configuracao::get('nome_sistema', 'Central de Suporte Técnico'),
        ]);
    }

    #[OA\Put(
        path: "/api/configuracoes",
        tags: ["Configuracoes"],
        summary: "Atualiza as configurações do sistema",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "sla_muito_alta", type: "integer", example: 2),
                    new OA\Property(property: "sla_alta",       type: "integer", example: 4),
                    new OA\Property(property: "sla_media",      type: "integer", example: 8),
                    new OA\Property(property: "sla_baixa",      type: "integer", example: 24),
                    new OA\Property(property: "nome_sistema",   type: "string",  example: "Central de Suporte"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Configurações salvas"),
            new OA\Response(response: 422, description: "Erro de validação"),
            new OA\Response(response: 403, description: "Acesso negado"),
        ]
    )]
    public function update(\App\Http\Requests\UpdateConfiguracaoRequest $request)
    {
        $mapa = [
            'sla_muito_alta' => 'sla_muito_alta',
            'sla_alta'       => 'sla_alta',
            'sla_media'      => 'sla_media',
            'sla_baixa'      => 'sla_baixa',
            'nome_sistema'   => 'nome_sistema',
        ];

        foreach ($mapa as $campo => $chave) {
            if ($request->filled($campo)) {
                Configuracao::set($chave, $request->input($campo));
            }
        }

        return response()->json(['message' => 'Configurações salvas com sucesso.']);
    }
}
