'use client';

import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya aceptó las cookies previamente
    const consent = localStorage.getItem('defensati_cookie_consent');
    if (!consent) {
      // Pequeño retardo para que la animación de entrada sea elegante estilo Apple
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('defensati_cookie_consent', 'accepted');
    // Avisa a GoogleAnalytics para que cargue la medición sin recargar la página
    window.dispatchEvent(new Event('defensati-cookie-consent'));
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('defensati_cookie_consent', 'essential_only');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside 
      aria-label="Consentimiento de Cookies y Privacidad"
      className="fixed bottom-0 inset-x-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in-50 slide-in-from-bottom-5 duration-500"
    >
      <div className="p-3 sm:p-5 -2xl bg-[#0d0d0d] border border-white/15 text-[#f5f5f7] space-y-2 sm:space-y-4">

        {/* Móvil: una sola línea para no tapar el titular ni los botones */}
        <p className="sm:hidden text-[11px] text-neutral-300 leading-snug">
          Usamos cookies esenciales y analíticas (Ley N° 29733).
        </p>

        <div className="hidden sm:flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/[0.06] border border-white/20 flex items-center justify-center text-[#bdbdbd]">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#EDEDED] tracking-tight">Privacidad & Cookies</h4>
              <p className="text-[11px] text-neutral-400">Ley Peruana N° 29733 (LPDP)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEssentialOnly}
            aria-label="Cerrar banner de cookies"
            className="p-1 hover:bg-white/10 text-neutral-400 hover:text-[#EDEDED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="hidden sm:block text-xs text-neutral-300 leading-relaxed">
          Utilizamos cookies esenciales y analíticas técnicas no intrusivas para garantizar la seguridad perimetral, la persistencia de reportes sin base de datos y cumplir con el estándar nacional de protección de datos personales.
        </p>

        <div className="flex items-center gap-2 sm:pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 px-4 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] text-xs font-semibold transition-all"
          >
            Aceptar Todas
          </button>
          
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#EDEDED] text-xs font-medium transition-all"
          >
            Solo Esenciales
          </button>
        </div>

        <div className="hidden sm:flex text-[10px] text-neutral-500 items-center gap-1.5 pt-1 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EDEDED]" />
          <span>Datos cifrados de extremo a extremo sin venta a terceros</span>
        </div>

      </div>
    </aside>
  );
}
