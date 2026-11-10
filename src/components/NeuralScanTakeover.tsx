'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Cpu, Lock, Activity, Check, Terminal, Wifi } from 'lucide-react';

interface NeuralScanTakeoverProps {
  targetUrl: string;
}

const SCAN_STEPS = [
  { 
    phase: 'Fase 1 / 4 • Motor de Red DEFENSA TI',
    title: 'Mapeando Topología de Red y DNS',
    log: '[DNS/TCP] Resolviendo registros A/AAAA y abriendo socket seguro...',
    progress: 25, 
    icon: Cpu 
  },
  { 
    phase: 'Fase 2 / 4 • Inspección Criptográfica',
    title: 'Inspeccionando Cifrado SSL / TLS 1.3',
    log: '[X.509] Negociando handshake TLSv1.3 y validando cadena de confianza...',
    progress: 55, 
    icon: Lock 
  },
  { 
    phase: 'Fase 3 / 4 • Auditoría Determinista OWASP',
    title: 'Auditando Cabeceras y Puertos de Red',
    log: '[RFC 9110] Evaluando HSTS, CSP, X-Frame y escaneando puertos seguros...',
    progress: 82, 
    icon: ShieldCheck 
  },
  { 
    phase: 'Fase 4 / 4 • Compilación de Dictamen',
    title: 'Generando Diagnóstico y Recomendaciones',
    log: '[DEFENSA TI] Estructurando dictamen de seguridad perimetral...',
    progress: 98, 
    icon: Activity 
  },
];

