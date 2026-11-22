'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Globe2,
  FileCode,
  Flame,
  Radio,
  ExternalLink,
  Layers,
  ShoppingBag,
  ChevronDown,
  Activity,
  CreditCard,
  Megaphone,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  WafCheckResult,
  CmsCheckResult,
  MixedContentResult,
  MalwareScanResult,
  CommercialImpactResult,
} from '@/lib/scanner/webAuditScanner';
import { isHyperscalePlatform } from '@/lib/hyperscalers';
import { P } from '@/config/catalog';

interface WebAuditCardProps {
  waf?: WafCheckResult;
  cms?: CmsCheckResult;
  mixedContent?: MixedContentResult;
  malware?: MalwareScanResult;
  commercial?: CommercialImpactResult;
  domain?: string;
  isHyperscale?: boolean;
}

export default function WebAuditCard({
  waf,
  cms,
  mixedContent,
  malware,
  commercial,
  domain,
  isHyperscale,
}: WebAuditCardProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isGiant = Boolean(isHyperscale) || (domain ? isHyperscalePlatform(domain) : false);

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!waf && !cms && !mixedContent && !malware && !commercial) return null;

  return (
    <div className="space-y-5">
      {/* 1. Alerta Crítica Visual si se detectó Malware o Inyección */}
      {malware?.isInfectedOrSuspicious && (
        <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 text-[#ff4d4d] text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/[0.03] flex items-center justify-center shrink-0 border border-white/10">
                <Flame className="w-5 h-5 text-[#ff4d4d]" />
              </div>
              <div>
                <span className="font-extrabold text-[#EDEDED] text-sm sm:text-base flex items-center gap-2">
                  🚨 Anomalía Forense en Portada ({malware.threatLevel})
                </span>
                <span className="text-[11px] text-[#ff4d4d]">
                  Firmas sospechosas o inyección activa detectada en el DOM.
                </span>
              </div>
            </div>
            <a
              href="https://wa.me/51992520336?text=Hola%20Martín,%20el%20escáner%20detectó%20indicadores%20de%20malware%20en%20mi%20web%20y%20necesito%20el%20Rescate%20Urgente."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.03] text-[#EDEDED] font-bold text-xs transition-all cursor-pointer"
            >
              <span>Rescate ({P.rescateCorporativo} - {P.rescateTienda})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => toggle('malware')}
              className="inline-flex items-center gap-1.5 text-xs text-[#ff4d4d] hover:text-[#EDEDED] font-semibold cursor-pointer"
            >
              <span>{expanded['malware'] ? 'Ocultar análisis técnico' : 'Ver firmas detectadas y solución forense'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded['malware'] ? 'rotate-180' : ''}`} />
            </button>

            {expanded['malware'] && (
              <div className="mt-2.5 space-y-2 text-[#ff4d4d] text-xs leading-relaxed animate-in fade-in-50">
                <p>{malware.description}</p>
                {malware.indicators.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#ff4d4d] bg-[#080808] p-2.5 border border-white/10">
                    {malware.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                )}
                {malware.remediation && (
                  <p className="text-[11px] text-[#ff4d4d] font-semibold">{malware.remediation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Grid de Telemetría SOC (3 Cuadrantes Gráficos tipo Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* ======================================================== */}
        {/* A. WAF & PERÍMETRO (GRÁFICO DE BARRAS DE BLINDAJE) */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 bg-[#121316] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-3.5">
            {/* Header del Cuadrante */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 flex items-center justify-center ${
                  isGiant
                    ? 'bg-white/[0.03] text-[#EDEDED]'
                    : waf?.hasWaf
                    ? 'bg-white/[0.03] text-[#EDEDED]'
                    : 'bg-white/[0.03] text-[#EDEDED]'
                }`}>
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold font-mono">
                  WAF Perimetral
                </span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                isGiant
                  ? 'bg-white/[0.03] text-[#EDEDED] border-white/10'
                  : waf?.hasWaf
                  ? 'bg-white/[0.03] text-[#EDEDED] border-white/10'
                  : 'bg-white/[0.03] text-[#EDEDED] border-white/10'
              }`}>
                {isGiant ? 'Anycast Global' : waf?.hasWaf ? 'Blindado' : 'Expuesto'}
              </span>
            </div>

            {/* Gráfico de Telemetría Visual */}
            <div className="p-3 bg-[#080808] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">Protección Anti-DDoS:</span>
                <span className={`font-bold ${
                  isGiant ? 'text-blue-300' : waf?.hasWaf ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {isGiant ? '100% Nativo (Google Cloud Armor / Edge Anycast)' : waf?.hasWaf ? '100% Activa' : '0% Sin Firewall'}
                </span>
              </div>

              {/* Barra Gráfica de Progreso */}
              <div className="w-full h-2 bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    isGiant
                      ? 'w-full '
                      : waf?.hasWaf
                      ? 'w-full bg-white/[0.03] '
                      : 'w-2 bg-white/[0.03]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                <span>{isGiant ? 'Infraestructura Propietaria' : waf?.hasWaf ? waf.provider : 'Servidor Desnudo'}</span>
                <span>{isGiant ? 'Red Anycast Multi-Región' : waf?.hasWaf ? 'Origen Enmascarado' : 'IP Directa'}</span>
              </div>
            </div>
          </div>

          {/* Desplegable de Detalles & Solución */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <button
              type="button"
              onClick={() => toggle('waf')}
              className="w-full flex items-center justify-between text-[11px] text-neutral-400 hover:text-[#EDEDED] font-medium transition-colors cursor-pointer"
            >
              <span>{expanded['waf'] ? 'Ocultar diagnóstico' : 'Desplegar detalles de WAF'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded['waf'] ? 'rotate-180 text-[#bdbdbd]' : ''}`} />
            </button>

            {expanded['waf'] && (
              <div className="text-xs text-neutral-300 leading-relaxed pt-1 space-y-2 animate-in fade-in-50">
                <p>
                  {isGiant
                    ? 'Las plataformas de hiperescala (Google, GitHub, Microsoft, Apple) cuentan con clústeres Anycast propios de mitigación DDoS a nivel de capa 3, 4 y 7 (ej. Google Cloud Armor), por lo que no requieren de un WAF comercial convencional.'
                    : waf?.details}
                </p>
                {!isGiant && !waf?.hasWaf && (
                  <a
                    href="https://wa.me/51992520336?text=Hola%20Martín,%20mi%20web%20no%20tiene%20WAF%20y%20deseo%20el%20paquete%20Blindaje%20+%20WAF%20Cloudflare%20(S/%20450)."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[#EDEDED] text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    <span>Blindaje + WAF Cloudflare ({P.blindajeWaf})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* B. ARQUITECTURA CMS & E-COMMERCE (TELEMETRÍA VISUAL) */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 bg-[#121316] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-3.5">
            {/* Header del Cuadrante */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/[0.03] text-[#EDEDED] flex items-center justify-center">
                  {cms?.isEcommerce ? <ShoppingBag className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold font-mono">
                  Stack & Plataforma
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-white/[0.03] text-[#EDEDED] border border-white/10">
                {cms?.name || 'A Medida'}
              </span>
            </div>

            {/* Gráfico de Telemetría Visual */}
            <div className="p-3 bg-[#080808] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">Detección de Versión:</span>
                <span className={`font-bold ${cms?.versionExposed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {cms?.version ? `v${cms.version} (Pública)` : 'Oculta / Segura'}
                </span>
              </div>

              {/* Indicadores Gráficos de Módulos */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                  <Activity className="w-2.5 h-2.5 text-[#bdbdbd]" />
                  {cms?.ecommercePlatform || 'Corporativo'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                  <Layers className="w-2.5 h-2.5 text-[#EDEDED]" />
                  {cms?.detectedPlugins?.length || 0} plugins
                </span>
              </div>
            </div>
          </div>

          {/* Desplegable de Detalles & Solución */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <button
              type="button"
              onClick={() => toggle('cms')}
              className="w-full flex items-center justify-between text-[11px] text-neutral-400 hover:text-[#EDEDED] font-medium transition-colors cursor-pointer"
            >
              <span>{expanded['cms'] ? 'Ocultar diagnóstico' : 'Desplegar plugins y riesgos'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded['cms'] ? 'rotate-180 text-[#bdbdbd]' : ''}`} />
            </button>

            {expanded['cms'] && (
              <div className="text-xs text-neutral-300 leading-relaxed pt-1 space-y-2 animate-in fade-in-50">
                <p>{cms?.description}</p>
                {Boolean(cms && cms.detectedPlugins && cms.detectedPlugins.length > 0) && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-neutral-400">Plugins identificados en el DOM:</span>
                    <div className="flex flex-wrap gap-1">
                      {cms!.detectedPlugins.map((plugin, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                          {plugin}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* C. INTEGRIDAD SSL & CONTENIDO MIXTO (GRÁFICO MEDIDOR) */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 bg-[#121316] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
          <div className="space-y-3.5">
            {/* Header del Cuadrante */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 flex items-center justify-center ${mixedContent?.hasMixedContent ? 'bg-white/[0.03] text-[#ff4d4d]' : 'bg-white/[0.03] text-[#EDEDED]'}`}>
                  {mixedContent?.hasMixedContent ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold font-mono">
                  Integridad Cifrado
                </span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                mixedContent?.hasMixedContent
                  ? 'bg-white/[0.03] text-[#ff4d4d] border-white/10'
                  : 'bg-white/[0.03] text-[#EDEDED] border-white/10'
              }`}>
                {mixedContent?.hasMixedContent ? 'Mixto Inseguro' : '100% Cifrado'}
              </span>
            </div>

            {/* Gráfico de Telemetría Visual */}
            <div className="p-3 bg-[#080808] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">Candado Verde:</span>
                <span className={`font-bold ${mixedContent?.hasMixedContent ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {mixedContent?.hasMixedContent ? `${mixedContent.count} Inseguros` : 'Impecable'}
                </span>
              </div>

              {/* Barra de Integridad Cifrada */}
              <div className="w-full h-2 bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    mixedContent?.hasMixedContent
                      ? 'w-2/3 bg-white/[0.03] '
                      : 'w-full bg-white/[0.03] '
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5 font-mono">
                <span>{mixedContent?.hasMixedContent ? 'Alerta en Navegadores' : 'Cero Fugas'}</span>
                <span>HTTPS Nativo</span>
              </div>
            </div>
          </div>

          {/* Desplegable de Detalles & Solución */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <button
              type="button"
              onClick={() => toggle('mixed')}
              className="w-full flex items-center justify-between text-[11px] text-neutral-400 hover:text-[#EDEDED] font-medium transition-colors cursor-pointer"
            >
              <span>{expanded['mixed'] ? 'Ocultar diagnóstico' : 'Desplegar recursos HTTP'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded['mixed'] ? 'rotate-180 text-[#bdbdbd]' : ''}`} />
            </button>

            {expanded['mixed'] && (
              <div className="text-xs text-neutral-300 leading-relaxed pt-1 space-y-2 animate-in fade-in-50">
                <p>{mixedContent?.description}</p>
                {Boolean(mixedContent && mixedContent.items && mixedContent.items.length > 0) && (
                  <div className="space-y-1 font-mono text-[10px] bg-[#080808] p-2 border border-white/5">
                    {mixedContent!.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="truncate text-[#ff4d4d]">
                        [{item.type}] {item.url}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* D. RADAR COMERCIAL: PAUTA PUBLICITARIA & PASARELAS */}
      {/* ======================================================== */}
      {commercial && (commercial.hasActiveMarketing || commercial.hasPaymentGateway) && (
        <div className="p-4 sm:p-5 bg-[#12141a] border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EDEDED] text-[#080808] flex items-center justify-center shrink-0 border border-white/20">
                <Activity className="w-4 h-4 text-[#bdbdbd]" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-[#EDEDED] text-xs sm:text-sm flex items-center gap-2">
                  <span>Radar Comercial DEFENSA TI</span>
                  {commercial.hasActiveMarketing && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10 font-mono">
                      Pauta Activa
                    </span>
                  )}
                  {commercial.hasPaymentGateway && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10 font-mono">
                      Cobro Online
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-neutral-300">
                  {commercial.summaryText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggle('commercial')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-semibold border border-white/10 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <span>{expanded['commercial'] ? 'Ocultar' : 'Ver ROI y Multas'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded['commercial'] ? 'rotate-180 text-[#bdbdbd]' : ''}`} />
            </button>
          </div>

          {expanded['commercial'] && (
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in-50">
              {commercial.hasActiveMarketing && (
                <div className="p-3 bg-[#080808] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#EDEDED] font-bold">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Inversión en Pauta Detectada</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    Plataformas: <strong>{commercial.marketingPlatforms.join(', ')}</strong>.
                  </p>
                  <p className="text-[#EDEDED] font-semibold text-[11px]">
                    Fuga estimada por alertas de seguridad: ~{commercial.estimatedMonthlyAdWastePercent}% de tus clics pagados.
                  </p>
                </div>
              )}

              {commercial.hasPaymentGateway && (
                <div className="p-3 bg-[#080808] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#EDEDED] font-bold">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pasarela de Pagos en Línea</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    Pasarelas: <strong>{commercial.paymentGateways.join(', ')}</strong>.
                  </p>
                  <p className="text-[#ff4d4d] font-semibold text-[11px]">
                    Sanciones regulatorias ANPDP (Ley N° 29733): hasta S/ {commercial.anpdpMaxPenaltySoles.toLocaleString('es-PE')} (50 UIT).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
