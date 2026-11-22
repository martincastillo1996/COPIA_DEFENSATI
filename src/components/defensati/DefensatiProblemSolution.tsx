'use client';

import { useState } from 'react';
import { Bug, ServerCrash, ShieldAlert, Activity, type LucideIcon } from 'lucide-react';

/**
 * Problema → solución estilo Apple: control segmentado Dueño / Desarrollador que cambia
 * el lenguaje de todas las tarjetas a la vez. Cada problema tiene su propio color.
 */
type View = 'owner' | 'dev';

const ITEMS: {
  icon: LucideIcon;
  color: string;
  tint: string;
  problem: string;
  result: string;
  owner: string;
  dev: string[];
}[] = [
  {
    icon: Bug,
    color: '#ff453a',
    tint: 'rgba(255,69,58,0.12)',
    problem: 'Mi web tiene virus o redirige a otra página',
    result: 'Web limpia y fuera de la lista roja de Google',
    owner: 'La limpio a fondo, hago que Google quite la pantalla roja y te doy 30 días de garantía.',
    dev: ['Forense de archivos y base de datos', 'Retiro de backdoors y rotación de credenciales', 'Revisión en Search Console'],
  },
  {
    icon: ServerCrash,
    color: '#ff9f0a',
    tint: 'rgba(255,159,10,0.12)',
    problem: 'El hosting me suspendió la cuenta',
    result: 'Cuenta reactivada con la web ya sana',
    owner: 'Hablo yo con tu hosting y la reactivo cuando tu web ya está limpia.',
    dev: ['Evidencia de limpieza para el proveedor', 'Cierre del vector de entrada', 'Reporte técnico de la intervención'],
  },
  {
    icon: ShieldAlert,
    color: '#0a84ff',
    tint: 'rgba(10,132,255,0.12)',
    problem: 'Me atacan bots, la web se cae o va lenta',
    result: 'Tu web sigue en línea aunque la ataquen',
    owner: 'Pongo un escudo delante de tu web que frena los ataques antes de que lleguen.',
    dev: ['Cloudflare WAF y reglas anti-bot', 'Rate limiting', 'Cabeceras HSTS, CSP y X-Frame-Options'],
  },
  {
    icon: Activity,
    color: '#30d158',
    tint: 'rgba(48,209,88,0.12)',
    problem: 'No sé si estoy seguro hasta que algo pasa',
    result: 'Te enteras antes que tus clientes',
    owner: 'Vigilo tu web todos los meses y te aviso por WhatsApp si algo falla.',
    dev: ['Monitoreo de uptime', 'Alertas de vencimiento SSL', 'Re-escaneos programados y reporte mensual'],
  },
];

export default function DefensatiProblemSolution() {
  const [view, setView] = useState<View>('owner');

  return (
    <section id="soluciones" className="scroll-mt-24 text-left">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#f5f5f7] leading-[1.05]">
            Lo que te pasa y cómo lo resuelvo.
          </h2>
          <p className="mt-4 text-lg text-[#a1a1a6] leading-snug">
            Elige cómo quieres leerlo: en simple o con el detalle técnico.
          </p>
        </div>

        <div role="tablist" aria-label="Tipo de explicación" className="inline-flex self-start sm:self-auto rounded-full bg-white/[0.08] p-1">
          {([['owner', 'Soy el dueño'], ['dev', 'Soy el desarrollador']] as const).map(([v, label]) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                view === v ? 'bg-[#f5f5f7] text-black' : 'text-[#a1a1a6] hover:text-[#f5f5f7]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {ITEMS.map(({ icon: Icon, color, tint, problem, result, owner, dev }) => (
          <article
            key={problem}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#151517]/90 p-7 sm:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl"
              style={{ background: tint }}
            />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: tint, color }}>
                <Icon className="h-6 w-6" aria-hidden />
              </div>

              <h3 className="mt-6 text-xl sm:text-2xl font-semibold tracking-tight text-[#f5f5f7] leading-snug">{problem}</h3>

              {view === 'owner' ? (
                <p className="mt-3 text-[17px] text-[#a1a1a6] leading-relaxed">{owner}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dev.map((d) => (
                    <li key={d} className="flex gap-3 text-[15px] text-[#a1a1a6] leading-snug">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                      {d}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-6 inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium" style={{ background: tint, color }}>
                {result}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