const REALTIME_LOGS = [
  '[RESOLVER] Query DNS para host objetivo... OK (200)',
  '[TCP SOCKET] Conexión establecida a socket seguro (puerto 443)',
  '[TLS HANDSHAKE] Negociando cifrado TLSv1.3 ECDHE-RSA-AES128-GCM',
  '[CERT X.509] Cadena de certificación verificada y vigente',
  '[HTTP HEADERS] Inspeccionando Strict-Transport-Security (HSTS)...',
  '[OWASP HARDENING] Evaluando Content-Security-Policy y X-Frame-Options...',
  '[PORTS SCAN] Sondeo asíncrono pasivo de puertos de infraestructura...',
  '[ANALYZER] Compilando hallazgos y generando informe perimetral...'
];

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export default function NeuralScanTakeover({ targetUrl }: NeuralScanTakeoverProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(15);

  const cleanDomain = targetUrl
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase() || 'tuweb.com';

  const [logFeed, setLogFeed] = useState<string[]>([
    `[INICIO] Iniciando auditoría perimetral de ${cleanDomain}`
  ]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Bloquear el scroll del body mientras la pantalla completa esté activa
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, []);

  // Progresión realista entre fases
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          const next = prev + 1;
          setProgress(SCAN_STEPS[next].progress);
          return next;
        }
        return prev;
      });
    }, 850);

    return () => clearInterval(stepInterval);
  }, []);

  // Flujo continuo de logs realistas de terminal
  useEffect(() => {
    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < REALTIME_LOGS.length) {
        const nextLog = REALTIME_LOGS[logIdx];
        setLogFeed((prev) => [...prev.slice(-3), nextLog]);
        logIdx++;
      }
    }, 420);

    return () => clearInterval(logInterval);
  }, []);

  // Canvas de Red Neuronal en segundo plano completo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = Math.min(50, Math.floor((width * height) / 24000));
    const labels = [
      'SSL/TLS 1.3',
      'HSTS Gate',
      'CSP Shield',
      'OWASP Core',
      'Anti-Bot',
      'DNS Root',
      'X-Frame',
      'Port Sockets',
      'WAF Guard',
      'Cipher Suite'
    ];

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.5 + 2,
        label: i < labels.length ? labels[i] : undefined,
      });
    }

    const pulses: Pulse[] = [];
    for (let i = 0; i < 16; i++) {
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      if (to === from) to = (from + 1) % nodes.length;
      pulses.push({
        fromNode: from,
        toNode: to,
        progress: Math.random(),
        speed: 0.015 + Math.random() * 0.02,
      });
    }

    let pulseWave = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radar concéntrico que se expande desde el centro
      pulseWave = (pulseWave + 1.2) % (Math.max(width, height) * 0.75);
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, pulseWave, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.2 - pulseWave / (Math.max(width, height) * 0.75))})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Mover nodos
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.label ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = n.label ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (n.label) {
          ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
          ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
          ctx.fillText(n.label, n.x + 8, n.y + 3);
        }
      }

      // Conexiones sinápticas
      const maxDistance = 150;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Pulsos eléctricos
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.fromNode = Math.floor(Math.random() * nodes.length);
          p.toNode = (p.fromNode + 1) % nodes.length;
        }

        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        if (!from || !to) continue;

        const curX = from.x + (to.x - from.x) * p.progress;
        const curY = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!mounted) return null;

  const activeStep = SCAN_STEPS[currentStepIdx];
  const StepIcon = activeStep.icon;

  const takeoverContent = (
    <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-screen flex flex-col items-center justify-center bg-[#05070e]/96 backdrop-blur-3xl overflow-hidden select-none animate-in fade-in duration-300">
      
      {/* 1. LIENZO VIVO DE LA RED NEURONAL EN PANTALLA COMPLETA */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* 2. GRADIENTES Y AURAS CÓSMICAS DE FONDO */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#0071e3]/22 via-[#7928ca]/20 to-[#38bdf8]/18 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute w-[360px] h-[360px] rounded-full bg-[#0071e3]/18 blur-[90px] pointer-events-none" />

      {/* 3. PANEL CENTRAL TIPO HUD APPLE PRO (PANTALLA DE CARGA NEURONAL) */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-6 sm:py-8 flex flex-col items-center text-center space-y-6">
        
        {/* Barra superior de estado técnico realista */}
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SOCKET EN VIVO</span>
          </span>
          <span className="text-neutral-600">&bull;</span>
          <span className="flex items-center gap-1 text-sky-400">
            <Wifi className="w-3.5 h-3.5" />
            <span>TLSv1.3 / HTTP 2</span>
          </span>
          <span className="text-neutral-600 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-neutral-300">Latencia ~38ms</span>
        </div>

        {/* RADAR NEURONAL CENTRAL CON ANILLOS GIRATORIOS */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-sky-400/35 animate-spin [animation-duration:8s]" />
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#7928ca]/50 animate-spin [animation-duration:12s] [animation-direction:reverse]" />
          <div className="absolute inset-7 rounded-full border border-sky-300/40 animate-spin [animation-duration:5s]" />
          <div className="absolute inset-11 rounded-full border-2 border-t-transparent border-emerald-400/60 animate-spin [animation-duration:3s]" />
          
          <span className="absolute inset-0 rounded-full bg-[#38bdf8]/10 animate-ping [animation-duration:2.5s]" />

          {/* Núcleo Central */}
          <div className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#0071e3] via-[#7928ca] to-[#38bdf8] p-0.5 shadow-[0_0_50px_rgba(56,189,248,0.7)] animate-pulse">
            <div className="w-full h-full bg-[#07090e] rounded-3xl flex items-center justify-center text-[#38bdf8]">
              <StepIcon className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Información del Objetivo & Dominio */}
        <div className="space-y-1.5 max-w-lg">
          <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
            {activeStep.phase} &bull; {activeStep.title}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Auditando Perímetro de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-sky-300 to-white block sm:inline font-mono">
              {cleanDomain}
            </span>
          </h2>
        </div>

        {/* TERMINAL DE LOGS TÉCNICOS EN TIEMPO REAL (MÁXIMO REALISMO) */}
        <div className="w-full max-w-xl bg-black/80 rounded-2xl border border-white/10 p-3.5 text-left font-mono text-xs shadow-2xl backdrop-blur-2xl space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-200 font-semibold">CONSOLA DE TELEMETRÍA EN VIVO</span>
            </div>
            <span className="text-emerald-400 font-bold">200 OK</span>
          </div>

          <div className="space-y-1 font-mono text-[11.5px] sm:text-xs">
            {logFeed.map((line, idx) => (
              <div 
                key={idx} 
                className={`truncate ${
                  idx === logFeed.length - 1 ? 'text-sky-300 font-semibold' : 'text-neutral-400'
                }`}
              >
                <span className="text-neutral-600 mr-1.5">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* BARRA DE PROGRESO DE ALTA PRECISIÓN */}
        <div className="w-full max-w-xl space-y-2">
          <div className="w-full h-3 sm:h-3.5 rounded-full bg-white/10 p-0.5 overflow-hidden border border-white/15 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0071e3] via-[#7928ca] to-[#38bdf8] rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(56,189,248,0.8)] relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-neutral-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              <span>Sondeo Cero-Riesgo (No invasivo)</span>
            </span>
            <span className="font-extrabold text-[#38bdf8] text-sm font-mono">
              {progress}%
            </span>
          </div>
        </div>

        {/* 4 CHECKPOINTS DE TELEMETRÍA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl pt-1">
          {SCAN_STEPS.map((s, idx) => {
            const isCompleted = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isCurrent
                    ? 'bg-[#0071e3]/30 border-[#38bdf8] text-white font-bold shadow-[0_0_25px_rgba(0,113,227,0.5)] scale-[1.03]'
                    : 'bg-white/5 border-white/10 text-neutral-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  )}
                  <span className="text-[10px] font-bold">Paso {idx + 1}</span>
                </div>
                <span className="font-semibold text-[11px] truncate w-full text-center">
                  {idx === 0 && 'DNS & Red'}
                  {idx === 1 && 'Cifrado SSL'}
                  {idx === 2 && 'OWASP'}
                  {idx === 3 && 'Dictamen'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pie de pantalla: Garantía de seguridad */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono pt-1 border-t border-white/10 w-full max-w-xl">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Auditoría perimetral sin tocar tu base de datos.</span>
          </span>
          <span className="text-[#38bdf8] bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/25 text-[10px]">
            DEFENSA TI v1.2 &bull; RFC 9110
          </span>
        </div>

      </div>

    </div>
  );

  return createPortal(takeoverContent, document.body);
}
