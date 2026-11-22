'use client';

import { Network, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { AsmResult } from '@/lib/scanner/asmScanner';
import ScanFindingList from '@/components/ScanFindingList';

function Chip({ label, state }: { label: string; state: boolean | null }) {
  const cls = state === true ? 'text-[#EDEDED] border-white/20' : state === false ? 'text-[#ff9f43] border-[#ff9f43]/40' : 'text-slate-500 border-white/10';
  return (
    <span className={`text-[10px] font-mono border px-1.5 py-0.5 ${cls}`}>
      {state === true ? '✓' : state === false ? '✗' : '?'} {label}
    </span>
  );
}

export default function AttackSurfaceCard({ asm }: { asm?: AsmResult }) {
  if (!asm) return null;
  const { subdomains, dnsHardening, emailAuth, tls, findings } = asm;

  return (
    <div className="bg-neutral-900/80 border border-white/10 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#EDEDED]" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Superficie de Ataque, DNS, Correo y TLS</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {subdomains.source !== 'ninguna' ? `Fuentes: ${subdomains.source}` : 'Subdominios: sin fuente'}
          {tls ? ' · TLS profundo' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: 'Subdominios', v: subdomains.totalDiscovered },
          { k: 'Activos', v: subdomains.resolving },
          { k: 'Sensibles', v: subdomains.risky, hot: subdomains.risky > 0 },
          { k: 'Takeover', v: subdomains.takeovers, hot: subdomains.takeovers > 0 },
        ].map((s) => (
          <div key={s.k} className="border border-white/10 bg-white/[0.03] p-3">
            <p className={`text-lg font-bold font-mono ${s.hot ? 'text-[#ff4d4d]' : 'text-slate-100'}`}>{s.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{s.k}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip label="DNSSEC" state={dnsHardening.dnssec} />
        <Chip label="CAA" state={dnsHardening.caa.present} />
        <Chip label="DKIM" state={emailAuth.dkim.found} />
        <Chip label="MTA-STS" state={emailAuth.mtaSts.present} />
        <Chip label="TLS-RPT" state={emailAuth.tlsRpt} />
        <Chip label="BIMI" state={emailAuth.bimi} />
        {tls && (
          <>
            <Chip label="Sin TLS 1.0/1.1" state={!tls.legacyEnabled.length} />
            <Chip label="TLS 1.3" state={tls.protocols['TLSv1.3']} />
            <Chip label="Forward secrecy" state={tls.forwardSecrecy} />
            <Chip label="OCSP stapling" state={tls.ocspStapling} />
            <Chip label="Post-cuántico" state={tls.pqHybrid} />
          </>
        )}
      </div>

      {tls && (
        <div className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-[#EDEDED] uppercase tracking-wider">Detalle de Cifrados y Protocolos TLS</span>
            <span className="text-[10px] font-mono text-emerald-400">scanTlsDeep activo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Cifrado Negociado (Cipher Suite)</span>
              <p className="font-mono text-[11px] text-[#EDEDED] font-semibold break-all">{tls.negotiated?.cipher || 'No especificado'}</p>
              <span className="text-[10px] text-slate-500 block mt-0.5">{tls.negotiated?.protocol || 'Protocolo seguro'}</span>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Clave y Criptografía</span>
              <p className="font-mono text-[11px] text-[#EDEDED] font-semibold">
                {tls.keyInfo ? `${tls.keyInfo.type} ${tls.keyInfo.bits ? `(${tls.keyInfo.bits} bits)` : ''}` : 'Estándar'}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Cadena: {tls.chainDepth} cert(s) · {tls.certLifetimeDays ? `${tls.certLifetimeDays} días vida` : 'Válido'}</span>
            </div>

            <div className="bg-black/40 border border-white/5 p-2.5">
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Protección Avanzada</span>
              <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px]">
                <span className={tls.forwardSecrecy ? 'text-emerald-400' : 'text-slate-500'}>
                  {tls.forwardSecrecy ? '✓ PFS' : '✗ Sin PFS'}
                </span>
                <span className="text-slate-600">·</span>
                <span className={tls.ocspStapling ? 'text-emerald-400' : 'text-slate-500'}>
                  {tls.ocspStapling ? '✓ OCSP' : '✗ Sin OCSP'}
                </span>
                <span className="text-slate-600">·</span>
                <span className={tls.pqHybrid ? 'text-emerald-400' : 'text-slate-500'}>
                  {tls.pqHybrid ? '✓ Post-cuántico' : '✗ Sin PQ'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-400">Protocolos:</span>
            {(['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'] as const).map((proto) => {
              const enabled = tls.protocols[proto];
              const isLegacy = proto === 'TLSv1' || proto === 'TLSv1.1';
              return (
                <span
                  key={proto}
                  className={`px-1.5 py-0.5 border ${
                    enabled
                      ? isLegacy
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : isLegacy
                      ? 'text-slate-400 border-white/10'
                      : 'text-slate-600 border-white/5'
                  }`}
                >
                  {enabled ? (isLegacy ? '⚠️ ' : '✓ ') : '✗ '} {proto}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Búsqueda de Buckets Públicos (S3 / GCS) */}
      <div className="border border-white/10 bg-white/[0.02] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Buckets Públicos Cloud:</span>
          {asm.publicBuckets && asm.publicBuckets.length > 0 ? (
            <span className="text-[11px] font-mono text-rose-400 font-bold">⚠️ {asm.publicBuckets.length} bucket(s) con listado público</span>
          ) : (
            <span className="text-[11px] font-mono text-emerald-400 font-medium">✓ 0 detectados (Amazon S3 / Google Cloud Storage protegidos)</span>
          )}
        </div>
        {asm.publicBuckets && asm.publicBuckets.length > 0 && (
          <div className="w-full mt-1.5 space-y-1">
            {asm.publicBuckets.map((b) => (
              <a
                key={b.url}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-rose-300 hover:underline block truncate"
              >
                [{b.provider}] {b.url}
              </a>
            ))}
          </div>
        )}
      </div>

      {!tls && (
        <p className="text-[11px] text-slate-500">El análisis TLS profundo (protocolos, suites, cadena) se ejecuta en la auditoría completa autorizada.</p>
      )}

      <p className={`flex items-start gap-2 text-xs ${findings.length ? 'text-[#EDEDED]' : 'text-slate-300'}`}>
        {findings.length ? <ShieldAlert className="w-4 h-4 shrink-0 text-[#ff9f43]" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
        {findings.length ? `${findings.length} hallazgo(s) de superficie de ataque y endurecimiento.` : 'Sin hallazgos de superficie de ataque.'}
      </p>

      <ScanFindingList findings={findings} />

      {asm.typosquats && asm.typosquats.length > 0 && (
        <details className="text-xs text-slate-300">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200">
            Dominios parecidos registrados ({asm.typosquats.length})
          </summary>
          <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
            {asm.typosquats.map((t) => (
              <li key={t.name} className={`truncate ${t.sameNs ? 'text-slate-500' : t.hasMx ? 'text-[#ff4d4d]' : 'text-[#ff9f43]'}`}>
                {t.name}{t.hasMx ? ' · MX' : ''}{t.sameNs ? ' · tu DNS' : ''}
              </li>
            ))}
          </ul>
        </details>
      )}

      {subdomains.list.length > 0 && (
        <details className="text-xs text-slate-300">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200">
            Inventario de subdominios ({subdomains.analyzed} analizados de {subdomains.totalDiscovered})
          </summary>
          <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
            {subdomains.list.map((s) => (
              <li key={s.name} className={`truncate ${s.takeover ? 'text-[#ff4d4d]' : s.risky ? 'text-[#ff9f43]' : s.resolves ? 'text-slate-300' : 'text-slate-600'}`} title={s.cname ? `${s.name} → ${s.cname}` : s.name}>
                {s.name}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Reconocimiento pasivo mediante registros públicos de certificados y DNS: no se conecta a los subdominios descubiertos.
      </p>
    </div>
  );
}
