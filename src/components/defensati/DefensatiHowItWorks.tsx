'use client';

import React from 'react';
import { MessageSquare, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function DefensatiHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Me escribes por WhatsApp',
      desc: 'Nos pasas el link de tu web y nos cuentas qué está pasando (redirecciones sospechosas, hackeo visible o prevención).',
      icon: MessageSquare,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      badge: 'Paso 1',
    },
    {
      step: '02',
      title: 'Te mando lo que encontré en tu web',
      desc: 'Revisamos tu sitio y te mostramos el diagnóstico con los puntos vulnerables o archivos infectados antes de que pagues.',
      icon: Search,
      color: 'from-sky-500/20 to-blue-500/10',
      iconColor: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      badge: 'Paso 2',
    },
    {
      step: '03',
      title: 'La limpio y la blindo',
      desc: 'Eliminamos el malware por completo y aplicamos las directivas de blindaje perimetral para que no te vuelvan a entrar.',
      icon: ShieldCheck,
      color: 'from-purple-500/20 to-indigo-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      badge: 'Paso 3',
    },
  ];

  return (
    <section id="como-funciona" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 scroll-mt-24">
      <div className="p-6 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#12172a]/90 via-[#0c101e]/90 to-[#080b16]/95 border border-sky-500/30 shadow-[0_20px_50px_rgba(0,113,227,0.2)] backdrop-blur-2xl space-y-8 text-left relative overflow-hidden">
        
        {/* Glow cósmico de cabecera */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-[#38bdf8] text-xs font-bold tracking-tight shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cómo funciona</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300 tracking-tight leading-snug">
              Solución en 3 pasos simples
            </h2>
          </div>
          <span className="text-xs text-sky-300/80 font-mono bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            Sin burocracia &bull; Directo al grano
          </span>
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
                {/* Glow suave */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-white/10 border ${item.borderColor} flex items-center justify-center ${item.iconColor} shadow-[0_0_15px_rgba(56,189,248,0.2)]`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#38bdf8] bg-sky-500/15 px-3 py-1 rounded-full border border-sky-400/30">
                      {item.badge}
                    </span>
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
