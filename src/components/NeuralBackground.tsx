'use client';

import { useEffect, useRef } from 'react';

const TOP_DOMAINS = [
  'google.com', 'apple.com', 'cloudflare.com', 'github.com',
  'amazon.com', 'microsoft.com', 'openai.com', 'netflix.com',
  'aws.amazon.com', 'vercel.com', 'meta.com', 'spotify.com',
  'stripe.com', 'docker.com', 'linux.org', 'wikipedia.org',
  'defensati.com', 'adobe.com', 'mit.edu', 'oracle.com'
];

interface DomainNode {
  domain: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  fontSize: number;
  isImportant: boolean;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface BlastWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SynapticPulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
  color: string;
}

interface NeuralProps {
  onSelectDomain?: (domain: string) => void;
  showDomains?: boolean;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

export default function NeuralBackground({ onSelectDomain, showDomains = true }: NeuralProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onSelectDomainRef = useRef(onSelectDomain);
  useEffect(() => {
    onSelectDomainRef.current = onSelectDomain;
  }, [onSelectDomain]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const isMobile = width < 768;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
    };

    resize();
    window.addEventListener('resize', resize);

    // Cantidad equilibrada de nodos para gran visibilidad sin saturación
    const count = isMobile ? (showDomains ? 36 : 48) : (showDomains ? 72 : 95);
    const nodes: DomainNode[] = [];
    const maxLinkDist = isMobile ? 120 : 175;

    const palette = ['#38bdf8', '#60a5fa', '#a855f7', '#ffffff', '#38bdf8'];

    for (let i = 0; i < count; i++) {
      const domain = TOP_DOMAINS[i % TOP_DOMAINS.length];
      const isImportant = i % 3 === 0;
      const vx = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5);
      const vy = (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5);

      nodes.push({
        domain,
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        radius: isImportant ? 3.5 : 2.4,
        fontSize: isImportant ? (isMobile ? 11 : 12) : (isMobile ? 10 : 11),
        isImportant,
        color: palette[i % palette.length],
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const mouse = { x: -2000, y: -2000, radius: isMobile ? 160 : 250 };
    const blasts: BlastWave[] = [];
    const pulses: SynapticPulse[] = [];

    // Generar pulsos sinápticos periódicos
    let lastPulseTime = 0;

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;

    const triggerBigBang = (clickX: number, clickY: number) => {
      blasts.push({
        x: clickX,
        y: clickY,
        radius: 12,
        maxRadius: Math.max(width, height) * 1.1,
        alpha: 1,
      });

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        let dx = node.x - clickX;
        let dy = node.y - clickY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        const force = Math.max(14, 38 - dist * 0.04);
        node.vx = (dx / dist) * force;
        node.vy = (dy / dist) * force;
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStartX = clientX;
      pointerStartY = clientY;
      pointerStartTime = Date.now();
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, button, a, form, nav, section, footer')) {
        return;
      }

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = Math.abs(clientX - pointerStartX);
      const deltaY = Math.abs(clientY - pointerStartY);
      const deltaTime = Date.now() - pointerStartTime;

      if (deltaX > 8 || deltaY > 8 || deltaTime > 250) {
        return;
      }

      const callback = onSelectDomainRef.current;
      if (callback) {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const dx = clientX - node.x;
          const dy = clientY - node.y;
          if (Math.sqrt(dx * dx + dy * dy) < 40) {
            callback(node.domain);
            break;
          }
        }
      }

      triggerBigBang(clientX, clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd);

    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // Despachar nuevo pulso sináptico cada ~400ms
      if (timestamp - lastPulseTime > 380 && nodes.length > 2) {
        lastPulseTime = timestamp;
        const sourceIdx = Math.floor(Math.random() * nodes.length);
        const sourceNode = nodes[sourceIdx];
        
        // Buscar un nodo cercano conectado
        let bestTargetIdx = -1;
        let bestDist = maxLinkDist;
        for (let k = 0; k < nodes.length; k++) {
          if (k === sourceIdx) continue;
          const dx = sourceNode.x - nodes[k].x;
          const dy = sourceNode.y - nodes[k].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestDist) {
            bestDist = d;
            bestTargetIdx = k;
          }
        }

        if (bestTargetIdx !== -1 && pulses.length < 18) {
          pulses.push({
            sourceIdx,
            targetIdx: bestTargetIdx,
            progress: 0,
            speed: 0.018 + Math.random() * 0.02,
            color: sourceNode.color,
          });
        }
      }

      // Ondas expansivas de clic (Big Bang)
      ctx.globalCompositeOperation = 'lighter';
      for (let b = blasts.length - 1; b >= 0; b--) {
        const blast = blasts[b];
        blast.radius += (blast.maxRadius - blast.radius) * 0.12 + 10;
        blast.alpha *= 0.92;

        ctx.beginPath();
        ctx.arc(blast.x, blast.y, blast.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${blast.alpha * 0.85})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (blast.alpha < 0.015 || blast.radius >= blast.maxRadius) {
          blasts.splice(b, 1);
        }
      }

      const total = nodes.length;

      // Actualizar posición de nodos
      for (let i = 0; i < total; i++) {
        const n1 = nodes[i];

        n1.vx += (n1.baseVx - n1.vx) * 0.035;
        n1.vy += (n1.baseVy - n1.vy) * 0.035;
        n1.x += n1.vx;
        n1.y += n1.vy;

        const dxM = mouse.x - n1.x;
        const dyM = mouse.y - n1.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);

        if (distM < mouse.radius && distM > 10) {
          const force = (1 - distM / mouse.radius) * 0.06;
          n1.x += dxM * force;
          n1.y += dyM * force;
        }

        if (n1.x < -80) n1.x = width + 80;
        else if (n1.x > width + 80) n1.x = -80;
        if (n1.y < -40) n1.y = height + 40;
        else if (n1.y > height + 40) n1.y = -40;
      }

