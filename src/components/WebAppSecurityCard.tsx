'use client';

import { AppWindow, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { WebAppResult } from '@/lib/scanner/webAppScanner';
import ScanFindingList from '@/components/ScanFindingList';

export default function WebAppSecurityCard({ webApp }: { webApp?: WebAppResult }) {
  if (!webApp) return null;
  const { findings, libraries, thirdParty, csp, securityTxt, active } = webApp;

  return (
    <div className="bg-neutral-900/80 border border-white/10 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <AppWindow className="w-4 h-4 text-[#EDEDED]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Seguridad de la Aplicación Web</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{active ? 'Pasivo + activo (autorizado)' : 'Análisis pasivo'}{webApp.nuclei?.ran ? ` · Nuclei (${webApp.nuclei.templatesMatched})` : ''}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: 'CSP', v: !csp.present ? 'Ausente' : csp.weaknesses.length ? `${csp.weaknesses.length} fallos` : 'Sólida', hot: !csp.present || csp.weaknesses.length > 0 },
          { k: 'Terceros sin SRI', v: `${thirdParty.scriptsWithoutSri}/${thirdParty.origins.length}`, hot: thirdParty.scriptsWithoutSri > 0 },
          { k: 'Librerías vulnerables', v: libraries.filter((l) => l.vulnerable).length, hot: libraries.some((l) => l.vulnerable) },
          { k: 'Secretos en JS', v: webApp.secretsFound, hot: webApp.secretsFound > 0 },
        ].map((s) => (
          <div key={s.k} className="border border-white/10 bg-white/[0.03] p-3">
            <p className={`text-base font-bold font-mono ${s.hot ? 'text-[#ff4d4d]' : 'text-slate-100'}`}>{s.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{s.k}</p>
          </div>
        ))}
      </div>

      {libraries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {libraries.map((l) => (
            <span key={`${l.name}${l.version}`} title={l.advice} className={`text-[10px] font-mono border px-1.5 py-0.5 ${l.vulnerable ? 'text-[#ff9f43] border-[#ff9f43]/40' : 'text-slate-300 border-white/10'}`}>
              {l.name} {l.version}
            </span>
          ))}
          <span className={`text-[10px] font-mono border px-1.5 py-0.5 ${securityTxt.present && !securityTxt.expired ? 'text-slate-300 border-white/10' : 'text-slate-500 border-white/10'}`}>
            security.txt {securityTxt.present ? (securityTxt.expired ? 'caducado' : '✓') : 'ausente'}
          </span>
        </div>
      )}

      <p className={`flex items-start gap-2 text-xs ${findings.length ? 'text-[#EDEDED]' : 'text-slate-300'}`}>
        {findings.length ? <ShieldAlert className="w-4 h-4 shrink-0 text-[#ff9f43]" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
        {findings.length ? `${findings.length} hallazgo(s) en la aplicación web.` : 'Sin hallazgos en la aplicación web.'}
      </p>

      <ScanFindingList findings={findings} />

      {active && (
        <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-[#EDEDED] uppercase tracking-wider">
              Escaneo Profundo de Aplicación Web (Rutas, API, WordPress, CORS)
            </span>
            <span className="text-[10px] font-mono text-emerald-400">activo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Métodos HTTP</span>
              <p className="font-mono text-[11px] text-[#EDEDED]">
                {active.allowedMethods.length > 0 ? active.allowedMethods.join(', ') : 'GET, HEAD, POST'}
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Política CORS</span>
              <p className="font-mono text-[11px] text-[#EDEDED]">
                {active.cors.reflectsOrigin ? '⚠️ Refleja origen' : '✓ Origen restringido'}
                {active.cors.allowsCredentials && ' · Credenciales permitidas'}
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Source Maps</span>
              <p className="font-mono text-[11px] text-[#EDEDED]">
                {active.sourceMaps.length > 0 ? `⚠️ ${active.sourceMaps.length} expuesto(s)` : '✓ No expuestos'}
              </p>
            </div>
          </div>

          {active.exposedEndpoints && active.exposedEndpoints.length > 0 ? (
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase text-slate-400 block mb-1.5">Rutas y APIs Detectadas:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {active.exposedEndpoints.map((ep) => (
                  <span key={ep.path} className="px-2 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    {ep.label}: {ep.path}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400">
              ✓ No se detectaron endpoints de administración, métricas o APIs desprotegidas en rutas estándar.
            </div>
          )}
        </div>
      )}

      {!active && (
        <p className="text-[11px] text-slate-500">
          CORS, métodos HTTP, source maps, APIs/GraphQL y paneles expuestos se verifican en la auditoría completa autorizada.
        </p>
      )}
    </div>
  );
}
