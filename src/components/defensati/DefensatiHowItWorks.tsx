'use client';

import React from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

export default function DefensatiHowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Me escribes con el link de tu web',
      desc: 'Me mandas el enlace por WhatsApp y me cuentas brevemente qué le ocurre a tu sitio.',
      icon: WhatsAppIcon,
      iconColor: 'text-[#30d158]',
      accentBg: 'bg-[#30d158]/15 border-[#30d158]/30',
    },
    {
      num: '2',
      title: 'Reviso y te muestro qué encontré, gratis',
      desc: 'Analizo tu página y te comparto el diagnóstico exacto de fallas o infección antes de que pagues.',
      icon: Search,
      iconColor: 'text-[#38bdf8]',
      accentBg: 'bg-[#EDEDED] text-[#080808] border-white/20',
    },
    {
      num: '3',
      title: 'Si quieres, la limpio y la blindo',
      desc: 'Elimino virus, inyecciones maliciosas y accesos no autorizados, fortaleciendo el perímetro para minimizar drásticamente el riesgo de reinfección con garantía de 30 días.',
      icon: ShieldCheck,
      iconColor: 'text-[#c084fc]',
      accentBg: 'bg-[#c084fc]/15 border-[#c084fc]/30',
    },
  ];

  return (
    <section id="como-funciona" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 scroll-mt-24 text-left">
      <div className="p-6 sm:p-12 bg-[#0d0d0d] border border-white/10 space-y-8">
        
        {/* Cabecera Estilo Apple Pro */}
        <div className="space-y-2 border-b border-white/10 pb-5">
          <span className="text-xs font-mono uppercase tracking-widest text-[#bdbdbd] font-semibold px-3.5 py-1 bg-white/[0.06] border border-white/12 inline-block">
            CÓMO FUNCIONA
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-2">
            Solución en 3 pasos simples
          </h2>
        </div>

        {/* 3 Pasos: Gran Legibilidad, Letra Clara y Alto Contraste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-6 sm:p-8 bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-start space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 flex items-center justify-center border ${item.accentBg} ${item.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-[#EDEDED]/25 font-mono">
                    0{item.num}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] leading-snug tracking-tight">
                  {item.title}
                </h3>

                <p className="text-base sm:text-lg text-[#bdbdbd] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
