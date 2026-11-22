'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Server,
  Zap,
  Globe2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  GitCompare,
  ExternalLink,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from 'react-simple-maps';
import {
  ScanApiResponse,
  ResilienceVectors,
  AuditCategory,
  IndustryBenchmark,
  ScoreHistoryPoint,
  IndustrySector
} from '@/types/security';
import EnterpriseThreatMatrix from '@/components/dashboard/EnterpriseThreatMatrix';

interface HighDensityDashboardProps {
  data: ScanApiResponse;
  onCompareClick?: () => void;
  onSectorChange?: (sector: IndustrySector) => void;
}

const GEO_URL = '/world-110m.json';

const subscribeNoop = () => () => {};

export default function HighDensitySecurityDashboard({
  data,
  onCompareClick,
  onSectorChange
}: HighDensityDashboardProps) {
  // false en el servidor y true en el navegador, sin setState dentro de un efecto
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Cabeceras HTTP': true,
    'Seguridad de Correo': true,
    'Certificado y Cifrado': true,
    'Exposición Perimetral y WAF': true
  });
  const [snippetServerTab, setSnippetServerTab] = useState<Record<string, 'nginx' | 'apache' | 'cloudflare'>>({});
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2200);
  };

  // Coordenadas para el mapa
  const auditorCoords: [number, number] | null = data.auditor_location ? [data.auditor_location.lon, data.auditor_location.lat] : null;
  const targetCoords: [number, number] | null =
    data.location.lat != null && data.location.lon != null ? [data.location.lon, data.location.lat] : null;

  // Cálculo de color de score
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  // Renderizador de escudos (1 a 5)
  const renderShieldRating = (rating: number, max: number = 5) => {
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < rating;
          return (
            <div
              key={i}
              className={`p-1.5 rounded transition-all ${
                filled
                  ? 'bg-amber-400/20 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.35)]'
                  : 'bg-[#181818] text-[#333333]'
              }`}
            >
              <Shield className="w-4 h-4 fill-current stroke-current" />
            </div>
          );
        })}
        <span className="ml-2 font-mono text-sm font-semibold text-[#E5E5E5]">
          {rating}/5
        </span>
      </div>
    );
  };

  // Datos para el gráfico de área
  const historyData = useMemo(() => data.history ?? [], [data.history]);

  return (
    <div className="w-full bg-[#0A0A0A] text-[#E5E5E5] font-sans rounded-xl border border-[#222222] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* =========================================================================
          CABECERA SUPERIOR DEL AUDITOR & DOMINIO AUDITADO
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                {data.domain}
              </h1>
              <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getScoreColor(data.score)}`}>
                GRADO {data.grade}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5 flex items-center gap-2">
              <span>Auditoría perimetral continua</span>
              <span>•</span>
              <span>Motor DEFENSA TI 2.0</span>
              <span>•</span>
              <span className="font-mono text-[#A3A3A3]">{data.scannedAt ? new Date(data.scannedAt).toLocaleTimeString('es-PE') : 'En vivo'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onCompareClick && (
            <button
              onClick={onCompareClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2C2C2C] text-xs font-semibold text-[#E5E5E5] transition-all hover:border-[#3E3E3E]"
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span>Compare</span>
            </button>
          )}

          {data.benchmark && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono">
              <span className="text-[#737373]">Sector:</span>
              <span className="text-amber-400 font-semibold uppercase">{data.benchmark.industry}</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          FILA SUPERIOR: PANEL IZQUIERDO (SCORE + BENCHMARK) & PANEL DERECHO (MAPA)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL SUPERIOR IZQUIERDO: SCORE + MÉTRICAS APILADAS + HISTORIAL (7 Cols) */}
        <div className="lg:col-span-7 bg-[#111111] rounded-xl border border-[#222222] p-5 sm:p-6 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Índice Global de Seguridad Perimetral
              </span>
              <span className="text-[11px] font-mono text-[#666666]">
                Escala RFC / OWASP (0-100)
              </span>
            </div>

            {/* Score tipográfico gigante y 3 métricas apiladas a su derecha */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mt-5">
              
              {/* Score Gigante */}
              <div className="sm:col-span-6 flex flex-col items-start justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white font-mono">
                    {data.score}
                  </span>
                  <span className="text-2xl sm:text-3xl font-semibold text-[#555555] font-mono">
                    / 100
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getScoreBadgeBg(data.score) }}
                  />
                  <span className="text-xs font-medium text-[#A3A3A3]">
                    {data.score >= 85
                      ? 'Nivel de Blindaje Óptimo'
                      : data.score >= 70
                      ? 'Postura Aceptable con Fugas'
                      : 'Perímetro Críticamente Expuesto'}
                  </span>
                </div>
              </div>

              {/* 3 Métricas Apiladas a la Derecha */}
              <div className="sm:col-span-6 flex flex-col gap-2.5 border-t sm:border-t-0 sm:border-l border-[#222222] pt-4 sm:pt-0 sm:pl-6">
                
                {/* 1. SSL Expira en */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161616] border border-[#222222]">
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SSL Expira en:</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    data.ssl_days_left <= 15 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {data.ssl_days_left > 0 ? `${data.ssl_days_left} días` : 'Expirado / Inválido'}
                  </span>
                </div>

                {/* 2. Latencia TTFB */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161616] border border-[#222222]">
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Latencia TTFB:</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    {data.ttfb_ms == null ? 'N/D' : `${data.ttfb_ms} ms`}
                  </span>
                </div>

                {/* 3. Protocolo */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161616] border border-[#222222]">
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Protocolo:</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {data.tls_version || 'N/D'}
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* Gráfico de Área con Recharts y ReferenceLine del Percentil 75 */}
          <div className="mt-4 pt-4 border-t border-[#1C1C1C]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#888888] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                Historial de Score vs Percentil 75 Sectorial
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-semibold">
                P75 Sector: {data.benchmark?.percentile_75 ?? 76} pts
              </span>
            </div>

            <div className="w-full h-44">
              {mounted && historyData.length < 2 && (
                <p className="h-full flex items-center justify-center text-xs font-mono text-[#888888]">N/D: aún no hay mediciones de días anteriores.</p>
              )}
              {mounted && historyData.length >= 2 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#444444"
                      tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#262626' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#444444"
                      tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#262626' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161616',
                        borderColor: '#333333',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#EDEDED',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      formatter={(val: unknown) => [`${val} puntos`, 'Puntaje']}
                      labelStyle={{ color: '#999999', fontFamily: 'monospace' }}
                    />
                    {/* Línea horizontal del Percentil 75 del Sector */}
                    <ReferenceLine
                      y={data.benchmark?.percentile_75 ?? 76}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Percentil 75 del Sector',
                        fill: '#F59E0B',
                        fontSize: 10,
                        position: 'insideTopRight',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#scoreAreaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* PANEL SUPERIOR DERECHO: MAPA VECTORIAL DE INFRAESTRUCTURA + METADATOS (5 Cols) */}
        <div className="lg:col-span-5 bg-[#111111] rounded-xl border border-[#222222] p-5 sm:p-6 flex flex-col justify-between space-y-4">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                Telemetría Geográfica e Infraestructura
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80">
                Nodo Auditor ↔ Servidor
              </span>
            </div>

            {/* Mapa react-simple-maps Oscuro */}
            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-[#0D0D0D] border border-[#222222] mt-4 flex items-center justify-center">
              {mounted && (
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{
                    scale: 130,
                    center: [0, 10]
                  }}
                  width={400}
                  height={220}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#181818"
                          stroke="#2A2A2A"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { fill: '#222222', outline: 'none' },
                            pressed: { outline: 'none' }
                          } as unknown as React.CSSProperties}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Arco / Línea entre DigitalOcean Auditor y Servidor Destino */}
                  {auditorCoords && targetCoords && <Line
                    from={auditorCoords}
                    to={targetCoords}
                    stroke="#F6821F"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                  />}

                  {/* Marcador Nodo Auditor (DigitalOcean) */}
                  {auditorCoords && <Marker coordinates={auditorCoords}>
                    <circle r={4.5} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
                    <circle r={8} fill="#3B82F6" opacity={0.3} className="animate-ping" />
                  </Marker>}

                  {/* Marcador Servidor Destino */}
                  {targetCoords && <Marker coordinates={targetCoords}>
                    <circle r={5} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                    <circle r={10} fill="#10B981" opacity={0.4} className="animate-pulse" />
                  </Marker>}
                </ComposableMap>
              )}

              {/* Leyenda Flotante sobre el mapa */}
              <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-[#2A2A2A] text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[#A3A3A3]">{auditorCoords ? 'Auditor' : 'Auditor: N/D'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[#A3A3A3]">Destino</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Metadatos Limpios */}
          <div className="space-y-2 pt-2 border-t border-[#1C1C1C] text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
              <span className="text-[#737373]">IP Resuelta:</span>
              <span className="font-mono text-white font-semibold">
                {data.server_ip || 'N/D'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
              <span className="text-[#737373]">Proveedor / ASN:</span>
              <span className="font-mono text-[#D4D4D4] max-w-[210px] truncate text-right" title={data.asn}>
                {data.asn || 'AS Desconocido'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
              <span className="text-[#737373]">WAF Detectado:</span>
              <span className={`font-mono font-semibold ${
                data.waf_detected && data.waf_detected !== 'Ninguno' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {data.waf_detected || 'Ninguno'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#737373]">Ubicación del Servidor:</span>
              <span className="text-[#E5E5E5] font-medium">
                {data.location.city ? `${data.location.city}, ` : ''}{data.location.country}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          BARRA CENTRAL DE RESILIENCIA POR VECTOR (3 BLOQUES - ESCALA 1 A 5)
      ========================================================================= */}
      <div className="bg-[#111111] rounded-xl border border-[#222222] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Barra de Resiliencia Perimetral por Vector
            </h2>
          </div>
          <span className="text-xs font-mono text-[#737373]">
            Escala de Madurez 1 - 5
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Vector 1: Anti-Phishing (SPF / DMARC) */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#A3A3A3] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Anti-Phishing
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#202020] text-[#888888]">
                  SPF / DMARC
                </span>
              </div>
              <p className="text-[11px] text-[#737373]">
                Mitigación de spoofing y secuestro de identidad en el despacho corporativo.
              </p>
            </div>
            <div>
              {renderShieldRating(data.vectors.anti_phishing)}
            </div>
          </div>

          {/* Vector 2: Cifrado Web (SSL / TLS / HSTS) */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#A3A3A3] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Cifrado Web
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#202020] text-[#888888]">
                  SSL / TLS / HSTS
                </span>
              </div>
              <p className="text-[11px] text-[#737373]">
                Defensa contra espionaje en tránsito y ataques de degradación MITM.
              </p>
            </div>
            <div>
              {renderShieldRating(data.vectors.web_encryption)}
            </div>
          </div>

          {/* Vector 3: Exposición de Red (Cabeceras / WAF) */}
          <div className="p-4 rounded-lg bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#A3A3A3] flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  Exposición de Red
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#202020] text-[#888888]">
                  Cabeceras / WAF
                </span>
              </div>
              <p className="text-[11px] text-[#737373]">
                Bloqueo de XSS, Clickjacking, inyecciones L7 y ocultamiento del origen.
              </p>
            </div>
            <div>
              {renderShieldRating(data.vectors.network_exposure)}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MATRIZ DE AMENAZAS EMPRESARIALES (RANSOMWARE, DDOS Y GRADO BANCARIO)
      ========================================================================= */}
      <EnterpriseThreatMatrix
        ransomware={data.ransomware}
        ddos={data.ddos}
        banking={data.banking}
        domain={data.domain}
        score={data.score}
        grade={data.grade}
        wafDetected={data.waf_detected}
      />

      {/* =========================================================================
          ACORDEONES INFERIORES DE AUDITORÍA DETALLADA Y REMEDIACIÓN
      ========================================================================= */}
      <div className="bg-[#111111] rounded-xl border border-[#222222] p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Desglose de Hallazgos y Remedición Técnica Exacta
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Haz clic en cada categoría para ver las directivas de corrección para Nginx, Apache y Cloudflare.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {data.categories && data.categories.map((category) => {
            const isOpen = openCategories[category.name] ?? false;
            const isAllPassed = category.passed === category.total;

            return (
              <div
                key={category.name}
                className="rounded-lg border border-[#242424] bg-[#141414] overflow-hidden transition-colors"
              >
                {/* Cabecera del Acordeón */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-4 py-3.5 flex items-center justify-between bg-[#161616] hover:bg-[#1A1A1A] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isAllPassed ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className="font-mono text-sm font-semibold text-white">
                      {category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      isAllPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {category.passed} de {category.total} Superados
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#737373]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#737373]" />
                    )}
                  </div>
                </button>

                {/* Contenido Desplegable */}
                {isOpen && (
                  <div className="p-4 space-y-4 border-t border-[#222222]">
                    {category.items.map((item, idx) => {
                      const itemKey = `${category.name}-${idx}`;
                      const activeTab = snippetServerTab[itemKey] || 'nginx';

                      return (
                        <div
                          key={item.name}
                          className="p-3.5 rounded-lg bg-[#181818] border border-[#262626] space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              {item.status === 'pass' ? (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : item.status === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <h4 className="text-xs font-semibold text-white">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-[#8A8A8A] mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded shrink-0 ${
                              item.status === 'pass'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : item.status === 'warning'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {item.status === 'pass' ? 'Válido' : item.status === 'warning' ? 'Advertencia' : 'Falló'}
                            </span>
                          </div>

                          {/* Snippet de Remediación (Solo si falló o tiene advertencia) */}
                          {item.remediationSnippet && item.status !== 'pass' && (
                            <div className="mt-3 pt-3 border-t border-[#242424] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono text-[#737373] flex items-center gap-1">
                                  <Info className="w-3 h-3 text-amber-400" />
                                  Regla de Corrección Sugerida:
                                </span>

                                {/* Selector de Servidor (Nginx / Apache / Cloudflare) */}
                                <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded border border-[#262626]">
                                  {(['nginx', 'apache', 'cloudflare'] as const).map((tab) => (
                                    <button
                                      key={tab}
                                      type="button"
                                      onClick={() =>
                                        setSnippetServerTab((prev) => ({
                                          ...prev,
                                          [itemKey]: tab
                                        }))
                                      }
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                                        activeTab === tab
                                          ? 'bg-[#2A2A2A] text-white font-bold'
                                          : 'text-[#666666] hover:text-[#A3A3A3]'
                                      }`}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Bloque de Código con botón de Copiar */}
                              {item.remediationSnippet[activeTab] ? (
                                <div className="relative group">
                                  <pre className="p-2.5 rounded bg-[#0D0D0D] border border-[#202020] text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                    {item.remediationSnippet[activeTab]}
                                  </pre>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(
                                        item.remediationSnippet![activeTab]!,
                                        `${itemKey}-${activeTab}`
                                      )
                                    }
                                    className="absolute top-2 right-2 p-1.5 rounded bg-[#1C1C1C] hover:bg-[#282828] border border-[#333333] text-xs text-[#A3A3A3] hover:text-white transition-all"
                                    title="Copiar snippet"
                                  >
                                    {copiedSnippet === `${itemKey}-${activeTab}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[11px] text-[#666666] italic">
                                  No se requiere configuración en {activeTab}.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
