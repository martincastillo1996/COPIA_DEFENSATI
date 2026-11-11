'use client';

import React from 'react';
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
} from 'lucide-react';
import { WafCheckResult, CmsCheckResult, MixedContentResult, MalwareScanResult } from '@/lib/scanner/webAuditScanner';

interface WebAuditCardProps {
  waf?: WafCheckResult;
  cms?: CmsCheckResult;
  mixedContent?: MixedContentResult;
  malware?: MalwareScanResult;
}

export default function WebAuditCard({ waf, cms, mixedContent, malware }: WebAuditCardProps) {
  if (!waf && !cms && !mixedContent && !malware) return null;

  return (
    <div className="space-y-6">
      {/* 1. Alerta Crítica si se detectaron indicadores de Malware o Inyección en Portada */}
      {malware?.isInfectedOrSuspicious && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3.5 shadow-xl animate-pulse">
          <Flame className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base">
                🚨 Anomalía Forense Detectada en Portada ({malware.threatLevel})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Rescate Requerido
              </span>
            </div>
            <p className="text-rose-100 leading-relaxed">{malware.description}</p>
            {malware.indicators.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 pt-1 text-rose-200 font-mono text-[11px]">
                {malware.indicators.map((ind, i) => (
                  <li key={i}>{ind}</li>
                ))}
              </ul>
            )}
            <div className="pt-2">
              <a
                href="https://wa.me/51992520336?text=Hola%20Martín,%20el%20escáner%20detectó%20indicadores%20de%20malware/infección%20en%20mi%20web%20y%20necesito%20el%20Rescate%20Urgente."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Solicitar Rescate Forense Inmediato (S/ 380 - S/ 550)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Grid de Diagnóstico Perimetral Avanzado: WAF + CMS/E-commerce + Mixed Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* A. WAF & Blindaje Perimetral */}
        <div className="p-6 rounded-3xl bg-[#141416] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#38bdf8]" />
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Firewall WAF Perimetral
                </span>
              </div>
              {waf?.hasWaf ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Protegido
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Servidor Desnudo
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                {waf?.hasWaf ? waf.provider : 'Sin Firewall Web (Origen Expuesto)'}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{waf?.details}</p>
            </div>
          </div>

          {!waf?.hasWaf && (
            <div className="pt-2 border-t border-white/5">
              <a
                href="https://wa.me/51992520336?text=Hola%20Martín,%20mi%20web%20no%20tiene%20WAF%20y%20deseo%20el%20paquete%20Blindaje%20+%20WAF%20Cloudflare%20(S/%20450)."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#0077ed] hover:to-[#38bdf8] text-white text-xs font-bold transition-all shadow-md"
              >
                <span>Cotizar Blindaje + WAF (S/ 450)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* B. CMS & E-Commerce & Versiones */}
        <div className="p-6 rounded-3xl bg-[#141416] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cms?.isEcommerce ? (
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                ) : (
                  <FileCode className="w-4 h-4 text-[#38bdf8]" />
                )}
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  CMS & Plataforma
                </span>
              </div>
              {cms?.detected ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {cms.name || 'Detectado'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                  A Medida / Oculto
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                {cms?.name || 'Sistema Web Personalizado'}
                {cms?.version && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    v{cms.version}
                  </span>
                )}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{cms?.description}</p>
            </div>

            {Boolean(cms && cms.detectedPlugins && cms.detectedPlugins.length > 0) && (
              <div className="pt-2 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#38bdf8]" /> Plugins visibles ({cms!.detectedPlugins.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {cms!.detectedPlugins.map((plugin, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-neutral-200 font-mono"
                    >
                      {plugin}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. Contenido Mixto (Mixed Content) */}
        <div className="p-6 rounded-3xl bg-[#141416] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Integridad SSL / Mixto
                </span>
              </div>
              {mixedContent?.hasMixedContent ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {mixedContent.count} Inseguros
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  100% Cifrado
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                {mixedContent?.hasMixedContent
                  ? 'Contenido Mixto Detectado'
                  : 'Candado Verde Plenamente Confiable'}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{mixedContent?.description}</p>
            </div>

            {Boolean(mixedContent && mixedContent.items && mixedContent.items.length > 0) && (
              <div className="pt-2 space-y-1">
                <span className="text-[11px] font-semibold text-rose-300">Recursos HTTP no seguros:</span>
                <div className="space-y-1">
                  {mixedContent!.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] font-mono text-neutral-300 truncate bg-black/40 px-2 py-1 rounded border border-white/5"
                      title={item.url}
                    >
                      [{item.type}] {item.url}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
