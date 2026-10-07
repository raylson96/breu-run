-- ==============================================================================
-- Schema do Banco de Dados - Pará Run (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Tabela Principal de Corridas
CREATE TABLE IF NOT EXISTS public.corridas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    organizador VARCHAR(255) NOT NULL,
    data_evento DATE NOT NULL,
    horario_largada TIME NOT NULL DEFAULT '06:00:00',
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'PA',
    local_largada VARCHAR(255) NOT NULL,
    distancias TEXT[] NOT NULL DEFAULT ARRAY['5 km'],
    empresa_chip VARCHAR(100) NOT NULL, -- 'Chip Amazônia', 'Chip Breu Branco', 'Chip Pará', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'soon', 'closed')),
    link_inscricao TEXT NOT NULL,
    link_regulamento TEXT,
    destaque BOOLEAN NOT NULL DEFAULT false,
    preco_a_partir NUMERIC(10, 2),
    lote_atual VARCHAR(100) DEFAULT '1º Lote',
    prazo_lote VARCHAR(50),
    selo_destaque VARCHAR(100),
    descricao TEXT,
    itens_kit TEXT[] DEFAULT ARRAY['Camiseta dry fit', 'Medalha finisher', 'Número de peito com chip'],
    premiacao TEXT,
    altimetria TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de Alta Performance para Buscas no App do Atleta
CREATE INDEX IF NOT EXISTS idx_corridas_data ON public.corridas (data_evento ASC);
CREATE INDEX IF NOT EXISTS idx_corridas_cidade ON public.corridas (cidade);
CREATE INDEX IF NOT EXISTS idx_corridas_status ON public.corridas (status);
CREATE INDEX IF NOT EXISTS idx_corridas_destaque ON public.corridas (destaque);
CREATE INDEX IF NOT EXISTS idx_corridas_chip ON public.corridas (empresa_chip);

-- 2. Tabela de Captação de Atletas para Alertas de WhatsApp / Notificações
CREATE TABLE IF NOT EXISTS public.alertas_atletas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefone VARCHAR(30) NOT NULL,
    cidade_interesse VARCHAR(100) NOT NULL DEFAULT 'Todas',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_alertas_cidade ON public.alertas_atletas (cidade_interesse);

-- 3. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_atletas ENABLE ROW LEVEL SECURITY;

-- Leitura pública irrestrita para atletas consultarem as corridas
CREATE POLICY "Atletas podem visualizar corridas" 
ON public.corridas FOR SELECT 
USING (true);

-- Atletas podem se cadastrar na lista de alertas
CREATE POLICY "Atletas podem registrar número para alerta" 
ON public.alertas_atletas FOR INSERT 
WITH CHECK (true);

-- Apenas administradores autenticados podem inserir/editar/excluir corridas
CREATE POLICY "Admins podem gerenciar corridas" 
ON public.corridas FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
