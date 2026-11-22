-- ==============================================================================
-- DEFENSA TI - Esquema de Base de Datos PostgreSQL / Supabase
-- SaaS de Monitoreo Continuo, Auditoría Perimetral y Regresiones de Seguridad
-- ==============================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLA: monitored_domains
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitored_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Referencia al usuario auth.users o ID de cliente
    domain VARCHAR(255) NOT NULL,
    industry VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (industry IN ('retail', 'fintech', 'banca', 'salud', 'educacion', 'tecnologia', 'general')),
    frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    last_score INTEGER CHECK (last_score >= 0 AND last_score <= 100),
    alert_email VARCHAR(255),
    webhook_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_monitored_domains_user_id ON monitored_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_domains_active ON monitored_domains(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_monitored_domains_user_domain ON monitored_domains(user_id, domain);

-- ------------------------------------------------------------------------------
-- 2. TABLA: scan_history
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES monitored_domains(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    ssl_days_left INTEGER NOT NULL DEFAULT 0,
    ttfb_ms INTEGER NOT NULL DEFAULT 0,
    tls_version VARCHAR(50) NOT NULL DEFAULT 'TLSv1.2',
    server_ip VARCHAR(64) NOT NULL DEFAULT '0.0.0.0',
    asn VARCHAR(120) NOT NULL DEFAULT 'Desconocido',
    waf_detected VARCHAR(100) NOT NULL DEFAULT 'Ninguno',
    vectors JSONB NOT NULL DEFAULT '{"anti_phishing": 1, "web_encryption": 1, "network_exposure": 1}'::jsonb,
    checks_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para recuperación de serie de tiempo y diff engine
CREATE INDEX IF NOT EXISTS idx_scan_history_domain_created ON scan_history(domain_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON scan_history(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. TABLA: alerts_log
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES monitored_domains(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('SCORE_DROP', 'SSL_EXPIRING', 'DNS_CHANGE', 'IP_CHANGE')),
    diff_summary TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para logs de alertas
CREATE INDEX IF NOT EXISTS idx_alerts_log_domain_id ON alerts_log(domain_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_sent_at ON alerts_log(sent_at DESC);

-- ------------------------------------------------------------------------------
-- 4. TABLA ADICIONAL: industry_benchmarks (Referencia calibrada)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    industry VARCHAR(50) PRIMARY KEY,
    average NUMERIC(5, 2) NOT NULL,
    median NUMERIC(5, 2) NOT NULL,
    percentile_75 NUMERIC(5, 2) NOT NULL,
    sample_size INTEGER NOT NULL DEFAULT 50,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserción inicial de benchmarks calibrados (Perú / LATAM 2026)
INSERT INTO industry_benchmarks (industry, average, median, percentile_75, sample_size)
VALUES
    ('banca', 82.50, 85.00, 88.00, 40),
    ('fintech', 79.20, 82.00, 86.00, 35),
    ('retail', 68.40, 70.00, 78.00, 50),
    ('tecnologia', 74.80, 75.00, 82.00, 45),
    ('educacion', 52.30, 50.00, 65.00, 40),
    ('salud', 58.10, 60.00, 70.00, 35),
    ('general', 67.50, 68.00, 76.00, 245)
ON CONFLICT (industry) DO UPDATE
SET average = EXCLUDED.average,
    median = EXCLUDED.median,
    percentile_75 = EXCLUDED.percentile_75,
    sample_size = EXCLUDED.sample_size,
    updated_at = TIMEZONE('utc'::text, NOW());

-- ------------------------------------------------------------------------------
-- POLÍTICAS RLS (Row Level Security para Supabase)
-- ------------------------------------------------------------------------------
ALTER TABLE monitored_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas de lectura para benchmarks públicos
CREATE POLICY "Lectura pública de benchmarks" ON industry_benchmarks FOR SELECT USING (true);

-- Políticas para monitored_domains (Usuarios autenticados gestionan sus dominios)
CREATE POLICY "Usuarios ven sus propios dominios" ON monitored_domains
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus propios dominios" ON monitored_domains
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus propios dominios" ON monitored_domains
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para scan_history
CREATE POLICY "Usuarios ven el historial de sus dominios" ON scan_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM monitored_domains
            WHERE monitored_domains.id = scan_history.domain_id
            AND monitored_domains.user_id = auth.uid()
        )
    );

-- Políticas para alerts_log
CREATE POLICY "Usuarios ven alertas de sus dominios" ON alerts_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM monitored_domains
            WHERE monitored_domains.id = alerts_log.domain_id
            AND monitored_domains.user_id = auth.uid()
        )
    );
