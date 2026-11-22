'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function DefensatiScanScope() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto bg-[#0d0d0d] border border-white/10 overflow-hidden transition-all text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#bdbdbd] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#EDEDED] tracking-tight">
              ¿Qué puede detectar este escáner gratuito y qué no?
            </h4>
            <p className="text-xs text-neutral-400">
              Conoce el alcance técnico exacto de la auditoría externa no invasiva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#bdbdbd] bg-white/[0.03] px-3 py-1.5 border border-white/10 shrink-0 ml-2">
          <span>{isOpen ? 'Ocultar' : 'Ver alcance'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 pt-0 border-t border-white/5 space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
            
            {/* Lo que SÍ detecta */}
            <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[#EDEDED] font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Lo que SÍ analiza (Perímetro Externo)</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-[13px] text-neutral-200 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Certificado SSL/TLS:</strong> Vigencia, días para caducar, emisor y protocolo seguro.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Cabeceras HTTP:</strong> Presencia de HSTS, CSP, X-Frame-Options y X-Content-Type.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Fuga de versiones:</strong> Software público visible (PHP, servidor Nginx/Apache, CMS).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Puertos expuestos:</strong> Puertos administrativos riesgosos abiertos a internet, cuando demuestras que el dominio es tuyo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Reputación de dominio:</strong> Presencia en listas negras públicas de spam/malware.</span>
                </li>
              </ul>
            </div>

            {/* Lo que NO puede detectar sin acceso interno */}
            <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[#EDEDED] font-bold text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Lo que NO detecta (Requiere Acceso Forense)</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-[13px] text-neutral-200 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Virus en archivos PHP o scripts en temas:</strong> Webshells en <code>/wp-content/</code> o inyecciones de código espía en plantillas Liquid (Shopify) o scripts de Wix.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Infecciones en base de datos:</strong> Administradores espurios o enlaces spam en tablas SQL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Plugins o aplicaciones de terceros vulnerables:</strong> Plugins desactualizados en WordPress o apps rogue con permisos abusivos en Shopify y Wix.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Redirecciones encubiertas (Cloaking):</strong> Virus que solo redirige a visitantes móviles desde Google.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Spam interno saliente:</strong> Scripts ocultos que provocan la suspensión de cuenta por tu hosting.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="p-3.5 bg-white/[0.04] border border-white/10 text-xs text-neutral-300 flex items-center justify-between gap-3 flex-wrap">
            <span>
              ¿Tu web redirige a páginas dudosas, muestra pantalla roja de Google o tu hosting la suspendió?
            </span>
            <span className="text-[#38bdf8] font-bold">
              Es una infección interna: requiere desinfección forense de archivos.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
