'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, ArrowLeft } from 'lucide-react';
import NeuralBackground from '@/components/NeuralBackground';
import DefensatiPricing from '@/components/defensati/DefensatiPricing';
import DefensatiWarranty from '@/components/defensati/DefensatiWarranty';
import DefensatiCases from '@/components/defensati/DefensatiCases';
import { siteConfig } from '@/config/site';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function PlanesPage() {
  return (
    <div className="relative min-h-screen bg-[#060814] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Fondo interactivo 3D */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <NeuralBackground showDomains={true} />
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
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Encabezado */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060814]/80 backdrop-blur-2xl transition-all">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <Link 
                href="/defensati" 
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Volver a DEFENSA TI</span>
              </Link>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Planes &bull; DEFENSA TI
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-neutral-300">
              <Link href="/defensati" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/escaner" className="hover:text-white transition-colors">Escáner Perimetral</Link>
              <a href="#garantia" className="hover:text-emerald-400 transition-colors">Garantía</a>
            </nav>

            <a
              href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black text-xs sm:text-sm font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp</span>
            </a>

          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1 w-full overflow-x-hidden">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300 tracking-tight">
              Catálogo Oficial de Servicios y Planes
            </h1>
            <p className="text-base text-neutral-300 leading-relaxed">
              Todos los servicios incluyen atención técnica directa por Martín Castillo, diagnóstico previo sin costo y garantía formal bajo RUC 10704877850.
            </p>
          </div>

          {/* 4 Tarjetas de Precios y Monitoreo Mensual Detallado */}
          <DefensatiPricing />

          {/* Garantía de 30 Días */}
          <DefensatiWarranty />

          {/* Casos Reales */}
          <DefensatiCases />

        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-xs text-neutral-400 bg-black/90 text-center">
          <div className="max-w-6xl mx-auto px-4 space-y-4">
            <p className="font-semibold text-white">
              &copy; {new Date().getFullYear()} DEFENSA TI &bull; Martín Castillo &bull; RUC {siteConfig.business.ruc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-300">
              <Link href="/defensati" className="hover:text-white transition-colors underline">DEFENSA TI</Link>
              <span>&bull;</span>
              <Link href="/escaner" className="hover:text-white transition-colors underline">Escáner Perimetral</Link>
              <span>&bull;</span>
              <Link href="/terminos" className="hover:text-white transition-colors underline">Términos y Privacidad</Link>
              <span>&bull;</span>
              <Link href="/reclamaciones" className="hover:text-amber-400 transition-colors underline text-amber-400">Libro de Reclamaciones</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
