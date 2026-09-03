CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL
);

CREATE TABLE ideas (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    setor_oportunidade VARCHAR(200) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    setor_trabalho VARCHAR(200) NOT NULL,
    eixo VARCHAR(200) NOT NULL,
    valor_ds VARCHAR(200) NOT NULL,
    situacao TEXT NOT NULL,
    causa_raiz TEXT NOT NULL,
    solucao TEXT NOT NULL,
    beneficios TEXT NOT NULL,
    recursos TEXT NOT NULL,
    desafios TEXT NOT NULL,
    indicar_outra_pessoa VARCHAR(10) NOT NULL,
    nome_pessoa_indicada VARCHAR(200)
);

CREATE INDEX idx_ideas_created_at ON ideas (created_at DESC);
