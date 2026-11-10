'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle
} from 'lucide-react';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import { getWhatsAppUrl } from '@/lib/whatsapp';

interface SimpleCheckRow {
  status: 'green' | 'yellow' | 'red';
  text: string;
}

function parseSimpleCheckRows(report: AuditReportRecord): SimpleCheckRow[] {
  const rows: SimpleCheckRow[] = [];

  // 1. Conexión segura (HSTS)
  const hsts = report.headers?.find(h => h.name.toLowerCase() === 'strict-transport-security');
  if (hsts && hsts.status === 'pass') {
    rows.push({
      status: 'green',
      text: 'Tu web obliga a usar conexión segura en todo momento.',
    });
  } else {
    rows.push({
      status: 'red',
      text: 'Tu web no obliga a usar conexión segura (los datos pueden ser interceptados).',
    });
  }

  // 2. Certificado de seguridad (SSL)
  if (report.ssl && report.ssl.valid && (report.ssl.daysRemaining ?? 30) > 15) {
    rows.push({
      status: 'green',
      text: 'El certificado de seguridad está vigente y activo.',
    });
  } else {
    rows.push({
      status: 'red',
      text: 'El certificado de seguridad está vencido o no está configurado.',
    });
  }

  // 3. Protección contra clonación y marcos falsos (X-Frame-Options / CSP)
  const frameOpt = report.headers?.find(h => h.name.toLowerCase() === 'x-frame-options');
  const csp = report.headers?.find(h => h.name.toLowerCase() === 'content-security-policy');
  if ((frameOpt && frameOpt.status === 'pass') || (csp && csp.status === 'pass')) {
    rows.push({
      status: 'green',
      text: 'Tu web bloquea intentos de clonación o marcos falsos.',
    });
  } else {
    rows.push({
      status: 'yellow',
      text: 'Tu web permite que otros sitios la copien o muestren en marcos falsos.',
    });
  }

  // 4. Puertos o accesos expuestos del servidor
  const openDangerousPorts = report.ports?.filter(
    p => p.isOpen && [21, 22, 3306, 5432, 8080].includes(p.port)
  );
  const serverExposed = report.headers?.find(
    h => ['server', 'x-powered-by'].includes(h.name.toLowerCase()) && h.status !== 'pass'
  );

  if (openDangerousPorts && openDangerousPorts.length > 0) {
    rows.push({
      status: 'red',
      text: 'Tu servidor tiene accesos directos visibles en internet.',
    });
  } else if (serverExposed) {
    rows.push({
      status: 'yellow',
      text: 'Tu web revela a extraños qué programas o versiones de servidor usas.',
    });
  } else {
    rows.push({
      status: 'green',
      text: 'Los programas internos del servidor están ocultos y protegidos.',
    });
  }

  return rows;
}

