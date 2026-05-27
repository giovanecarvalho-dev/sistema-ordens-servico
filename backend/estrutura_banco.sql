--
-- PostgreSQL database dump
--

\restrict y1MPvpDTaj8LEammzI8IHXUMp7J1FbmRotXgagAMxHVDTPLtCDYOFsnNDoHOAiB

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: core; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA core;


--
-- Name: gestoes; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA gestoes;


--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: fn_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categoria; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.categoria (
    id smallint NOT NULL,
    nome character varying(80) NOT NULL
);


--
-- Name: categoria_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.categoria_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.categoria_id_seq OWNED BY core.categoria.id;


--
-- Name: historico_os; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.historico_os (
    id bigint NOT NULL,
    ordem_servico_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    acao character varying(100) NOT NULL,
    descricao text,
    criado_em timestamp without time zone DEFAULT now() NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.05', autovacuum_analyze_scale_factor='0.02');


--
-- Name: historico_os_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.historico_os_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historico_os_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.historico_os_id_seq OWNED BY core.historico_os.id;


--
-- Name: ordem_servico_comentarios; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.ordem_servico_comentarios (
    id integer NOT NULL,
    ordem_servico_id integer NOT NULL,
    usuario_id integer NOT NULL,
    conteudo text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    editado boolean DEFAULT false,
    excluido_para jsonb DEFAULT '[]'::jsonb,
    deleted_at timestamp without time zone,
    parent_id integer
);


--
-- Name: ordem_servico_comentarios_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.ordem_servico_comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ordem_servico_comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.ordem_servico_comentarios_id_seq OWNED BY core.ordem_servico_comentarios.id;


--
-- Name: ordem_servicos; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.ordem_servicos (
    id bigint NOT NULL,
    codigo_rastreio uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    titulo character varying(120) NOT NULL,
    descricao text NOT NULL,
    status_id smallint NOT NULL,
    urgencia_id smallint NOT NULL,
    prioridade_id smallint NOT NULL,
    categoria_id smallint NOT NULL,
    usuario_id bigint NOT NULL,
    tecnico_id bigint,
    localizacao character varying(80) NOT NULL,
    solucao text,
    anexo text,
    motivo_pausa character varying(150),
    pausado_em timestamp without time zone,
    tempo_pausado_minutos integer DEFAULT 0 NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp without time zone DEFAULT now() NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.02', autovacuum_analyze_scale_factor='0.01', autovacuum_vacuum_threshold='100', autovacuum_analyze_threshold='50');


--
-- Name: ordem_servicos_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.ordem_servicos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ordem_servicos_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.ordem_servicos_id_seq OWNED BY core.ordem_servicos.id;


--
-- Name: prioridade; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.prioridade (
    id smallint NOT NULL,
    nome character varying(40) NOT NULL
);


--
-- Name: prioridade_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.prioridade_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prioridade_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.prioridade_id_seq OWNED BY core.prioridade.id;


--
-- Name: status; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.status (
    id smallint NOT NULL,
    nome character varying(50) NOT NULL
);


--
-- Name: status_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.status_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: status_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.status_id_seq OWNED BY core.status.id;


--
-- Name: urgencia; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core.urgencia (
    id smallint NOT NULL,
    nome character varying(40) NOT NULL
);


--
-- Name: urgencia_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core.urgencia_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: urgencia_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core.urgencia_id_seq OWNED BY core.urgencia.id;


--
-- Name: cargo_permissoes; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.cargo_permissoes (
    cargo_id smallint NOT NULL,
    permissao_id integer NOT NULL
);


--
-- Name: cargos; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.cargos (
    id smallint NOT NULL,
    nome character varying(40) NOT NULL
);


--
-- Name: cargos_id_seq; Type: SEQUENCE; Schema: gestoes; Owner: -
--

CREATE SEQUENCE gestoes.cargos_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cargos_id_seq; Type: SEQUENCE OWNED BY; Schema: gestoes; Owner: -
--

ALTER SEQUENCE gestoes.cargos_id_seq OWNED BY gestoes.cargos.id;


--
-- Name: migrations; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: gestoes; Owner: -
--

CREATE SEQUENCE gestoes.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: gestoes; Owner: -
--

ALTER SEQUENCE gestoes.migrations_id_seq OWNED BY gestoes.migrations.id;


--
-- Name: notificacoes; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.notificacoes (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    ordem_servico_id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notificacoes_id_seq; Type: SEQUENCE; Schema: gestoes; Owner: -
--

CREATE SEQUENCE gestoes.notificacoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: gestoes; Owner: -
--

ALTER SEQUENCE gestoes.notificacoes_id_seq OWNED BY gestoes.notificacoes.id;


--
-- Name: permissoes; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.permissoes (
    id integer NOT NULL,
    nome character varying(120) NOT NULL,
    descricao text
);


--
-- Name: permissoes_id_seq; Type: SEQUENCE; Schema: gestoes; Owner: -
--

CREATE SEQUENCE gestoes.permissoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissoes_id_seq; Type: SEQUENCE OWNED BY; Schema: gestoes; Owner: -
--

ALTER SEQUENCE gestoes.permissoes_id_seq OWNED BY gestoes.permissoes.id;


--
-- Name: usuario_permissoes; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.usuario_permissoes (
    usuario_id bigint NOT NULL,
    permissao_id integer NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: gestoes; Owner: -
--

CREATE TABLE gestoes.usuarios (
    id bigint NOT NULL,
    nome character varying(80) NOT NULL,
    cpf character(11) NOT NULL,
    email character varying(150) NOT NULL,
    senha character varying(255) NOT NULL,
    cargo_id smallint NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    remember_token character varying(100),
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp without time zone DEFAULT now() NOT NULL,
    jti_token character varying(255),
    jti_token_created_at timestamp without time zone
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: gestoes; Owner: -
--

CREATE SEQUENCE gestoes.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: gestoes; Owner: -
--

ALTER SEQUENCE gestoes.usuarios_id_seq OWNED BY gestoes.usuarios.id;


--
-- Name: configuracoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracoes (
    chave character varying(60) NOT NULL,
    valor text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categoria id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.categoria ALTER COLUMN id SET DEFAULT nextval('core.categoria_id_seq'::regclass);


--
-- Name: historico_os id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.historico_os ALTER COLUMN id SET DEFAULT nextval('core.historico_os_id_seq'::regclass);


--
-- Name: ordem_servico_comentarios id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servico_comentarios ALTER COLUMN id SET DEFAULT nextval('core.ordem_servico_comentarios_id_seq'::regclass);


--
-- Name: ordem_servicos id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos ALTER COLUMN id SET DEFAULT nextval('core.ordem_servicos_id_seq'::regclass);


--
-- Name: prioridade id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.prioridade ALTER COLUMN id SET DEFAULT nextval('core.prioridade_id_seq'::regclass);


--
-- Name: status id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.status ALTER COLUMN id SET DEFAULT nextval('core.status_id_seq'::regclass);


--
-- Name: urgencia id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.urgencia ALTER COLUMN id SET DEFAULT nextval('core.urgencia_id_seq'::regclass);


--
-- Name: cargos id; Type: DEFAULT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargos ALTER COLUMN id SET DEFAULT nextval('gestoes.cargos_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.migrations ALTER COLUMN id SET DEFAULT nextval('gestoes.migrations_id_seq'::regclass);


--
-- Name: notificacoes id; Type: DEFAULT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.notificacoes ALTER COLUMN id SET DEFAULT nextval('gestoes.notificacoes_id_seq'::regclass);


--
-- Name: permissoes id; Type: DEFAULT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.permissoes ALTER COLUMN id SET DEFAULT nextval('gestoes.permissoes_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuarios ALTER COLUMN id SET DEFAULT nextval('gestoes.usuarios_id_seq'::regclass);


--
-- Name: categoria categoria_nome_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.categoria
    ADD CONSTRAINT categoria_nome_key UNIQUE (nome);


--
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id);


--
-- Name: historico_os historico_os_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.historico_os
    ADD CONSTRAINT historico_os_pkey PRIMARY KEY (id);


--
-- Name: ordem_servico_comentarios ordem_servico_comentarios_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servico_comentarios
    ADD CONSTRAINT ordem_servico_comentarios_pkey PRIMARY KEY (id);


--
-- Name: ordem_servicos ordem_servicos_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT ordem_servicos_pkey PRIMARY KEY (id);


--
-- Name: prioridade prioridade_nome_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.prioridade
    ADD CONSTRAINT prioridade_nome_key UNIQUE (nome);


--
-- Name: prioridade prioridade_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.prioridade
    ADD CONSTRAINT prioridade_pkey PRIMARY KEY (id);


--
-- Name: status status_nome_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.status
    ADD CONSTRAINT status_nome_key UNIQUE (nome);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id);


--
-- Name: ordem_servicos uq_ordem_codigo; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT uq_ordem_codigo UNIQUE (codigo_rastreio);


--
-- Name: urgencia urgencia_nome_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.urgencia
    ADD CONSTRAINT urgencia_nome_key UNIQUE (nome);


--
-- Name: urgencia urgencia_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.urgencia
    ADD CONSTRAINT urgencia_pkey PRIMARY KEY (id);


--
-- Name: cargo_permissoes cargo_permissoes_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargo_permissoes
    ADD CONSTRAINT cargo_permissoes_pkey PRIMARY KEY (cargo_id, permissao_id);


--
-- Name: cargos cargos_nome_key; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargos
    ADD CONSTRAINT cargos_nome_key UNIQUE (nome);


--
-- Name: cargos cargos_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargos
    ADD CONSTRAINT cargos_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- Name: permissoes permissoes_nome_key; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.permissoes
    ADD CONSTRAINT permissoes_nome_key UNIQUE (nome);


--
-- Name: permissoes permissoes_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.permissoes
    ADD CONSTRAINT permissoes_pkey PRIMARY KEY (id);


--
-- Name: usuario_permissoes usuario_permissoes_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuario_permissoes
    ADD CONSTRAINT usuario_permissoes_pkey PRIMARY KEY (usuario_id, permissao_id);


--
-- Name: usuarios usuarios_cpf_key; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuarios
    ADD CONSTRAINT usuarios_cpf_key UNIQUE (cpf);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: configuracoes configuracoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracoes
    ADD CONSTRAINT configuracoes_pkey PRIMARY KEY (chave);


--
-- Name: gin_os_descricao; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX gin_os_descricao ON core.ordem_servicos USING gin (descricao public.gin_trgm_ops);


--
-- Name: gin_os_titulo; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX gin_os_titulo ON core.ordem_servicos USING gin (titulo public.gin_trgm_ops);


--
-- Name: idx_comentarios_os_id; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_comentarios_os_id ON core.ordem_servico_comentarios USING btree (ordem_servico_id);


--
-- Name: idx_comentarios_user_id; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_comentarios_user_id ON core.ordem_servico_comentarios USING btree (usuario_id);


--
-- Name: idx_historico_criado; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_historico_criado ON core.historico_os USING btree (criado_em DESC);


--
-- Name: idx_historico_os; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_historico_os ON core.historico_os USING btree (ordem_servico_id);


--
-- Name: idx_historico_usuario; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_historico_usuario ON core.historico_os USING btree (usuario_id);


--
-- Name: idx_os_ativo; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_ativo ON core.ordem_servicos USING btree (ativo);


--
-- Name: idx_os_ativos_abertos; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_ativos_abertos ON core.ordem_servicos USING btree (status_id, tecnico_id) WHERE (ativo = true);


--
-- Name: idx_os_categoria; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_categoria ON core.ordem_servicos USING btree (categoria_id);


--
-- Name: idx_os_codigo_rastreio; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_codigo_rastreio ON core.ordem_servicos USING btree (codigo_rastreio);


--
-- Name: idx_os_criado_em; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_criado_em ON core.ordem_servicos USING btree (criado_em DESC);

ALTER TABLE core.ordem_servicos CLUSTER ON idx_os_criado_em;


--
-- Name: idx_os_dashboard; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_dashboard ON core.ordem_servicos USING btree (status_id, ativo);


--
-- Name: idx_os_prioridade; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_prioridade ON core.ordem_servicos USING btree (prioridade_id);


--
-- Name: idx_os_sem_tecnico; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_sem_tecnico ON core.ordem_servicos USING btree (tecnico_id) WHERE ((tecnico_id IS NULL) AND (ativo = true));


--
-- Name: idx_os_status; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_status ON core.ordem_servicos USING btree (status_id);


--
-- Name: idx_os_tecnico; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_tecnico ON core.ordem_servicos USING btree (tecnico_id);


--
-- Name: idx_os_urgencia; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_urgencia ON core.ordem_servicos USING btree (urgencia_id);


--
-- Name: idx_os_usuario; Type: INDEX; Schema: core; Owner: -
--

CREATE INDEX idx_os_usuario ON core.ordem_servicos USING btree (usuario_id);


--
-- Name: gin_usuario_email; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX gin_usuario_email ON gestoes.usuarios USING gin (email public.gin_trgm_ops);


--
-- Name: gin_usuario_nome; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX gin_usuario_nome ON gestoes.usuarios USING gin (nome public.gin_trgm_ops);


--
-- Name: idx_usuario_ativo; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX idx_usuario_ativo ON gestoes.usuarios USING btree (ativo);


--
-- Name: idx_usuario_cargo; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX idx_usuario_cargo ON gestoes.usuarios USING btree (cargo_id);


--
-- Name: idx_usuario_criado_em; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX idx_usuario_criado_em ON gestoes.usuarios USING btree (criado_em DESC);


--
-- Name: idx_usuario_nome; Type: INDEX; Schema: gestoes; Owner: -
--

CREATE INDEX idx_usuario_nome ON gestoes.usuarios USING btree (nome);


--
-- Name: ordem_servicos trg_os_updated_at; Type: TRIGGER; Schema: core; Owner: -
--

CREATE TRIGGER trg_os_updated_at BEFORE UPDATE ON core.ordem_servicos FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: usuarios trg_usuario_updated_at; Type: TRIGGER; Schema: gestoes; Owner: -
--

CREATE TRIGGER trg_usuario_updated_at BEFORE UPDATE ON gestoes.usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: historico_os fk_historico_os; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.historico_os
    ADD CONSTRAINT fk_historico_os FOREIGN KEY (ordem_servico_id) REFERENCES core.ordem_servicos(id) ON DELETE CASCADE;


--
-- Name: historico_os fk_historico_usuario; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.historico_os
    ADD CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES gestoes.usuarios(id);


--
-- Name: ordem_servicos fk_os_categoria; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_categoria FOREIGN KEY (categoria_id) REFERENCES core.categoria(id);


--
-- Name: ordem_servicos fk_os_prioridade; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_prioridade FOREIGN KEY (prioridade_id) REFERENCES core.prioridade(id);


--
-- Name: ordem_servicos fk_os_status; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_status FOREIGN KEY (status_id) REFERENCES core.status(id);


--
-- Name: ordem_servicos fk_os_tecnico; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_tecnico FOREIGN KEY (tecnico_id) REFERENCES gestoes.usuarios(id);


--
-- Name: ordem_servicos fk_os_urgencia; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_urgencia FOREIGN KEY (urgencia_id) REFERENCES core.urgencia(id);


--
-- Name: ordem_servicos fk_os_usuario; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servicos
    ADD CONSTRAINT fk_os_usuario FOREIGN KEY (usuario_id) REFERENCES gestoes.usuarios(id);


--
-- Name: ordem_servico_comentarios ordem_servico_comentarios_ordem_servico_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servico_comentarios
    ADD CONSTRAINT ordem_servico_comentarios_ordem_servico_id_fkey FOREIGN KEY (ordem_servico_id) REFERENCES core.ordem_servicos(id) ON DELETE CASCADE;


--
-- Name: ordem_servico_comentarios ordem_servico_comentarios_parent_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servico_comentarios
    ADD CONSTRAINT ordem_servico_comentarios_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES core.ordem_servico_comentarios(id) ON DELETE SET NULL;


--
-- Name: ordem_servico_comentarios ordem_servico_comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core.ordem_servico_comentarios
    ADD CONSTRAINT ordem_servico_comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES gestoes.usuarios(id) ON DELETE CASCADE;


--
-- Name: cargo_permissoes fk_cp_cargo; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargo_permissoes
    ADD CONSTRAINT fk_cp_cargo FOREIGN KEY (cargo_id) REFERENCES gestoes.cargos(id) ON DELETE CASCADE;


--
-- Name: cargo_permissoes fk_cp_permissao; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.cargo_permissoes
    ADD CONSTRAINT fk_cp_permissao FOREIGN KEY (permissao_id) REFERENCES gestoes.permissoes(id) ON DELETE CASCADE;


--
-- Name: usuario_permissoes fk_up_permissao; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuario_permissoes
    ADD CONSTRAINT fk_up_permissao FOREIGN KEY (permissao_id) REFERENCES gestoes.permissoes(id) ON DELETE CASCADE;


--
-- Name: usuario_permissoes fk_up_usuario; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuario_permissoes
    ADD CONSTRAINT fk_up_usuario FOREIGN KEY (usuario_id) REFERENCES gestoes.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuarios fk_usuario_cargo; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.usuarios
    ADD CONSTRAINT fk_usuario_cargo FOREIGN KEY (cargo_id) REFERENCES gestoes.cargos(id);


--
-- Name: notificacoes notificacoes_ordem_servico_id_fkey; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.notificacoes
    ADD CONSTRAINT notificacoes_ordem_servico_id_fkey FOREIGN KEY (ordem_servico_id) REFERENCES core.ordem_servicos(id) ON DELETE CASCADE;


--
-- Name: notificacoes notificacoes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: gestoes; Owner: -
--

ALTER TABLE ONLY gestoes.notificacoes
    ADD CONSTRAINT notificacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES gestoes.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict y1MPvpDTaj8LEammzI8IHXUMp7J1FbmRotXgagAMxHVDTPLtCDYOFsnNDoHOAiB

--
-- PostgreSQL database dump
--

\restrict 5oKd2xbJER4kXjOOqQaoGKX7Lul1fPkQ8iIUsZXYANFuEtwegkoVVp8Qrq6Pf9y

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: categoria; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.categoria (id, nome) VALUES (1, 'Rede');
INSERT INTO core.categoria (id, nome) VALUES (2, 'Acesso');
INSERT INTO core.categoria (id, nome) VALUES (3, 'Infraestrutura');


--
-- Data for Name: prioridade; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.prioridade (id, nome) VALUES (1, 'Baixa');
INSERT INTO core.prioridade (id, nome) VALUES (2, 'Media');
INSERT INTO core.prioridade (id, nome) VALUES (3, 'Alta');
INSERT INTO core.prioridade (id, nome) VALUES (4, 'Muito Alta');


--
-- Data for Name: status; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.status (id, nome) VALUES (1, 'Novo');
INSERT INTO core.status (id, nome) VALUES (2, 'Em Andamento');
INSERT INTO core.status (id, nome) VALUES (3, 'Aguardando Peça');
INSERT INTO core.status (id, nome) VALUES (4, 'Pausado');
INSERT INTO core.status (id, nome) VALUES (5, 'Fechado');


--
-- Data for Name: urgencia; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.urgencia (id, nome) VALUES (1, 'Baixa');
INSERT INTO core.urgencia (id, nome) VALUES (2, 'Media');
INSERT INTO core.urgencia (id, nome) VALUES (3, 'Alta');
INSERT INTO core.urgencia (id, nome) VALUES (4, 'Muito Alta');


--
-- Data for Name: cargos; Type: TABLE DATA; Schema: gestoes; Owner: postgres
--

INSERT INTO gestoes.cargos (id, nome) VALUES (1, 'Admin');
INSERT INTO gestoes.cargos (id, nome) VALUES (2, 'Tecnico');
INSERT INTO gestoes.cargos (id, nome) VALUES (3, 'Usuario');


--
-- Data for Name: permissoes; Type: TABLE DATA; Schema: gestoes; Owner: postgres
--

INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (1, 'os.visualizar_tudo', 'Visualizar todas as OS');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (2, 'os.visualizar_propria', 'Visualizar apenas próprias OS');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (3, 'os.criar', 'Criar OS');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (4, 'os.editar', 'Editar OS');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (5, 'os.deletar', 'Excluir OS');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (6, 'usuarios.visualizar', 'Visualizar usuários');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (7, 'usuarios.editar', 'Editar usuários');
INSERT INTO gestoes.permissoes (id, nome, descricao) VALUES (8, 'dashboard.visualizar', 'Visualizar dashboard');


--
-- Data for Name: cargo_permissoes; Type: TABLE DATA; Schema: gestoes; Owner: postgres
--

INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 1);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 2);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 3);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 4);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 5);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 6);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 7);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (1, 8);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (2, 1);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (2, 3);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (2, 4);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (2, 8);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (3, 2);
INSERT INTO gestoes.cargo_permissoes (cargo_id, permissao_id) VALUES (3, 3);


