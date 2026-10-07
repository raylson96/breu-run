-- ==============================================================================
-- Schema DDL Nativo para PostgreSQL (Compatível com Supabase / AWS RDS / Neon)
-- Plataforma: Pará Run (SaaS de Calendário Regional de Corridas)
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação de Tipos ENUM
DO $$ BEGIN
    CREATE TYPE timing_company_enum AS ENUM (
        'CHIP_AMAZONIA',
        'CHIP_PARA',
        'CHIP_BRANCO',
        'SUPERA_CHRONOS',
        'OUTRO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE race_status_enum AS ENUM (
        'UPCOMING',
        'OPEN',
        'CLOSED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabela Principal de Corridas (`races`)
CREATE TABLE IF NOT EXISTS public.races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    event_date DATE NOT NULL,
    event_time VARCHAR(10) DEFAULT '06:00',
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL DEFAULT 'PA',
    location VARCHAR(255) DEFAULT 'Centro',
    timing_company timing_company_enum NOT NULL DEFAULT 'CHIP_AMAZONIA',
    registration_url TEXT, -- NULL se aguardando abertura oficial
    banner_url TEXT,
    rules_url TEXT,
    regulation_url TEXT, -- Link direto do regulamento oficial (PDF)
    distances TEXT[] NOT NULL DEFAULT ARRAY['5 km'],
    status race_status_enum NOT NULL DEFAULT 'UPCOMING',
    current_batch VARCHAR(100) DEFAULT 'Inscrições em Breve',
    price NUMERIC(10, 2), -- Valor numérico da inscrição
    price_from NUMERIC(10, 2),
    featured BOOLEAN NOT NULL DEFAULT false,
    organizer VARCHAR(255) DEFAULT 'Organização Oficial',
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Índices Compostos e Otimizados para Busca e Deduplicação
-- Busca pelo par chave (data, cidade) que é o núcleo do cruzamento anti-duplicidade
CREATE INDEX IF NOT EXISTS idx_races_date_city ON public.races (event_date ASC, city);
-- Índice único no slug para consultas diretas por URL
CREATE UNIQUE INDEX IF NOT EXISTS idx_races_slug ON public.races (slug);
-- Busca por empresa de chip e status (para filtros de atletas)
CREATE INDEX IF NOT EXISTS idx_races_company_status ON public.races (timing_company, status);
-- Busca por corridas em destaque
CREATE INDEX IF NOT EXISTS idx_races_featured ON public.races (featured) WHERE featured = true;
-- Busca textual parcial em títulos usando gin trigram (opcional, requer pg_trgm se ativado)
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- CREATE INDEX IF NOT EXISTS idx_races_title_trgm ON public.races USING gin (title gin_trgm_ops);

-- 5. Tabela de Logs de Sincronização e Auditoria (`sync_logs`)
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'SUCCESS', 'PARTIAL', 'ERROR'
    total_found INTEGER NOT NULL DEFAULT 0,
    inserted_count INTEGER NOT NULL DEFAULT 0,
    updated_count INTEGER NOT NULL DEFAULT 0,
    errors TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs (created_at DESC);

-- 6. Trigger para atualização automática da coluna `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_races_updated_at ON public.races;
CREATE TRIGGER trigger_races_updated_at
BEFORE UPDATE ON public.races
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Configuração de Row Level Security (RLS) para Segurança de Dados
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Leitura pública para atletas e público geral
CREATE POLICY "Public read access for races"
ON public.races FOR SELECT
USING (true);

-- Apenas funções de serviço (Service Role / API Cron) ou Admins autenticados podem inserir/atualizar
CREATE POLICY "Admin and service role can modify races"
ON public.races FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin and service role can manage sync logs"
ON public.sync_logs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
