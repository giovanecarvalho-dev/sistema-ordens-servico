<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class ValidateJtiToken
{
    /**
     * Handle an incoming request.
     *
     * Valida que o JTI (JWT ID) no token corresponde ao JTI salvo no banco de dados.
     * Isso garante que apenas um token por usuário seja válido por vez.
     * Se um novo login é feito, o token anterior é invalidado.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Obter o token do header Authorization
            $token = JWTAuth::getToken();
            
            if (!$token) {
                return response()->json(['message' => 'Token não fornecido'], 401);
            }

            // Decodificar o token e extrair os claims
            $decoded = JWTAuth::decode($token);
            
            // Obter o JTI do token (adicionado em getJWTCustomClaims)
            $tokenJti = $decoded->get('jti');
            
            if (!$tokenJti) {
                return response()->json(['message' => 'Token sem JTI'], 401);
            }

            // Obter usuário autenticado
            $user = auth('api')->user();
            
            if (!$user) {
                return response()->json(['message' => 'Usuário não encontrado'], 401);
            }

            // Comparar JTI do token com o JTI salvo no banco
            if ($user->jti_token !== $tokenJti) {
                return response()->json([
                    'message' => 'Sessão expirada. Faça login novamente.',
                    'reason' => 'Token inválido para este usuário'
                ], 401);
            }

            return $next($request);

        } catch (JWTException $e) {
            return response()->json([
                'message' => 'Token inválido',
                'error' => $e->getMessage()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao validar token',
                'error' => $e->getMessage()
            ], 401);
        }
    }
}
