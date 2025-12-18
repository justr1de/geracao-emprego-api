-- =============================================================================
-- SCHEMA DO BANCO DE DADOS - GERAÇÃO EMPREGO
-- Governo do Estado de Rondônia
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA: empresas
-- =============================================================================
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(2) DEFAULT 'RO',
    setor VARCHAR(100),
    sobre TEXT,
    logo_url TEXT,
    banner_url TEXT,
    ativa BOOLEAN DEFAULT true,
    verificada BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: candidatos (currículos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS candidatos (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    genero VARCHAR(50),
    etnia VARCHAR(50),
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cep VARCHAR(10),
    rua VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2) DEFAULT 'RO',
    sobre_mim TEXT,
    foto_url TEXT,
    pretensao_salarial DECIMAL(10,2),
    disponibilidade_viagem BOOLEAN DEFAULT false,
    possui_cnh BOOLEAN DEFAULT false,
    tipo_cnh VARCHAR(10),
    possui_veiculo BOOLEAN DEFAULT false,
    pcd BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: vagas
-- =============================================================================
CREATE TABLE IF NOT EXISTS vagas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    cidade VARCHAR(100),
    tipo VARCHAR(50), -- Tempo integral, Meio período, Estágio, etc
    salario DECIMAL(10,2),
    num_vagas INTEGER DEFAULT 1,
    requisitos TEXT,
    beneficios TEXT,
    status VARCHAR(20) DEFAULT 'aberta', -- aberta, encerrada, pausada
    inscritos INTEGER DEFAULT 0,
    visualizacoes INTEGER DEFAULT 0,
    data_expiracao DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: candidaturas
-- =============================================================================
CREATE TABLE IF NOT EXISTS candidaturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vaga_id UUID REFERENCES vagas(id) ON DELETE CASCADE,
    candidato_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_analise, aprovado, reprovado, contratado
    mensagem TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vaga_id, candidato_id)
);

-- =============================================================================
-- TABELA: cursos
-- =============================================================================
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    descricao TEXT,
    cidade VARCHAR(100),
    modalidade VARCHAR(50), -- Presencial, Online, Híbrido
    carga_horaria VARCHAR(50),
    custo VARCHAR(50) DEFAULT 'Grátis',
    vagas INTEGER,
    data_inscricao DATE,
    data_inicio DATE,
    organizador VARCHAR(255),
    imagem_url TEXT,
    requisitos TEXT,
    publico_alvo TEXT,
    inscritos INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: editais
-- =============================================================================
CREATE TABLE IF NOT EXISTS editais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50),
    titulo VARCHAR(255) NOT NULL,
    orgao VARCHAR(255),
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'Aberto', -- Aberto, Encerrado
    modalidade VARCHAR(50),
    municipios JSONB, -- Array de municípios
    cursos JSONB, -- Array de cursos oferecidos
    links JSONB, -- Array de links (nome, url)
    imagem_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: habilidades (para currículos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS habilidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES candidatos(user_id) ON DELETE CASCADE,
    categoria VARCHAR(100),
    nome VARCHAR(100) NOT NULL,
    nivel VARCHAR(50), -- Básico, Intermediário, Avançado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: experiencias (para currículos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS experiencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES candidatos(user_id) ON DELETE CASCADE,
    empresa VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    atual BOOLEAN DEFAULT false,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: graduacoes (para currículos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS graduacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID REFERENCES candidatos(user_id) ON DELETE CASCADE,
    instituicao VARCHAR(255) NOT NULL,
    curso VARCHAR(255) NOT NULL,
    nivel VARCHAR(100), -- Técnico, Superior, Pós-graduação, etc
    data_inicio DATE,
    data_fim DATE,
    cursando BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: notificacoes
-- =============================================================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(50), -- vaga, candidatura, sistema, etc
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    link TEXT,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: logs (auditoria)
-- =============================================================================
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tipo VARCHAR(50), -- login, logout, cadastro, alteracao, etc
    descricao TEXT,
    dados JSONB,
    ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TABELA: users (extensão do auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) DEFAULT 'candidato', -- candidato, empresa, admin
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_vagas_cidade ON vagas(cidade);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga ON candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_candidato ON candidaturas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_cidade ON cursos(cidade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON logs(tipo);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE habilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública
CREATE POLICY "Vagas são públicas para leitura" ON vagas FOR SELECT USING (true);
CREATE POLICY "Empresas são públicas para leitura" ON empresas FOR SELECT USING (true);
CREATE POLICY "Cursos são públicos para leitura" ON cursos FOR SELECT USING (true);
CREATE POLICY "Editais são públicos para leitura" ON editais FOR SELECT USING (true);

-- Políticas para candidatos (currículos)
CREATE POLICY "Candidatos podem ver seus próprios dados" ON candidatos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidatos podem editar seus próprios dados" ON candidatos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Candidatos podem inserir seus próprios dados" ON candidatos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Empresas podem ver candidatos" ON candidatos FOR SELECT USING (true);

-- Políticas para candidaturas
CREATE POLICY "Candidatos podem ver suas candidaturas" ON candidaturas FOR SELECT USING (auth.uid() = candidato_id);
CREATE POLICY "Candidatos podem criar candidaturas" ON candidaturas FOR INSERT WITH CHECK (auth.uid() = candidato_id);
CREATE POLICY "Candidatos podem deletar suas candidaturas" ON candidaturas FOR DELETE USING (auth.uid() = candidato_id);

-- Políticas para notificações
CREATE POLICY "Usuários podem ver suas notificações" ON notificacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas notificações" ON notificacoes FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- FUNÇÕES E TRIGGERS
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidatos_updated_at BEFORE UPDATE ON candidatos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vagas_updated_at BEFORE UPDATE ON vagas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidaturas_updated_at BEFORE UPDATE ON candidaturas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON editais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
