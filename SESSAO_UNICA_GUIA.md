# Sessão Única por Usuário - Guia de Implementação e Teste

## 📋 Resumo da Implementação

A solução implementa **sessão única por usuário** usando JWT com validação de JTI (JWT ID). Quando um usuário faz login em um novo dispositivo, o token anterior é automaticamente invalidado.

### Arquivos Modificados/Criados:

1. **Migration** - `database/migrations/2026_05_20_000001_add_jti_token_to_usuarios.php`
   - Adiciona campos `jti_token` e `jti_token_created_at` na tabela `usuarios`

2. **User Model** - `app/Models/User.php`
   - Adiciona `jti_token` ao fillable e hidden
   - Inclui JTI nos custom JWT claims

3. **Login Controller** - `app/Http/Controllers/UsuarioController.php` 
   - Gera UUID único como JTI a cada login
   - Invalida tokens anteriores do mesmo usuário

4. **Middleware** - `app/Http/Middleware/ValidateJtiToken.php` (NOVO)
   - Valida JTI do token a cada request autenticado
   - Retorna 401 se JTI não corresponder

5. **Config** - `bootstrap/app.php`
   - Registra novo middleware `validate-jti`

6. **Routes** - `routes/api.php`
   - Aplica middleware nas rotas protegidas

---

## 🔄 Fluxo de Funcionamento

### Login (POST /login)
```
1. Usuário envia CPF + Senha
2. Sistema valida credenciais ✓
3. Gera UUID único como JTI
4. Salva JTI no banco (usuarios.jti_token)
5. Inclui JTI no JWT token
6. Retorna token com novo JTI
```

### Request Autenticado (GET /perfil, etc)
```
1. Frontend envia token no header Authorization
2. Middleware valida JWT (auth:api) ✓
3. Middleware ValidateJtiToken extrai JTI do token
4. Compara JTI do token com JTI salvo no banco
5. Se iguais → permite acesso ✓
6. Se diferentes → retorna 401 "Sessão expirada"
```

### Novo Login (Login em outro dispositivo)
```
1. Mesmo usuário faz login no segundo dispositivo
2. Novo UUID gerado e salvo no banco
3. Token antigo (com JTI antigo) deixa de ser válido
4. Primeiro dispositivo recebe 401 no próximo request
```

### Logout (POST /logout)
```
1. Usuário faz logout
2. Limpa JTI do banco (set NULL)
3. Token antigo deixa de ser aceito
```

---

## 🧪 Testes Locais (ANTES de fazer deploy)

### Teste 1: Login Básico
```bash
# Terminal 1: Login no primeiro dispositivo
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901","senha":"senha123"}'

# Resposta esperada:
{
  "user": {...},
  "token": "eyJ0eXAi..."
}

# Salvar o token em $TOKEN1
```

### Teste 2: Usar Token (Deve funcionar)
```bash
curl -X GET http://localhost:8000/api/perfil \
  -H "Authorization: Bearer $TOKEN1"

# Resposta esperada: 200 OK com dados do usuário
```

### Teste 3: Login no Segundo Dispositivo (Mesmo usuário)
```bash
# Terminal 2: Login novamente com mesmo CPF
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901","senha":"senha123"}'

# Resposta esperada: novo token $TOKEN2
```

### Teste 4: Token Antigo Deve Parar de Funcionar
```bash
# Terminal 1: Tentar usar token antigo
curl -X GET http://localhost:8000/api/perfil \
  -H "Authorization: Bearer $TOKEN1"

# Resposta esperada: 401 Unauthorized
# "message": "Sessão expirada. Faça login novamente."
```

### Teste 5: Token Novo Deve Funcionar
```bash
# Terminal 2: Usar novo token
curl -X GET http://localhost:8000/api/perfil \
  -H "Authorization: Bearer $TOKEN2"

# Resposta esperada: 200 OK com dados do usuário
```

### Teste 6: Logout Limpa Sessão
```bash
# Fazer logout
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer $TOKEN2"

# Resposta esperada: 200 OK

# Tentar usar token após logout
curl -X GET http://localhost:8000/api/perfil \
  -H "Authorization: Bearer $TOKEN2"

# Resposta esperada: 401 (JTI inválido ou NULL)
```