--
-- Data for Name: configuracoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.configuracoes (chave, valor, criado_em, atualizado_em) VALUES ('sla_muito_alta', '2', '2026-05-26 13:30:46.743028', '2026-05-26 13:30:46.743028');
INSERT INTO public.configuracoes (chave, valor, criado_em, atualizado_em) VALUES ('sla_media', '8', '2026-05-26 13:30:46.743028', '2026-05-26 13:30:46.743028');
INSERT INTO public.configuracoes (chave, valor, criado_em, atualizado_em) VALUES ('sla_baixa', '24', '2026-05-26 13:30:46.743028', '2026-05-26 13:30:46.743028');
INSERT INTO public.configuracoes (chave, valor, criado_em, atualizado_em) VALUES ('nome_sistema', 'Central de Suporte Técnico', '2026-05-26 13:32:13.474732', '2026-05-26 13:32:13.474732');
INSERT INTO public.configuracoes (chave, valor, criado_em, atualizado_em) VALUES ('sla_alta', '3', '2026-05-26 13:30:46.743028', '2026-05-26 17:48:57');


--
-- Name: categoria_id_seq; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.categoria_id_seq', 7, true);


--
-- Name: prioridade_id_seq; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.prioridade_id_seq', 1, false);


--
-- Name: status_id_seq; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.status_id_seq', 6, true);


--
-- Name: urgencia_id_seq; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.urgencia_id_seq', 2, true);


--
-- Name: cargos_id_seq; Type: SEQUENCE SET; Schema: gestoes; Owner: postgres
--

SELECT pg_catalog.setval('gestoes.cargos_id_seq', 1, false);


--
-- Name: permissoes_id_seq; Type: SEQUENCE SET; Schema: gestoes; Owner: postgres
--

SELECT pg_catalog.setval('gestoes.permissoes_id_seq', 8, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 5oKd2xbJER4kXjOOqQaoGKX7Lul1fPkQ8iIUsZXYANFuEtwegkoVVp8Qrq6Pf9y


-- Criação do usuário Admin padrão (Senha: 'password')
INSERT INTO gestoes.usuarios (nome, cpf, email, senha, cargo_id, ativo, criado_em, atualizado_em) VALUES ('Admin Padrão', '00000000000', 'admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, true, NOW(), NOW()) ON CONFLICT (cpf) DO NOTHING;
