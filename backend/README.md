# OS Manager API - Documentação Técnica

Interface de Programação de Aplicativos (API) desenvolvida para gerenciar a lógica de negócios, autenticação e persistência de dados do sistema de ordens de serviço.

## Tecnologias e Requisitos

- PHP 8.2+
- Laravel 11
- PostgreSQL 15
- Laravel Sanctum para autenticação

## Estrutura de Dados (Modelo de Usuário)

A tabela de usuários foi customizada para atender a requisitos específicos de identificação nacional, substituindo o campo de e-mail por CPF.
- nome: Nome completo do técnico.
- cpf: Chave única de identificação e login.
- senha: Atributo password mapeado para a coluna 'senha' no PostgreSQL.
- cargo: Definição de privilégios no sistema.

## Endpoints Principais

- GET /api/ordens: Listagem de ordens de serviço.
- POST /api/ordens: Registro de novo chamado técnico.
- GET /api/usuarios: Listagem de técnicos cadastrados.

## Comandos Úteis (Artisan via Docker)

- Gerar novas tabelas: docker-compose exec api php artisan migrate
- Resetar banco de dados: docker-compose exec api php artisan migrate:fresh --seed
- Limpar cache de configuração: docker-compose exec api php artisan config:clear