export default function DefensatiHero() {
  const [url, setUrl] = useState('');
  const [legalConsent, setLegalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('target') || params.get('url');
      if (target) {
        setTimeout(() => setUrl(target), 0);
      }
    }
  }, []);

  const handleScan = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || !legalConsent || loading) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const scanPromise = fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), legalConsentAccepted: true }),
      });

      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2800));
      const [res] = await Promise.all([scanPromise, minDelayPromise]);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No pudimos conectar con la web indicada.');
      }

      setReport(data.report || data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la web.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url, legalConsent, loading]);

  const cleanDomain = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
  const rows = report ? parseSimpleCheckRows(report) : [];
  const problemCount = rows.filter(r => r.status === 'red' || r.status === 'yellow').length;

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
      <div className="max-w-3xl mx-auto space-y-4 px-4">
        
        {/* TÍTULO APPLE: blanco puro, máximo 2 líneas, sin degradado ni brillo */}
        <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold text-white leading-tight sm:leading-[1.12] tracking-tight">
          ¿Tu web fue hackeada?
          <br />
          La limpio y la dejo blindada.
        </h1>

        {/* SUBTÍTULO: gris claro */}
        <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto pt-1">
          Escribe tu web y te muestro en segundos qué fallas tiene. Gratis.
        </p>

        {/* BUSCADOR: elemento principal del hero */}
        <div className="pt-4 max-w-2xl mx-auto space-y-4 text-left">
          
          <form onSubmit={handleScan} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/[0.07] border border-white/15 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-all">
              <div className="flex items-center gap-2 pl-3 py-2 flex-1">
                <Search className="w-5 h-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="tuweb.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-transparent border-none text-white text-base sm:text-lg placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !legalConsent || !url.trim()}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shrink-0 cursor-pointer text-center ${
                  loading || !legalConsent || !url.trim()
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5 opacity-60'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-95 shadow-md shadow-blue-500/25'
                }`}
              >
                {loading ? 'Revisando tu web...' : 'Revisar mi web gratis'}
              </button>
            </div>

            {/* Checkbox pequeño de autorización bajo Ley 30096 */}
            <div className="flex items-start gap-2.5 text-left px-1">
              <input
                id="hero-consent-checkbox"
                type="checkbox"
                checked={legalConsent}
                onChange={(e) => setLegalConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/30 bg-black/40 text-[#0071e3] focus:ring-0 cursor-pointer accent-[#0071e3] shrink-0"
              />
              <label htmlFor="hero-consent-checkbox" className="text-xs text-neutral-300 leading-snug cursor-pointer select-none">
                Declaro que soy titular de este dominio o tengo autorización para revisarlo (conforme a la{' '}
                <Link 
                  href="/terminos#delitos-informaticos" 
                  className="text-sky-400 underline hover:text-white" 
                  onClick={(e) => e.stopPropagation()}
                >
                  Ley 30096
                </Link>
                ).
              </label>
            </div>
          </form>

          {/* ESTADO DE CARGA EN EL MISMO LUGAR */}
          {loading && (
            <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10 text-center space-y-2 backdrop-blur-xl">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-base font-bold text-white">Revisando tu web...</p>
              <p className="text-xs text-neutral-400">Verificando en segundos certificado de seguridad, cabeceras y accesos.</p>
            </div>
          )}

          {/* RESULTADO DEL ESCÁNER EN EL MISMO LUGAR */}
          {report && !loading && (
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0f172a] border border-white/15 shadow-2xl backdrop-blur-2xl space-y-5 text-left">
              
              {/* Resumen en lenguaje simple */}
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-wider text-sky-400 font-bold block mb-1">
                  Resultado del diagnóstico
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {problemCount === 0 
                    ? `No encontré problemas en ${cleanDomain}` 
                    : `Encontré ${problemCount} ${problemCount === 1 ? 'problema' : 'problemas'} en ${cleanDomain}`}
                </h3>
              </div>

              {/* 3 o 4 filas con íconos verde / amarillo / rojo */}
              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-200 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    {row.status === 'green' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {row.status === 'yellow' && (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    {row.status === 'red' && (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{row.text}</span>
                  </div>
                ))}
              </div>

              {/* Dos botones directos a WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {/* Botón 1: Quiero que lo arreglen */}
                <a
                  href={getWhatsAppUrl(`Hola, revisé mi web ${cleanDomain} en DEFENSA TI y salieron ${problemCount} problemas. Quiero que me ayuden.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center shadow-md shadow-[#25D366]/20"
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span>Quiero que lo arreglen</span>
                </a>

                {/* Botón 2: ¿Tu web ya fue hackeada? */}
                <a
                  href={getWhatsAppUrl(`Hola, mi web fue hackeada. Mi página es: ${cleanDomain}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>¿Tu web ya fue hackeada?</span>
                </a>
              </div>

            </div>
          )}

          {/* MENSAJE AMABLE SI FALLA O NO RESPONDE */}
          {error && !loading && (
            <div className="p-5 rounded-2xl bg-white/[0.05] border border-amber-500/30 space-y-3 text-center">
              <p className="text-sm text-neutral-200">
                No pudimos conectar con <strong>{cleanDomain || 'tu web'}</strong>. Es posible que esté caída, bloqueada por un virus o mal escrita.
              </p>
              <a
                href={getWhatsAppUrl(`Hola Martín, intenté revisar mi web ${cleanDomain} en DEFENSA TI y no respondió. ¿Puedes ayudarme a revisarla?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-bold text-sm transition-all shadow-md shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Escríbeme por WhatsApp y la reviso</span>
              </a>
            </div>
          )}

          {/* FILA PEQUEÑA DEBAJO DEL BUSCADOR */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[13px] text-neutral-400 pt-2 font-normal text-center">
            <span>Diagnóstico gratis</span>
            <span className="text-neutral-600">&middot;</span>
            <span>Pagas después</span>
            <span className="text-neutral-600">&middot;</span>
            <span>Garantía de 30 días</span>
            <span className="text-neutral-600">&middot;</span>
            <span>Comprobante con RUC</span>
          </div>

        </div>

      </div>
    </section>
  );
}
