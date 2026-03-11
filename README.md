# Sistema de Gerenciamento de Ordens de Serviço

Plataforma integrada para gestão de chamados técnicos, composta por uma API REST em Laravel e interface em Next.js. Toda a infraestrutura é operada via Docker.

## Arquitetura do Sistema

Três serviços principais:
1. **API (Backend):** Laravel 11
2. **Frontend:** Next.js 15
3. **Banco de Dados:** PostgreSQL 15

## Configuração Inicial

### 1. Banco de Dados

Copie o arquivo de exemplo e configure suas credenciais de admin:
```bash
cp init-db/estrutura.example.sql init-db/estrutura.sql
```

Edite o `init-db/estrutura.sql` e descomente o bloco `INSERT` no final, preenchendo com seus dados.

Para gerar o hash da senha, após subir os containers rode:
```bash
docker exec os_api php -r "echo password_hash('sua_senha', PASSWORD_BCRYPT, ['cost' => 12]);"
```

### 2. Subindo os containers
```bash
docker compose up --build
```

Para recriar o banco do zero (apaga todos os dados):
```bash
docker compose down -v && docker compose up --build
```

## Acesso aos Serviços

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger (Docs) | http://localhost:8000/api/documentation |
| Banco de Dados | localhost:5432 |

## Controle de Acesso

| Cargo | Permissões |
|---|---|
| **Usuario** | Criar chamados |
| **Tecnico** | Criar e visualizar chamados atribuídos a ele |
| **Admin** | Acesso total ao sistema |

## Persistência de Dados

O projeto utiliza volumes nomeados no Docker para garantir que os dados do PostgreSQL sejam persistidos mesmo após o encerramento dos containers.
