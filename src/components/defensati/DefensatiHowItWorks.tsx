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
    <section id="como-funciona" className="w-full max-w-5xl mx-auto space-y-6 scroll-mt-24 px-4 sm:px-6">
      <div className="p-6 sm:p-10 rounded-[32px] bg-[#0c0d10] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-8 text-left relative overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Cómo funciona</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Solución en 3 pasos simples
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Sin burocracia &bull; Directo al grano
          </span>
        </div>

        {/* 3 Pasos (Mobile first: apilados verticalmente con amplio espacio de lectura) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#141416] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Glow suave */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${item.color} rounded-full blur-2xl pointer-events-none`} />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-white/5 border ${item.borderColor} flex items-center justify-center ${item.iconColor} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-black text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
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
