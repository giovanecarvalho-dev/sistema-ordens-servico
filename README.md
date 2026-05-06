Sistema de Gerenciamento de Ordens de Serviço
Plataforma integrada para gestão de chamados técnicos, composta por uma API REST em Laravel e interface em Next.js. Toda a infraestrutura é operada via Docker.

Arquitetura do Sistema
Três serviços principais:

API (Backend): Laravel 11
Frontend: Next.js 15
Banco de Dados: PostgreSQL 15
Configuração Inicial
1. Banco de Dados
Copie o arquivo de exemplo e configure suas credenciais de admin:

cp init-db/estrutura.example.sql init-db/estrutura.sql
Edite o init-db/estrutura.sql e descomente o bloco INSERT no final, preenchendo com seus dados.

Para gerar o hash da senha, após subir os containers rode:

docker exec os_api php -r "echo password_hash('sua_senha', PASSWORD_BCRYPT, ['cost' => 12]);"
2. Subindo os containers
docker compose up --build
Para recriar o banco do zero (apaga todos os dados):

docker compose down -v && docker compose up --build
Acesso aos Serviços
Serviço	URL
Frontend	http://localhost:3000
Backend API	http://localhost:8000
Swagger (Docs)	http://localhost:8000/api/documentation
Banco de Dados	localhost:5432
Controle de Acesso
Cargo	Permissões
Usuario	Criar chamados
Tecnico	Criar e visualizar chamados atribuídos a ele
Admin	Acesso total ao sistema
Persistência de Dados
O projeto utiliza volumes nomeados no Docker para garantir que os dados do PostgreSQL sejam persistidos mesmo após o encerramento dos containers.


# OS Manager — Sistema de Gerenciamento de Ordens de Serviço

Plataforma integrada para gestão de chamados técnicos, com API REST em Laravel e interface em Next.js, totalmente containerizada via Docker. Inclui autenticação JWT, controle de acesso por cargo, fluxo completo de OS com cálculo de tempo de pausa e código de rastreio único por chamado.

> **Status:** em desenvolvimento ativo. Veja o [Roadmap](#roadmap) para próximas entregas.

---

## Demonstração

> _Substituir pelos screenshots reais após capturar._

| Tela | Preview |
|---|---|
| Login | 

![Login](docs/screenshots/01-login.png)

 |
| Listagem de chamados | 

![Listagem](docs/screenshots/02-listagem.png)

 |
| Criação de OS | 

![Criar OS](docs/screenshots/03-criar-os.png)

 |
| Detalhe da OS | 

![Detalhe](docs/screenshots/04-detalhe-os.png)

 |

---

## 🛠️Stack

**Backend**
- PHP 8.2 + Laravel 11
- Autenticação JWT (`tymon/jwt-auth`)
- PostgreSQL 15
- Documentação OpenAPI/Swagger via attributes do PHP 8

**Frontend**
- Next.js 15 (App Router)
- TypeScript

**Infraestrutura**
- Docker + Docker Compose
- Volumes nomeados para persistência

---

##  Arquitetura

Três serviços orquestrados via `docker-compose`:

Next.js 15 - Frontend (Porta:3000)
Laravel 11 - API REST (Porta:8000)
PostgreSQL - Banco (Porta:5432)

### Decisões técnicas

- **Autenticação JWT em vez de sessão**: API stateless, escalável horizontalmente e desacoplada do front. Cliente envia token no header `Authorization: Bearer`.
- **Middleware customizado por cargo (`cargo:Tecnico,Admin`)**: autorização aplicada na camada de rota, antes do controller, evitando código de permissão espalhado.
- **Identificação dupla das OS (ID numérico + UUID `codigo_rastreio`)**: ID interno para joins e queries; UUID público para rastreio por cliente sem expor estrutura sequencial do banco.
- **Senhas com bcrypt cost 12**: acima do default do Laravel, reforço deliberado de segurança.
- **Eager loading nos relacionamentos (`with([...])`)**: evita N+1 queries em listagens de OS com status, categoria, urgência, prioridade, usuário e técnico.
- **Soft delete via flag `ativo`**: chamados removidos vão pra "lixeira" em vez de sumir, preservando histórico e auditoria.
- **Schema PostgreSQL separado** (`core`, `gestoes`): organização por domínio dentro do mesmo banco.

---

## Configuração inicial

### 1. Pré-requisitos

- Docker e Docker Compose instalados.

### 2. Variáveis de ambiente

```bash
cp os-manager-api/.env.example os-manager-api/.env
cp os-manager-front/.env.example os-manager-front/.env.local
```
### 3. Banco de dados
```bash
cp init-db/estrutura.example.sql init-db/estrutura.sql
```
### 4. Subindo os containers

```bash
docker compose up --build
```
### 5.Inicialização da aplicação 

```bash
docker exec os_api php artisan key:generate
docker exec os_api php artisan jwt:secret
docker exec os_api php artisan migrate
```
### 6. Hash da senha do Admin

```bash
docker exec os_api php -r "echo password_hash('sua_senha', PASSWORD_BCRYPT, ['cost' => 12]);"
```
### Reiniciar Ambiente do Zero
```bash
docker compose down -v && docker compose up --build
```
##  Acesso aos serviços

| Serviço | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger (Docs) | http://localhost:8000/api/documentation |
| Banco de Dados | localhost:5432 |

## Controle de acesso

| Cargo | Permissões |
| --- | --- |
| **Usuário** | Criar chamados próprios |
| **Técnico** | Criar chamados; visualizar e atualizar apenas chamados atribuídos a ele |
| **Admin** | Acesso total: gerenciar usuários, todos os chamados, dashboard |

Permissões aplicadas via middleware customizado nas rotas (`routes/api.php`).

## Funcionalidades

- Autenticação JWT com login, logout e endpoint de perfil
- Cadastro público restrito ao cargo "Usuário" (sem escalada de privilégio)
- CRUD completo de Ordens de Serviço com filtros por status, categoria, urgência, prioridade, busca textual, ID e UUID
- Paginação nativa e ordenação por data de criação
- Cálculo automático de tempo pausado em estados como "Pausado" e "Aguardando Peça"
- Geração automática de código de rastreio (UUID) na criação da OS
- Validação centralizada via Form Requests com regras nomeadas
- Documentação interativa via Swagger UI
- Camada de Service para lógica de negócio
- Health check em `/api/health` para monitoramento

## Estrutura do projeto

    .
    ├── os-manager-api/          # API Laravel 11
    │   ├── app/
    │   │   ├── Http/
    │   │   │   ├── Controllers/
    │   │   │   ├── Middleware/  # CargoMiddleware (autorização por cargo)
    │   │   │   └── Requests/    # Form Requests com validação
    │   │   ├── Models/
    │   │   └── Services/        # Lógica de negócio
    │   └── routes/api.php
    ├── os-manager-front/        # Frontend Next.js 15
    ├── init-db/                 # Schema inicial PostgreSQL
    └── docker-compose.yml


##  Autor

**Giovane Oliveira Carvalho**
Desenvolvedor back-end | Estudante de ADS — ESBAM (Manaus/AM)

[LinkedIn](https://linkedin.com/in/giovanecarvalho) · [GitHub](https://github.com/giovanecarvalho-dev)
