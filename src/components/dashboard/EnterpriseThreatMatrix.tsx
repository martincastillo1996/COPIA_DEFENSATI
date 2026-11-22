'use client';

import React, { useState } from 'react';
import {
  Skull,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Building2,
  AlertTriangle,
  Lock,
  Server,
  Terminal,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { RansomwareRiskResult, DdosResilienceResult, BankingComplianceResult } from '@/types/security';

interface EnterpriseThreatMatrixProps {
  ransomware?: RansomwareRiskResult;
  ddos?: DdosResilienceResult;
  banking?: BankingComplianceResult;
  domain?: string;
  score?: number;
  grade?: string;
  wafDetected?: string;
}

export default function EnterpriseThreatMatrix({
  ransomware,
  ddos,
  banking,
}: EnterpriseThreatMatrixProps) {
  const [activeTab, setActiveTab] = useState<'ransomware' | 'ddos' | 'banking'>('ransomware');

  // Sin medición no se deduce una matriz a partir de la nota
  if (!ransomware || !ddos || !banking) {
    return <p className="p-5 border border-[#222222] text-xs font-mono text-[#888888]">Matriz de amenazas: N/D, este informe no incluye esa medición.</p>;
  }

  const getRansomwareBadge = (level?: string) => {
    switch (level) {
      case 'CRÍTICO':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ELEVADO':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERADO':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getDdosBadge = (level?: string) => {
    switch (level) {
      case 'RESILIENTE_EMPRESARIAL':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'PROTECCION_MEDIA':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'VULNERABLE_DIRECTO':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getBankingBadge = (grade?: string) => {
    switch (grade) {
      case 'CONFORME_BANCARIO':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'OBSERVADO_FINTECH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="w-full rounded-xl bg-[#101010] border border-[#262626] p-5 sm:p-6 space-y-5 my-6">
      {/* Cabecera del Panel de Amenazas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-rose-400">
            <Skull className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-mono">
                MATRIZ DE AMENAZAS CRÍTICAS & ESTÁNDAR BANCARIO
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C1C1C] border border-[#333333] text-amber-400">
                NIST / MITRE ATT&CK
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Auditoría de precursores de secuestro de datos, vectores DDoS y cumplimiento PCI-DSS 4.0.
            </p>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center p-1 rounded-lg bg-[#161616] border border-[#242424] text-xs font-mono w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ransomware')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'ransomware'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            Secuestro (Ransomware)
          </button>
          <button
            onClick={() => setActiveTab('ddos')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'ddos'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            DDoS & Fuga IP
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'banking'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            Banca & PCI-DSS
          </button>
        </div>
      </div>

      {/* =========================================================================
          PESTAÑA 1: SECUESTRO DE DATOS (RANSOMWARE ATTACK SURFACE INDEX)
      ========================================================================= */}
      {activeTab === 'ransomware' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Tarjeta de Resumen de Riesgo */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-lg bg-[#141414] border border-[#242424] items-center">
            <div className="sm:col-span-4 flex items-center gap-3">
              <div className="text-3xl font-extrabold font-mono text-white">
                {ransomware.evaluated === false ? 'N/D' : ransomware.score}
                <span className="text-xs text-[#666666] font-normal"> / 100</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${ransomware.evaluated === false ? 'text-[#888888] border-[#333333]' : getRansomwareBadge(ransomware.level)}`}>
                {ransomware.evaluated === false ? 'NO EVALUADO' : `RIESGO ${ransomware.level}`}
              </span>
            </div>
            <div className="sm:col-span-8 text-xs text-[#A3A3A3] leading-relaxed">
              {ransomware.exposureSummary}
            </div>
          </div>

          {/* Perfil de Actores Maliciosos */}
          {ransomware.threatActorsProfile.length > 0 && (
            <div className="p-3 rounded-lg bg-[#161616] border border-[#242424] text-xs space-y-1.5">
              <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wider block">
                Perfil de Tácticas y Grupos de Amenazas Mapeados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ransomware.threatActorsProfile.map((actor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-black/60 border border-[#333333] text-[11px] font-mono text-[#D4D4D4]"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vectores MITRE ATT&CK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(ransomware.vectors).map(([key, vector]) => {
              const isExposed = vector.exposed;

              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isExposed
                      ? 'bg-rose-950/15 border-rose-900/40 text-[#E5E5E5]'
                      : 'bg-[#151515] border-[#222222] text-[#A3A3A3]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {vector.evaluated === false ? (
                        <span className="w-4 shrink-0 text-center text-[#888888]">–</span>
                      ) : isExposed ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white block">
                          {vector.mitreTechnique}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400/90">
                          MITRE {vector.mitreId}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        vector.evaluated === false
                          ? 'text-[#888888] border border-[#333333]'
                          : isExposed
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {vector.evaluated === false ? 'NO EVALUADO' : isExposed ? vector.severity : 'NO DETECTADO'}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-[#888888] leading-normal">
                    {vector.description}
                  </p>

                  {isExposed && vector.evidence.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-rose-900/30 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-rose-400">
                        Evidencia Detectada:
                      </span>
                      {vector.evidence.map((ev, i) => (
                        <p key={i} className="text-[11px] font-mono text-[#D4D4D4] pl-2 border-l border-rose-500/40">
                          {ev}
                        </p>
                      ))}
                    </div>
                  )}

                  {isExposed && (
                    <div className="mt-2 pt-1 text-[11px] text-amber-300/90 font-mono">
                      Remediación: {vector.remediation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 2: DDOS & RESILIENCIA DE DISPONIBILIDAD (ORIGIN IP LEAK)
      ========================================================================= */}
      {activeTab === 'ddos' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Tarjeta de Resumen DDoS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-lg bg-[#141414] border border-[#242424] items-center">
            <div className="sm:col-span-4 flex items-center gap-3">
              <div className="text-3xl font-extrabold font-mono text-white">
                {ddos.score}
                <span className="text-xs text-[#666666] font-normal"> / 100</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getDdosBadge(ddos.level)}`}>
                {ddos.level.replace('_', ' ')}
              </span>
            </div>
            <div className="sm:col-span-8 text-xs text-[#A3A3A3] leading-relaxed">
              {ddos.summary}
            </div>
          </div>

          {/* Alerta de Fuga de IP de Origen (WAF Bypass) */}
          {ddos.originIpLeakDetected ? (
            <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>FUGA CRÍTICA: BYPASS DE PROTECCIÓN ANTI-DDOS DETECTADO</span>
              </div>
              <p className="text-xs text-[#CCCCCC]">
                {ddos.originLeakDetails || 'El servidor web opera con IP pública directa visible sin escudo perimetral WAF/CDN.'}
              </p>
              <div className="pt-2 text-xs font-mono text-amber-400">
                Solución: Desplegar Cloudflare WAF o aislar el correo a otra IP para que la IP de la web permanezca 100% oculta.
              </div>
            </div>
          ) : ddos.wafProtected ? (
            <div className="p-3.5 rounded-lg bg-emerald-950/15 border border-emerald-900/30 flex items-center gap-3 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                IP de origen debidamente oculta tras el proxy Anycast ({ddos.wafProvider || 'WAF Activo'}). Cero fugas en registros MX o SPF.
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 flex items-center gap-3 text-xs text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Servidor web expuesto directamente sin WAF perimetral. Vulnerable a ataques de saturación volumétrica.
              </span>
            </div>
          )}

          {/* Vectores DDoS Específicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(ddos.vectors).map(([key, v]) => (
              <div key={key} className="p-3 rounded-lg bg-[#151515] border border-[#242424] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{v.mitreTechnique}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      v.status === 'RESILIENTE'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#888888]">{v.details}</p>
                {v.remediation && (
                  <p className="text-[10px] font-mono text-amber-400/90 pt-1">
                    Fix: {v.remediation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 3: BANCA, FINTECH & CUMPLIMIENTO PCI-DSS 4.0
      ========================================================================= */}
      {activeTab === 'banking' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Tarjeta de Resumen Bancario */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-lg bg-[#141414] border border-[#242424] items-center">
            <div className="sm:col-span-4 flex items-center gap-3">
              <div className="text-3xl font-extrabold font-mono text-white">
                {banking.score}
                <span className="text-xs text-[#666666] font-normal"> / 100</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getBankingBadge(banking.grade)}`}>
                {banking.grade.replace('_', ' ')}
              </span>
            </div>
            <div className="sm:col-span-8 text-xs text-[#A3A3A3] leading-relaxed">
              {banking.summary}
            </div>
          </div>

          {/* Alerta de e-Skimming / Magecart */}
          {banking.eSkimmingProtection.hasPaymentGateway && (
            <div
              className={`p-4 rounded-lg border space-y-2 ${
                banking.eSkimmingProtection.riskLevel === 'CRÍTICO'
                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                  : 'bg-emerald-950/15 border-emerald-900/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                {banking.eSkimmingProtection.riskLevel === 'CRÍTICO' ? (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>
                  Protección de Pasarela de Pagos (PCI-DSS 4.0 Requisito 6.4.3 & 11.6.1)
                </span>
              </div>
              <p className="text-xs text-[#D4D4D4]">
                {banking.eSkimmingProtection.details}
              </p>
              {banking.eSkimmingProtection.remediation && (
                <p className="text-xs font-mono text-amber-300 pt-1">
                  Acción obligatoria: {banking.eSkimmingProtection.remediation}
                </p>
              )}
            </div>
          )}

          {/* Fuga de Banners y Versiones */}
          {banking.serverLeaks.hasLeaks && (
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[#262626] space-y-2">
              <span className="text-xs font-semibold text-amber-400 block">
                Fuga de Versiones de Servidor Detectada (Server Tokens / Fingerprinting):
              </span>
              <div className="space-y-1.5">
                {banking.serverLeaks.leakedHeaders.map((leak, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-black/50 border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono"
                  >
                    <span className="text-white">
                      {leak.header}: <span className="text-rose-400">{leak.value}</span>
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      {leak.remediation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requisitos PCI-DSS Auditados */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373] block">
              Controles Verificados PCI-DSS 4.0 & NIST:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {banking.pciChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#141414] border border-[#242424] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-amber-400">
                      {check.requirement}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        check.status === 'pass'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : check.status === 'warning'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {check.status === 'pass' ? 'CUMPLE' : check.status === 'warning' ? 'OBSERVADO' : 'FALLO'}
                    </span>
                  </div>
                  <h5 className="font-semibold text-white">{check.title}</h5>
                  <p className="text-[11px] text-[#888888]">{check.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
