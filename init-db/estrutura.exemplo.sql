CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(30) DEFAULT 'Usuario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordem_servicos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'Novo',
    urgencia VARCHAR(15),
    prioridade VARCHAR(15),
    categoria VARCHAR(20),
    localizacao VARCHAR(120) NOT NULL,
    solucao VARCHAR(200),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tecnico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Para criar o usuário admin, copie este arquivo para estrutura.sql
-- e gere o hash da senha com:
-- docker exec os_api php -r "echo password_hash('sua_senha', PASSWORD_BCRYPT, ['cost' => 12]);"
-- Depois adicione o INSERT abaixo com seus dados:
--
-- INSERT INTO usuarios (nome, cpf, email, senha, cargo) VALUES (
--     'Seu Nome Completo',
--     '00000000000',
--     'seu@email.com',
--     '$2y$12$hash_gerado_aqui',
--     'Admin'
-- ) ON CONFLICT (cpf) DO NOTHING;