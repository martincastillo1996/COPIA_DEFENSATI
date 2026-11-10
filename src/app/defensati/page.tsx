'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageCircle } from 'lucide-react';

// Secciones de /defensati:
// 1) Hero con escáner integrado y botones de WhatsApp
// 2) Cómo funciona (3 pasos)
// 3) Tarjeta grande de precio (Limpieza desde S/ 250 con garantía de 30 días)
// 4) Quién soy
import DefensatiHero from '@/components/defensati/DefensatiHero';
import DefensatiHowItWorks from '@/components/defensati/DefensatiHowItWorks';
import DefensatiSinglePricingCard from '@/components/defensati/DefensatiSinglePricingCard';
import DefensatiQuienSoy from '@/components/defensati/DefensatiQuienSoy';

import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function DefensatiPage() {
  return (
    <div className="relative min-h-screen bg-[#0B1220] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Encabezado Oficial DEFENSA TI - Estilo Apple Glass */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220]/80 backdrop-blur-2xl transition-all">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo de DEFENSA TI con Escudo de Ciberseguridad */}
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="mr-1 text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
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

        {/* CONTENIDO PRINCIPAL: SECCIONES EN ORDEN ESTRICTO */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-14 space-y-16 sm:space-y-24 flex-1 w-full overflow-x-hidden">
          
          {/* SECCIÓN 1: HERO CON ESCÁNER INTEGRADO (Estilo Apple, Fondo #0B1220 liso) */}
          <DefensatiHero />

          {/* SECCIÓN 2: CÓMO FUNCIONA (3 PASOS) */}
          <DefensatiHowItWorks />

          {/* SECCIÓN 3: UNA TARJETA GRANDE DE PRECIO: LIMPIEZA DESDE S/ 250 CON GARANTÍA DE 30 DÍAS */}
          <DefensatiSinglePricingCard />

          {/* SECCIÓN 4: QUIÉN SOY */}
          <DefensatiQuienSoy />

        </main>

        {/* PIE DE PÁGINA OFICIAL */}
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
