'use client';

import { useState } from 'react';
import { ChevronDown, Crosshair, Wrench } from 'lucide-react';
import type { ScanFinding, FindingSeverity } from '@/lib/scanner/findingTypes';

const SEV_COLOR: Record<FindingSeverity, string> = {
  'CRÍTICO': 'text-[#ff4d4d] border-[#ff4d4d]/40',
  'ALTO': 'text-[#ff9f43] border-[#ff9f43]/40',
  'MEDIO': 'text-[#EDEDED] border-white/20',
  'BAJO': 'text-slate-400 border-white/10',
};

const CONF_LABEL = { confirmado: 'Confirmado', probable: 'Probable', informativo: 'Buena práctica' } as const;

function Row({ f }: { f: ScanFinding }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full text-left p-3.5 flex items-start gap-3">
        <span className={`shrink-0 text-[10px] font-bold font-mono border px-1.5 py-0.5 ${SEV_COLOR[f.severity]}`}>{f.severity}</span>
        <span className="flex-1 min-w-0 space-y-1">
          <span className="block text-xs font-bold text-slate-100 break-words">{f.title}</span>
          <span className="block text-[10px] font-mono text-slate-400">{CONF_LABEL[f.confidence]}</span>
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 space-y-3 text-xs text-slate-300 border-t border-white/10 pt-3">
          <div>
            <p className="flex items-center gap-1.5 font-bold text-[#ff4d4d] uppercase text-[10px] tracking-wider mb-1">
              <Crosshair className="w-3.5 h-3.5" /> Cómo lo explotan
            </p>
            <p className="leading-relaxed">{f.attackVector}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-bold text-[#EDEDED] uppercase text-[10px] tracking-wider mb-1">
              <Wrench className="w-3.5 h-3.5" /> Cómo evitarlo
            </p>
            <p className="leading-relaxed">{f.mitigation}</p>
          </div>
          {f.evidence && <p className="font-mono text-[10px] text-slate-400 break-all">Evidencia: {f.evidence}</p>}
        </div>
      )}
    </div>
  );
}

export default function ScanFindingList({ findings, initial = 6 }: { findings: ScanFinding[]; initial?: number }) {
  const [all, setAll] = useState(false);
  const visible = all ? findings : findings.slice(0, initial);
  if (findings.length === 0) return null;
  return (
    <div className="space-y-2">
      {visible.map((f) => <Row key={f.id} f={f} />)}
      {findings.length > initial && (
        <button type="button" onClick={() => setAll((a) => !a)} className="w-full text-[11px] font-bold uppercase tracking-wider border border-white/10 py-2 text-slate-300 hover:bg-white/5">
          {all ? 'Ver menos' : `Ver los ${findings.length} hallazgos`}
        </button>
      )}
    </div>
  );
}