      // 1. Dibujar líneas de conexión con alta visibilidad y elegancia
      for (let i = 0; i < total; i++) {
        const n1 = nodes[i];
        const r1x = Math.round(n1.x);
        const r1y = Math.round(n1.y);

        for (let j = i + 1; j < total; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDist) {
            const alpha = (1 - dist / maxLinkDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(r1x, r1y);
            ctx.lineTo(Math.round(n2.x), Math.round(n2.y));
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 2. Dibujar pulsos sinápticos viajando a lo largo de las conexiones
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const sNode = nodes[pulse.sourceIdx];
        const tNode = nodes[pulse.targetIdx];
        if (!sNode || !tNode) {
          pulses.splice(p, 1);
          continue;
        }

        const px = sNode.x + (tNode.x - sNode.x) * pulse.progress;
        const py = sNode.y + (tNode.y - sNode.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Dibujar nodos y etiquetas de dominios estilo Apple Dark Glass
      ctx.globalCompositeOperation = 'source-over';

      const centerX = width / 2;
      const heroCenterY = Math.min(height * 0.35, 340);

      for (let i = 0; i < total; i++) {
        const n1 = nodes[i];
        const renderX = Math.round(n1.x);
        const renderY = Math.round(n1.y);

        n1.twinklePhase += n1.twinkleSpeed;
        const pulseRatio = 0.8 + 0.3 * Math.sin(n1.twinklePhase);

        // Si el nodo está exactamente sobre el texto central del hero, se atenúa suavemente
        const distFromHeroCenter = Math.hypot(renderX - centerX, renderY - heroCenterY);
        const textOcclusionFactor = Math.min(1, Math.max(0.4, distFromHeroCenter / 260));

        // Halo difuso Apple Pro
        const haloRadius = n1.radius * 3 * pulseRatio;
        const halo = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, haloRadius);
        halo.addColorStop(0, n1.isImportant ? `rgba(56, 189, 248, ${0.9 * textOcclusionFactor})` : `rgba(168, 85, 247, ${0.75 * textOcclusionFactor})`);
        halo.addColorStop(0.5, `rgba(56, 189, 248, ${0.35 * textOcclusionFactor})`);
        halo.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.beginPath();
        ctx.arc(renderX, renderY, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Núcleo brillante
        ctx.beginPath();
        ctx.arc(renderX, renderY, n1.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        if (showDomains) {
          // Etiqueta Glass Badge estilo Apple
          const label = n1.domain;
          ctx.font = `600 ${n1.fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, monospace`;
          const textMetrics = ctx.measureText(label);
          const badgeW = textMetrics.width + 14;
          const badgeH = 20;
          const badgeX = renderX + 9;
          const badgeY = renderY - 10;

          // Fondo de cristal translúcido oscuro
          ctx.beginPath();
          drawRoundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, 10);
          ctx.fillStyle = n1.isImportant 
            ? `rgba(10, 17, 34, ${0.82 * textOcclusionFactor})` 
            : `rgba(6, 10, 20, ${0.74 * textOcclusionFactor})`;
          ctx.fill();

          // Borde fino de cristal Apple
          ctx.strokeStyle = n1.isImportant 
            ? `rgba(56, 189, 248, ${0.5 * textOcclusionFactor})` 
            : `rgba(255, 255, 255, ${0.18 * textOcclusionFactor})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Texto nítido
          ctx.fillStyle = n1.isImportant 
            ? `rgba(125, 211, 252, ${0.95 * textOcclusionFactor})` 
            : `rgba(241, 245, 249, ${0.85 * textOcclusionFactor})`;
          ctx.fillText(label, badgeX + 7, badgeY + 14);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showDomains]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
