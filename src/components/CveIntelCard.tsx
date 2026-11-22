'use client';

import { useState } from 'react';
import { Bug, ShieldAlert, ShieldCheck, Crosshair, Wrench, ChevronDown, Flame } from 'lucide-react';
import type { CveIntelResult, CveIntelFinding, CveSeverity } from '@/lib/scanner/cveIntelScanner';

const SEV_COLOR: Record<CveSeverity, string> = {
  'CRÍTICO': 'text-[#ff4d4d] border-[#ff4d4d]/40',
  'ALTO': 'text-[#ff9f43] border-[#ff9f43]/40',
  'MEDIO': 'text-[#EDEDED] border-white/20',
  'BAJO': 'text-slate-400 border-white/10',
};

const CONF_LABEL = {
  confirmado: 'Versión vulnerable confirmada',
  probable: 'Probable (depende de config./parche)',
  exposicion: 'Superficie expuesta',
} as const;

function FindingRow({ f }: { f: CveIntelFinding }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full text-left p-3.5 flex items-start gap-3"
      >
        <span className={`shrink-0 text-[10px] font-bold font-mono border px-1.5 py-0.5 ${SEV_COLOR[f.severity]}`}>
          {f.severity}
        </span>
        <span className="flex-1 min-w-0 space-y-1">
          <span className="block text-xs font-bold text-slate-100 break-words">{f.title}</span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-slate-400">
            <span>{f.product}{f.detectedVersion ? ` ${f.detectedVersion}` : ''}</span>
            {f.cvss !== undefined && <span>CVSS {f.cvss.toFixed(1)}</span>}
            {f.epss !== undefined && <span>EPSS {(f.epss * 100).toFixed(1)}%</span>}
            <span>{CONF_LABEL[f.confidence]}</span>
          </span>
          {f.kev && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ff4d4d]">
              <Flame className="w-3 h-3" />
              EXPLOTACIÓN ACTIVA (CISA KEV{f.kevDateAdded ? ` · ${f.kevDateAdded}` : ''}){f.kevRansomware ? ' · USADA POR RANSOMWARE' : ''}
            </span>
          )}
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
          {f.detail && <p className="text-[11px] text-slate-400 italic leading-relaxed">{f.detail}</p>}
          {f.cves.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {f.cves.map((c) => (
                <a
                  key={c}
                  href={`https://nvd.nist.gov/vuln/detail/${c}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] border border-white/15 px-1.5 py-0.5 hover:bg-white/10"
                >
                  {c}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CveIntelCard({ cveIntel }: { cveIntel?: CveIntelResult }) {
  const [showAll, setShowAll] = useState(false);
  if (!cveIntel) return null;

  const { findings, stats, technologies, sources } = cveIntel;
  const visible = showAll ? findings : findings.slice(0, 6);
  const clean = findings.length === 0;

  return (
    <div className="bg-neutral-900/80 border border-white/10 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-[#EDEDED]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Inteligencia de Vulnerabilidades (CVE &amp; Amenazas Activas)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {[sources.kev && 'CISA KEV', sources.nvd && 'NVD', sources.epss && 'EPSS', 'Base DEFENSA TI'].filter(Boolean).join(' · ')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: 'Hallazgos', v: stats.total },
          { k: 'Críticos', v: stats.critical, hot: stats.critical > 0 },
          { k: 'Explotación activa', v: stats.kevCount, hot: stats.kevCount > 0 },
          { k: 'EPSS máx.', v: `${(stats.maxEpss * 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.k} className="border border-white/10 bg-white/[0.03] p-3">
            <p className={`text-lg font-bold font-mono ${s.hot ? 'text-[#ff4d4d]' : 'text-slate-100'}`}>{s.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{s.k}</p>
          </div>
        ))}
      </div>

      <p className={`flex items-start gap-2 text-xs ${clean ? 'text-slate-300' : 'text-[#EDEDED]'}`}>
        {clean ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0 text-[#ff4d4d]" />}
        {cveIntel.summary}
      </p>

      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {technologies.map((t) => (
            <span key={`${t.product}-${t.version}`} title={t.evidence} className="text-[10px] font-mono border border-white/10 px-1.5 py-0.5 text-slate-300">
              {t.label}{t.version ? ` ${t.version}` : ''}
            </span>
          ))}
        </div>
      )}

      {!clean && (
        <div className="space-y-2">
          {visible.map((f) => <FindingRow key={f.id} f={f} />)}
          {findings.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="w-full text-[11px] font-bold uppercase tracking-wider border border-white/10 py-2 text-slate-300 hover:bg-white/5"
            >
              {showAll ? 'Ver menos' : `Ver los ${findings.length} hallazgos`}
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Análisis pasivo: se cruzan las versiones visibles con catálogos públicos de vulnerabilidades, sin enviar exploits al servidor.
        Una versión parcheada por la distribución puede mostrarse como vulnerable; confirme con el inventario de paquetes.
      </p>
    </div>
  );
}
