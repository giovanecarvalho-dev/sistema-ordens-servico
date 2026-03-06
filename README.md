
# Sistema de Gerenciamento de Ordens de Serviço

Este projeto consiste em uma plataforma integrada para a gestão de chamados técnicos, composta por uma API REST desenvolvida em Laravel e uma interface de usuário em Next.js. Toda a infraestrutura é operada através de containers Docker para garantir a paridade entre os ambientes de desenvolvimento e produção.

## Arquitetura do Sistema

O ecossistema é dividido em três serviços principais:
1. API (Backend): Framework Laravel 11.
2. Frontend: Framework Next.js 15.
3. Banco de Dados: PostgreSQL 15.

## Procedimentos de Inicialização

Para implantar o ambiente localmente, certifique-se de que o Docker e o Docker Compose estejam instalados e execute os seguintes passos:

1. Construção e execução dos containers:
   docker-compose up -d --build

2. Provisionamento do banco de dados (Migrations):
   docker-compose exec api php artisan migrate 

## Acesso aos Serviços

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Porta do Banco de Dados: 5432

## Persistência de Dados

# Sistema de Gerenciamento de Ordens de Serviço

Este projeto consiste em uma plataforma integrada para a gestão de chamados técnicos, composta por uma API REST desenvolvida em Laravel e uma interface de usuário em Next.js. Toda a infraestrutura é operada através de containers Docker para garantir a paridade entre os ambientes de desenvolvimento e produção.

## Arquitetura do Sistema

O ecossistema é dividido em três serviços principais:
1. API (Backend): Framework Laravel 11.
2. Frontend: Framework Next.js 15.
3. Banco de Dados: PostgreSQL 15.

## Procedimentos de Inicialização

Para implantar o ambiente localmente, certifique-se de que o Docker e o Docker Compose estejam instalados e execute os seguintes passos:

1. Construção e execução dos containers:
   docker-compose up -d --build

2. Provisionamento do banco de dados (Migrations e Seed):
   docker-compose exec api php artisan migrate --seed

## Acesso aos Serviços

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Porta do Banco de Dados: 5432

## Persistência de Dados

O projeto utiliza volumes nomeados no Docker para garantir que os dados armazenados no PostgreSQL sejam persistidos mesmo após o encerramento ou remoção dos containers.