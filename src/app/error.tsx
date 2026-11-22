'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import HeaderWhatsAppButton from '@/components/HeaderWhatsAppButton';
import NeuronalGravityBrandLogo from '@/components/NeuronalGravityBrandLogo';
import { RotateCcw, Home, AlertTriangle, MessageSquare, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registro preventivo del incidente para diagnóstico
    console.error('Captured runtime error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-[#080808] text-[#f5f5f7] flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Fondo de constelaciones y nodos neuronales interactivos */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
      </div>

      {/* Gradientes decorativos de contingencia */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-3xl" />
      </div>

      {/* Barra de Navegación Minimalista */}
      <header className="relative z-10 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          <NeuronalGravityBrandLogo />
          <div className="flex items-center gap-3">
            <HeaderWhatsAppButton message="Hola Martín, encontré un error del sistema en neuronalgravity.com y requiero asistencia." />
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-[#EDEDED] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Central de Contingencia */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          
          {/* Badge de Alerta */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/10 text-[#EDEDED] text-xs font-semibold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mecanismo de Recuperación Activo</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#EDEDED] tracking-tight">
              Ocurrió un contratiempo temporal
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto leading-relaxed">
              El sistema aisló el incidente para proteger tu sesión. Puedes reiniciar este módulo o volver a la portada.
            </p>
          </div>

          {/* Tarjeta de Acciones */}
          <div className="p-6 bg-[#0d0d0d] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar Operación</span>
              </button>
              
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 hover:text-[#EDEDED] text-xs font-semibold transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-white/5">
              <a
                href="https://wa.me/51987010380?text=Hola%20Martin,%20tuve%20un%20error%20en%20el%20sistema%20de%20neuronalgravity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#25D366] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reportar incidente directamente por WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 border-t border-white/5 py-6 px-6 text-center text-xs text-neutral-400">
        <p>© 2026 Neuronal Gravity &bull; neuronalgravity.com &bull; <span className="text-[#38bdf8] font-semibold">by Martin Castillo</span> &bull; Infraestructura Segura.</p>
      </footer>

    </div>
  );
}
