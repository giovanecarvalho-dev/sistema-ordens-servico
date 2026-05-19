# Sistema de Gerenciamento de Ordens de Serviço – Frontend

Este repositório contém a aplicação frontend do Sistema de Gerenciamento de Ordens de Serviço, desenvolvida utilizando o framework Next.js. A interface é responsável por prover a interação com o usuário final, realizar a comunicação com a API REST e apresentar os dados relacionados aos chamados técnicos de forma organizada e acessível.

A aplicação foi projetada para funcionar de maneira integrada ao backend desenvolvido em Laravel, respeitando a separação de responsabilidades entre interface, regras de negócio e persistência de dados.

---

## Tecnologias Utilizadas

- Node.js 22
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Docker

---

## Funcionalidades

O frontend oferece as seguintes funcionalidades principais:

- Autenticação de técnicos por CPF e senha
- Cadastro de novos técnicos
- Listagem de ordens de serviço
- Criação de novos chamados técnicos
- Edição de ordens de serviço
- Exclusão de chamados
- Atribuição de técnicos às ordens
- Visualização de estatísticas operacionais
- Listagem de técnicos cadastrados

Todas as operações são realizadas por meio do consumo da API REST, não havendo acesso direto ao banco de dados pelo frontend.

---

## Arquitetura da Aplicação

A aplicação utiliza o App Router do Next.js, com organização baseada em páginas e layouts. A estrutura é composta por:

- Layout global com barra lateral de navegação
- Páginas de listagem, criação e edição de chamados
- Página de autenticação
- Página de estatísticas
- Página de listagem de usuários

A comunicação com o backend é centralizada em um serviço HTTP, responsável por gerenciar as requisições para os endpoints da API.

---

## Integração com o Backend

O frontend consome os seguintes endpoints da API:

- `POST /login` – Autenticação de usuários
- `POST /usuarios` – Cadastro de técnicos
- `GET /usuarios` – Listagem de técnicos
- `GET /ordens` – Listagem de ordens de serviço
- `POST /ordens` – Criação de chamados
- `PUT /ordens/{id}` – Atualização de ordens
- `DELETE /ordens/{id}` – Exclusão de ordens

Para funcionamento adequado, o backend deve estar em execução e acessível.

---

## Execução com Docker

O frontend é executado em um container Docker, garantindo consistência entre ambientes de desenvolvimento.

### Inicialização do ambiente:

```bash
docker-compose up -d --build
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed