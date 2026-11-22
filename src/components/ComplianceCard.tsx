'use client';

import { useEffect, useState } from 'react';
import { Scale, BadgeCheck, BadgeAlert } from 'lucide-react';
import type { ComplianceResult, ControlStatus } from '@/lib/scanner/complianceMapper';
import type { ReportDiff } from '@/lib/scanner/findingsDiff';

const STATUS: Record<ControlStatus, { label: string; cls: string }> = {
  cumple: { label: 'CUMPLE', cls: 'text-[#EDEDED] border-white/25' },
  parcial: { label: 'PARCIAL', cls: 'text-[#ff9f43] border-[#ff9f43]/40' },
  no_cumple: { label: 'NO CUMPLE', cls: 'text-[#ff4d4d] border-[#ff4d4d]/40' },
  no_evaluable: { label: 'N/E', cls: 'text-slate-500 border-white/10' },
};

interface Props {
  compliance?: ComplianceResult;
  reportId?: string;
  hasIntegrity?: boolean;
  diff?: ReportDiff;
}

export default function ComplianceCard({ compliance, reportId, hasIntegrity, diff }: Props) {
  const [active, setActive] = useState(0);
  const [seal, setSeal] = useState<{ valid: boolean; reason?: string } | null>(null);
  // Las exportaciones de un informe de auditoría completa también exigen el enlace firmado
  const share = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('t') || '';
  const tq = share ? `&t=${encodeURIComponent(share)}` : '';

  useEffect(() => {
    if (!reportId || !hasIntegrity) return;
    let cancelled = false;
    fetch(`/api/report/${reportId}/verify`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j) setSeal({ valid: Boolean(j.valid), reason: j.reason });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reportId, hasIntegrity]);

  if (!compliance) return null;
  const fw = compliance.frameworks[active] ?? compliance.frameworks[0];

  return (
    <div className="bg-neutral-900/80 border border-white/10 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#EDEDED]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Cumplimiento Normativo (Indicios Técnicos)</h3>
        </div>
        {compliance.overallPct !== null && (
          <span className="text-[10px] font-mono text-slate-300">Alineación global: {compliance.overallPct}%</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {compliance.frameworks.map((f, i) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1.5 ${i === active ? 'bg-white/10 text-slate-100 border-white/30' : 'text-slate-400 border-white/10 hover:bg-white/5'}`}
          >
            {f.name.split(' — ')[0].split(' · ')[0]} {f.pct !== null ? `· ${f.pct}%` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-mono text-slate-400">{fw.name}</p>
        {fw.controls.map((c) => (
          <div key={c.id} className="border border-white/10 bg-white/[0.02] p-3 flex items-start gap-3">
            <span className={`shrink-0 text-[10px] font-bold font-mono border px-1.5 py-0.5 ${STATUS[c.status].cls}`}>{STATUS[c.status].label}</span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-slate-100 break-words">
                <span className="font-mono text-slate-400">{c.id}</span> · {c.title}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{c.evidence}</p>
            </div>
          </div>
        ))}
      </div>

      {diff && (
        <div className="border border-white/10 bg-white/[0.02] p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cambios desde el escaneo anterior</p>
          <p className="text-xs text-slate-200">{diff.summary}</p>
          {diff.newFindings.slice(0, 5).map((f) => (
            <p key={f.key} className="text-[11px] text-[#ff9f43] break-words">＋ {f.title}</p>
          ))}
          {diff.resolvedFindings.slice(0, 3).map((f) => (
            <p key={f.key} className="text-[11px] text-slate-400 break-words">✓ Resuelto: {f.title}</p>
          ))}
        </div>
      )}

      {seal && (
        <p className={`flex items-start gap-2 text-[11px] ${seal.valid ? 'text-slate-300' : 'text-[#ff4d4d]'}`}>
          {seal.valid ? <BadgeCheck className="w-4 h-4 shrink-0" /> : <BadgeAlert className="w-4 h-4 shrink-0" />}
          {seal.valid ? 'Informe sellado: contenido íntegro, firmado con HMAC-SHA256 por DEFENSA TI.' : `Sello no válido: ${seal.reason || 'no verificable'}`}
        </p>
      )}

      {reportId && (
        <div className="flex flex-wrap gap-2">
          <a href={`/api/report/${reportId}/export?format=sarif${tq}`} className="text-[10px] font-bold uppercase tracking-wider border border-white/15 px-2 py-1.5 text-slate-300 hover:bg-white/5">
            Exportar SARIF
          </a>
          <a href={`/api/report/${reportId}/export?format=json${tq}`} className="text-[10px] font-bold uppercase tracking-wider border border-white/15 px-2 py-1.5 text-slate-300 hover:bg-white/5">
            Exportar JSON (SIEM)
          </a>
        </div>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">{compliance.disclaimer}</p>
    </div>
  );
}
