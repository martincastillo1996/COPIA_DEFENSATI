'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuditEvent {
  status: 'green' | 'amber' | 'red';
  location: string;
  type: string;
  grade: string;
  action: string;
  timeAgo: string;
}

const RECENT_EVENTS: AuditEvent[] = [
  {
    status: 'green',
    location: 'Lima',
    type: 'Tienda WooCommerce',
    grade: 'Grado D → A',
    action: 'Blindaje + WAF Cloudflare implementado',
    timeAgo: 'Hace 3 min',
  },
  {
    status: 'red',
    location: 'Arequipa',
    type: 'Sitio WordPress Corporativo',
    grade: 'Grado F',
    action: 'Rescate de malware y limpieza forense iniciada',
    timeAgo: 'Hace 11 min',
  },
  {
    status: 'green',
    location: 'Trujillo',
    type: 'Portal Inmobiliario',
    grade: 'Grado A+',
    action: 'Sello oficial de seguridad emitido',
    timeAgo: 'Hace 24 min',
  },
  {
    status: 'amber',
    location: 'Cusco',
    type: 'E-Commerce con Niubiz',
    grade: 'Grado C',
    action: 'Contenido mixto y pasarela de cobro blindada',
    timeAgo: 'Hace 36 min',
  },
  {
    status: 'green',
    location: 'Lima',
    type: 'Clínica Dental / Web a Medida',
    grade: 'Grado A',
    action: 'Mantenimiento mensual 24/7 activo',
    timeAgo: 'Hace 48 min',
  },
];

export default function RecentScansTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % RECENT_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const event = RECENT_EVENTS[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Actividad en Vivo
          </span>
        </div>

        <div className="flex-1 truncate text-left text-neutral-300 font-mono text-[11px] flex items-center gap-2">
          <span className="text-white font-bold">{event.location}:</span>
          <span className="truncate">{event.type}</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            event.status === 'green' ? 'bg-emerald-500/20 text-emerald-300' : event.status === 'amber' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {event.grade}
          </span>
          <span className="hidden sm:inline text-neutral-400 text-[10px] truncate">&bull; {event.action}</span>
        </div>

        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
          {event.timeAgo}
        </span>
      </div>
    </div>
  );
}
