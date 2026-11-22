'use client';

import { PortCheckResult } from '@/lib/scanner/portScanner';
import { Server, ShieldAlert, ShieldCheck, ArrowRightLeft, GitBranch } from 'lucide-react';

interface PortResultsProps {
  ports?: PortCheckResult[];
  /** Presente en el escáner público: cómo demostrar la titularidad para que se sondeen los puertos. */
  verification?: { verified: boolean; record: { host: string; value: string }; file: { url: string; content: string } };
}

export default function PortResults({ ports, verification }: PortResultsProps) {
  if (!ports || ports.length === 0) {
    if (verification && !verification.verified) {
      return (
        <div className="space-y-3 bg-neutral-900/80 border border-white/10 p-5 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Puertos: no evaluados</h3>
          <p>
            Por seguridad, solo sondeamos los puertos de un dominio cuando se demuestra que es tuyo. Publica <strong>una</strong> de estas dos pruebas y vuelve a analizar:
          </p>
          <div className="space-y-1">
            <p className="font-semibold">Opción 1 · Registro DNS TXT</p>
            <p className="font-mono break-all text-[11px] text-slate-200">Nombre: {verification.record.host}</p>
            <p className="font-mono break-all text-[11px] text-slate-200">Valor: {verification.record.value}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Opción 2 · Archivo en tu sitio</p>
            <p className="font-mono break-all text-[11px] text-slate-200">{verification.file.url}</p>
            <p className="font-mono break-all text-[11px] text-slate-200">Contenido: {verification.file.content}</p>
          </div>
          <p className="text-slate-400">También sirve publicarlo en tu dominio principal. El DNS puede tardar unos minutos en propagarse.</p>
        </div>
      );
    }
    return <p className="text-xs text-slate-400">Puertos: no evaluados en este informe.</p>;
  }

  return (
    <div className="bg-neutral-900/80 border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#EDEDED]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Inspección Perimetral de Puertos Críticos
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Zero-Downtime TCP Probe</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ports.map((p) => {
          const isPort443 = p.port === 443;
          const isPort80 = p.port === 80;
          const isPort8080 = p.port === 8080;
          const isGitSsh = p.port === 22 && p.risk === 'BAJO';

          let cardClasses = 'bg-white/5 border-white/5 text-slate-300';
          if (p.isOpen) {
            if (isPort443) {
              cardClasses = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
            } else if (isPort80) {
              cardClasses = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
            } else if (isPort8080) {
              cardClasses = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
            } else if (isGitSsh) {
              cardClasses = 'bg-white/[0.03] border-white/10 text-[#EDEDED]';
            } else {
              cardClasses = 'bg-white/[0.03] border-white/10 text-[#ff4d4d]';
            }
          }

          return (
            <div
              key={p.port}
              className={`p-3 border flex flex-col justify-between transition-all ${cardClasses}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold">
                  Puerto {p.port} &bull; {p.service}
                </span>

                {p.isOpen ? (
                  isPort443 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EDEDED]">
                      <ShieldCheck className="w-3 h-3 text-[#EDEDED]" />
                      ABIERTO (ÓPTIMO)
                    </span>
                  ) : isPort80 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EDEDED]">
                      <ArrowRightLeft className="w-3 h-3" />
                      REDIRECCIÓN (HTTP)
                    </span>
                  ) : isPort8080 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EDEDED]">
                      <ArrowRightLeft className="w-3 h-3" />
                      PROXY CDN (OK)
                    </span>
                  ) : isGitSsh ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EDEDED]">
                      <GitBranch className="w-3 h-3" />
                      OPERATIVO (GIT SSH)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ff4d4d]">
                      <ShieldAlert className="w-3 h-3" />
                      EXPUESTO
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#EDEDED]">
                    <ShieldCheck className="w-3 h-3" />
                    PROTEGIDO
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                {isPort443 && p.isOpen
                  ? 'Canal seguro HTTPS activo (Requerido para navegación segura y transacciones).'
                  : isPort80 && p.isOpen
                  ? 'Abierto para capturar tráfico no seguro y redirigir hacia HTTPS.'
                  : isPort8080 && p.isOpen
                  ? 'Puerto proxy perimetral de distribución CDN activo.'
                  : p.description}
              </p>

              {p.isOpen && p.banner && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-[9px] font-mono uppercase text-slate-400">Versión detectada:</span>
                  <span
                    className="font-mono font-bold text-[#EDEDED] truncate max-w-[170px] bg-white/[0.03] border border-white/10 px-1.5 py-0.5"
                    title={p.banner}
                  >
                    {p.banner}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}