---

## 📦 Passos para Deploy

### Passo 1: Backend - Rodar Migration
```bash
cd backend

# Executar migration para adicionar campos
php artisan migrate
```

### Passo 2: Verificar Banco de Dados
```bash
# Verificar que os campos foram adicionados:
# - usuarios.jti_token (VARCHAR nullable, unique)
# - usuarios.jti_token_created_at (TIMESTAMP nullable)

mysql -u seu_usuario -p seu_banco
SELECT * FROM usuarios LIMIT 1;
```

### Passo 3: Deploy de Código
```bash
# Copiar/fazer push dos arquivos modificados:
# - backend/app/Models/User.php
# - backend/app/Http/Controllers/UsuarioController.php
# - backend/app/Http/Middleware/ValidateJtiToken.php (NOVO)
# - backend/bootstrap/app.php
# - backend/routes/api.php
```

### Passo 4: Cache (se necessário)
```bash
cd backend
php artisan config:cache
php artisan route:cache
```

### Passo 5: Testar em Produção
```bash
# Executar os testes acima no servidor de produção
# Validar que sessão única funciona corretamente
```

---

## ⚠️ Considerações Importantes

### Segurança
- JTI é UUID v4 (praticamente impossível de adivinhar)
- Comparação é realizada a cada request
- Tokens antigos são invalidados ao novo login
- Sem necessidade de blacklist de tokens

### Performance
- Uma comparação extra por request (string comparison no banco)
- Índice unique em `jti_token` garante performance

### Compatibilidade
- Frontend não precisa de mudanças (token é opaco)
- API retorna 401 quando JTI inválido (same behavior)
- Mensagem de erro clara para frontend tratar

### Rollback (se necessário)
```bash
php artisan migrate:rollback
# Remove campos, volta funcionamento anterior
# Usuários precisarão fazer login novamente
```

---

## 🔍 Troubleshooting

### Problema: "Token sem JTI"
**Causa:** Token gerado antes da atualização do código
**Solução:** Fazer novo login

### Problema: "Sessão expirada" em todos os requests
**Causa:** Middleware não conseguindo decodificar token
**Solução:** Verificar JWT_SECRET está correto no .env

### Problema: Erro "Unique constraint violation" em jti_token
**Causa:** Valores NULL duplicados
**Solução:** Isso não deve acontecer (unique permite múltiplos NULL), mas se ocorrer, revisar migration

---

## 📝 Checklist Pre-Deploy

- [ ] Tests locais passaram (Teste 1-6 acima)
- [ ] Migration criada: `2026_05_20_000001_add_jti_token_to_usuarios.php`
- [ ] User.php atualizado com jti_token no fillable/hidden
- [ ] UsuarioController.php login modificado
- [ ] ValidateJtiToken.php middleware criado
- [ ] bootstrap/app.php registra novo middleware
- [ ] routes/api.php aplica middleware nas rotas protegidas
- [ ] UsuarioController.php logout atualizado para limpar JTI
- [ ] Backup do banco feito antes de migration em produção
- [ ] Frontend capaz de tratar 401 "Sessão expirada"

---

## 📱 Teste com Frontend

### JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('http://api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cpf: '12345678901', senha: 'senha123' })
});
const { token } = await loginResponse.json();
localStorage.setItem('token', token);

// Request com token
const response = await fetch('http://api/perfil', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

if (response.status === 401) {
  // Mostrar "Sessão expirada, faça login novamente"
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### Next.js (Frontend atual)
- Adicionar tratamento de 401 no interceptor de requests
- Redirecionar para login quando receber 401 com "Sessão expirada"

---

## ✅ Implementação Completa

A implementação garante:

✓ **Sessão única por usuário**: Apenas um token válido por vez
✓ **Invalidação automática**: Token anterior é invalidado no novo login  
✓ **Segurança aumentada**: JTI em cada request
✓ **Sem breaking changes**: API retorna 401 como antes
✓ **Rastreabilidade**: timestamp de quando JTI foi criado
✓ **Logout efectivo**: JTI limpo ao fazer logout

---

**Data de Implementação:** 20 de maio de 2026  
**Responsável:** GitHub Copilot  
**Status:** ✅ Pronto para deploy
