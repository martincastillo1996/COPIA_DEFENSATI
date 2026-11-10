'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  MessageCircle,
  Wrench,
  ExternalLink
} from 'lucide-react';
import NeuralBackground from '@/components/NeuralBackground';
import NeuralScanTakeover from '@/components/NeuralScanTakeover';
import ScoreCircle from '@/components/ScoreCircle';

// 5 Secciones Requeridas en Orden Estricto para /defensati:
import DefensatiHero from '@/components/defensati/DefensatiHero';
import DefensatiHowItWorks from '@/components/defensati/DefensatiHowItWorks';
import DefensatiSinglePricingCard from '@/components/defensati/DefensatiSinglePricingCard';
import DefensatiQuienSoy from '@/components/defensati/DefensatiQuienSoy';

import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { AuditReportRecord } from '@/lib/storage/reportStore';

export default function DefensatiPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legalConsent, setLegalConsent] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(async (targetUrl?: string, overrideConsent?: boolean) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;

    const hasConsent = overrideConsent ?? legalConsent;
    if (!hasConsent) {
      setError('Por favor marca la casilla de declaración jurada bajo la Ley N° 30096 para poder auditar el dominio.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const scanPromise = fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, legalConsentAccepted: true }),
      });

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3200));
      const [res] = await Promise.all([scanPromise, minDelayPromise]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No pudimos conectar con la web indicada. Revisa que esté escrita correctamente.');
      }

      setReport(data.report || data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al revisar el sitio web.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url, legalConsent]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('target') || params.get('url');
      if (target) {
        setTimeout(() => setUrl(target), 0);
      }
    }
  }, []);

  const cleanDomain = report?.url ? report.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') : '';

  return (
    <div className="relative min-h-screen bg-[#060814] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Fondo interactivo 3D de Red Neuronal de Dominios Webs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <NeuralBackground 
          onSelectDomain={(selectedDomain) => {
            setUrl(`https://${selectedDomain}`);
            const inputEl = document.getElementById('url-scan-input-defensati');
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => inputEl.focus(), 300);
            }
          }}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#060814]/35 pointer-events-none" />
      </div>

      {/* Luces cósmicas Apple Pro */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
        <div 
          className="absolute rounded-full bg-gradient-to-b from-[#0071e3]/30 via-[#7928ca]/20 to-transparent"
          style={{ top: '-60px', height: '640px', width: '1050px', filter: 'blur(130px)' }} 
        />
        <div 
          className="absolute rounded-full bg-blue-500/18"
          style={{ top: '35%', right: '-5%', height: '520px', width: '520px', filter: 'blur(160px)' }} 
        />
        <div 
          className="absolute rounded-full bg-purple-600/16"
          style={{ top: '65%', left: '-5%', height: '550px', width: '550px', filter: 'blur(170px)' }} 
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Encabezado Oficial DEFENSA TI */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060814]/80 backdrop-blur-2xl transition-all">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo de DEFENSA TI con Escudo de Ciberseguridad */}
            <div className="flex items-center gap-3">
              <Link href="/" className="mr-1 text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                <span>&larr;</span>
                <span className="font-semibold text-sky-400">Neuronal Gravity</span>
              </Link>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                  DEFENSA TI
                </span>
                <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                  Seguridad y Limpieza Web
                </span>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-neutral-300">
              <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
              <a href="#precio" className="hover:text-rose-400 transition-colors">Precio</a>
              <a href="#escaner-gratis" className="hover:text-white transition-colors">Escáner gratis</a>
              <a href="#quien-soy" className="hover:text-white transition-colors">Quién soy</a>
              <Link href="/planes" className="hover:text-sky-400 transition-colors">Ver Planes</Link>
            </nav>

            {/* Botón WhatsApp de Contacto Directo */}
            <div className="flex items-center gap-2.5">
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: SOLO ESTAS 5 SECCIONES EN ESTE ORDEN */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-16 sm:space-y-24 flex-1 w-full overflow-x-hidden">
          
          {/* SECCIÓN 1: HERO CON UN BOTÓN DE WHATSAPP */}
          <DefensatiHero />

          {/* SECCIÓN 2: CÓMO FUNCIONA (3 PASOS) */}
          <DefensatiHowItWorks />

          {/* SECCIÓN 3: UNA TARJETA GRANDE: LIMPIEZA DE WORDPRESS DESDE S/ 250 CON GARANTÍA DE 30 DÍAS (Debajo texto pequeño) */}
          <DefensatiSinglePricingCard targetUrl={url} />

          {/* SECCIÓN 4: ESCÁNER GRATIS */}
          <section id="escaner-gratis" className="w-full max-w-3xl mx-auto space-y-6 scroll-mt-24 text-center">
            
            <div className="space-y-4 p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#141828]/90 via-[#0f1220]/90 to-[#0a0d18]/95 border border-sky-500/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,113,227,0.18)]">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-widest font-mono text-[#38bdf8] font-bold">
                  ESCÁNER GRATIS
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Mira en segundos si tu web tiene fallas de seguridad básicas.
              </h2>

              {/* Formulario de Escaneo */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan();
                }}
                className="pt-2 max-w-xl mx-auto space-y-3 text-left"
              >
                <div className="relative p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,113,227,0.15)] flex items-center gap-2 ring-1 ring-white/10 focus-within:ring-[#0071e3]/80 focus-within:border-[#0071e3]/80 transition-all">
                  <div className="pl-3.5 text-neutral-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="url-scan-input-defensati"
                    type="text"
                    placeholder="https://tudominio.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none py-2 text-[16px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-normal"
                  />
                  <button
                    type="submit"
                    disabled={loading || !legalConsent || !url.trim()}
                    title={!legalConsent ? 'Marca la casilla obligatoria para activar el botón' : 'Iniciar revisión'}
                    className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      loading || !legalConsent || !url.trim()
                        ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed opacity-60'
                        : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-[#0071e3]/40 cursor-pointer active:scale-95'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Revisando...</span>
                      </>
                    ) : (
                      <>
                        <span>Revisar gratis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Casilla de Declaración Jurada */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                    legalConsent
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                      : 'bg-[#141416]/90 border-white/10 hover:border-amber-500/40 shadow-lg'
                  }`}
                >
                  <label htmlFor="sworn-declaration-checkbox" className="flex items-start gap-3.5 cursor-pointer select-none">
                    <input
                      id="sworn-declaration-checkbox"
                      type="checkbox"
                      checked={legalConsent}
                      onChange={(e) => {
                        setLegalConsent(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-black text-[#0071e3] cursor-pointer accent-[#0071e3] shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <p className="text-xs sm:text-[12.5px] text-neutral-200 leading-snug font-medium">
                        “Declaro que soy el dueño de esta página web o tengo autorización de su titular para revisarla, según la{' '}
                        <Link
                          href="/terminos#delitos-informaticos"
                          className="text-[#38bdf8] underline hover:text-white font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ley N° 30096 del Perú
                        </Link>
                        .”
                      </p>
                      <span
                        className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          legalConsent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        {legalConsent ? '✓ Casilla Marcada • Botón Habilitado' : '⚠️ Marca la casilla para revisar tu web'}
                      </span>
                    </div>
                  </label>
                </div>
              </form>

              {/* Animación del Escáner */}
              {loading && <NeuralScanTakeover targetUrl={url || 'sitio web'} />}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

          </section>

          {/* RESULTADOS DEL ESCÁNER (Sin jerga técnica + Botón directo a WhatsApp) */}
          {report && (
            <div ref={resultsRef} className="max-w-4xl mx-auto space-y-6 pt-2 scroll-mt-20">
              
              {/* Resumen del diagnóstico */}
              <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#141b2b]/95 via-[#0e1320]/95 to-[#090d16]/98 border border-sky-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">Diagnóstico previo listo</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white break-all">{report.url}</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                    {report.score >= 80 
                      ? 'Tu web cuenta con una buena base de configuración de seguridad, pero conviene mantenerla vigilada.' 
                      : 'Tu web presenta puntos débiles o advertencias visibles que facilitan hackeos o caídas.'}
                  </p>
                </div>
                
                <div className="w-28 shrink-0">
                  <ScoreCircle score={report.score} grade={report.grade || 'F'} />
                </div>
              </div>

              {/* Botón directo en primera persona: "Yo te lo arreglo" */}
              <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-emerald-950/60 via-[#101b14] to-[#0a140f] border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Trato Directo Conmigo</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    ¿Quieres que yo mismo limpie y proteja tu página web?
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-normal">
                    Escríbeme por WhatsApp. Te digo exactamente qué encontré en tu web y la dejo blindada.
                  </p>
                </div>

                <a
                  href={DEFENSATI_WHATSAPP_MESSAGES.escaner(cleanDomain, report.score, report.grade)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#25D366] to-emerald-400 text-black font-extrabold text-base shadow-[0_10px_30px_rgba(37,211,102,0.4)] flex items-center justify-center gap-3 transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                  <span className="whitespace-nowrap">Quiero que revisen mi web</span>
                </a>
              </div>

              {/* Enlace a la auditoría técnica profunda en /escaner */}
              <div className="text-center pt-2">
                <Link
                  href={`/escaner?url=${encodeURIComponent(report.url)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-white transition-colors underline font-medium"
                >
                  <span>¿Eres programador o webmaster? Ver auditoría técnica profunda con cabeceras y puertos en /escaner</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

            </div>
          )}

          {/* SECCIÓN 5: QUIÉN SOY */}
          <DefensatiQuienSoy />

        </main>

        {/* PIE DE PÁGINA (Contacto, Confianza, RUC, WhatsApp, Términos y Libro de Reclamaciones) */}
        <footer className="border-t border-white/10 py-14 text-xs text-neutral-400 bg-black/95 backdrop-blur-xl mt-20">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            
            {/* Canales de Contacto Directo */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold transition-all shadow-[0_0_15px_rgba(37,211,102,0.15)]"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp: {siteConfig.contact.whatsappFormatted}</span>
              </a>

              <a
                href="mailto:contacto@neuronalgravity.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
              >
                <span>contacto@neuronalgravity.com</span>
              </a>
            </div>

            {/* Créditos y Legalidad */}
            <div className="space-y-3 text-center max-w-3xl mx-auto">
              <p className="font-semibold text-white text-sm">
                &copy; {new Date().getFullYear()} DEFENSA TI &bull; Martín Castillo &bull; RUC {siteConfig.business.ruc}
              </p>
              
              <p className="text-[11px] text-neutral-400">
                Parte del ecosistema tecnológico <a href="https://neuronalgravity.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-bold">NeuronalGravity.com</a>
              </p>

              {/* Enlaces Legales */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-300 pt-2 border-t border-white/10">
                <Link href="/planes" className="hover:text-sky-400 transition-colors underline font-medium">
                  Todos los Planes (Monitoreo Mensual)
                </Link>
                <span>&bull;</span>
                <Link href="/escaner" className="hover:text-sky-400 transition-colors underline font-medium">
                  Escáner Técnico Completo
                </Link>
                <span>&bull;</span>
                <Link href="/terminos" className="hover:text-white transition-colors underline font-medium">
                  Términos y Privacidad (Perú)
                </Link>
                <span>&bull;</span>
                <Link href="/reclamaciones" className="hover:text-amber-300 transition-colors underline font-bold text-amber-400">
                  Libro de Reclamaciones Conforme a Ley
                </Link>
              </div>

              <p className="text-[10px] text-neutral-500 leading-relaxed pt-2">
                <strong>Aviso Legal y Descargo:</strong> DEFENSA TI es un servicio técnico prestado por Martín Castillo bajo RUC 10704877850 para la remediación, desinfección y blindaje de sitios web. Todos los servicios se coordinan con diagnóstico previo y entrega formal.
              </p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
