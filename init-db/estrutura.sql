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

INSERT INTO usuarios (nome, cpf, email, senha, cargo) VALUES (
    'Giovane Oliveira Carvalho',
    '04414426251',
    'gchub736@gmail.com',
    '$2y$12$B90KBRg2DWDXzczhQ/Y/RuhyfI7HRm8zSmkn/dHocvcNXbAZE9DYu',
    'Admin'
) ON CONFLICT (cpf) DO NOTHING;