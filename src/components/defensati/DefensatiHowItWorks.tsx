'use client';

import React from 'react';
import { MessageSquare, Search, ShieldCheck } from 'lucide-react';

export default function DefensatiHowItWorks() {
  const steps = [
    {
      num: '1',
      title: '1. Me escribes con el link de tu web.',
      desc: 'Cuéntame qué está pasando con tu página (virus, redirecciones raras o si Google la bloqueó).',
      icon: MessageSquare,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
    },
    {
      num: '2',
      title: '2. Reviso y te muestro qué encontré, gratis.',
      desc: 'Analizo tu sitio sin cobrarte nada por adelantado. Te muestro las fallas o archivos infectados.',
      icon: Search,
      color: 'from-sky-500/20 to-blue-500/10',
      iconColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
    },
    {
      num: '3',
      title: '3. Si quieres, la limpio y la blindo.',
      desc: 'Elimino los virus por completo, recupero tus accesos y dejo tu web protegida con garantía de 30 días.',
      icon: ShieldCheck,
      color: 'from-purple-500/20 to-indigo-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/40',
    },
  ];

  return (
    <section id="como-funciona" className="w-full max-w-5xl mx-auto space-y-6 scroll-mt-24 text-left">
      <div className="p-6 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#12172a]/90 via-[#0c101e]/90 to-[#080b16]/95 border border-sky-500/30 shadow-[0_20px_50px_rgba(0,113,227,0.2)] backdrop-blur-2xl space-y-8 relative overflow-hidden">
        
        {/* Glow cósmico de cabecera */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="border-b border-white/15 pb-4 relative z-10">
          <h2 className="text-xs uppercase tracking-widest font-mono text-[#38bdf8] font-bold">
            CÓMO FUNCIONA
          </h2>
        </div>

        {/* 3 Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-[26px] bg-white/[0.04] border border-white/15 hover:border-sky-400/60 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-[0_10px_35px_rgba(0,113,227,0.25)]"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                <div className="space-y-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-white/10 border ${item.borderColor} flex items-center justify-center ${item.iconColor} shadow-[0_0_15px_rgba(56,189,248,0.2)]`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug pt-1 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
