'use client';

import { useEffect, useRef } from 'react';

// Catálogo selecto de dominios de seguridad, CMS, infraestructura cloud y tecnología global
interface WebDomainDef {
  domain: string;
  category: 'security' | 'cms' | 'cloud' | 'tech';
  priority: boolean;
}

const WEB_DOMAINS: WebDomainDef[] = [
  { domain: 'defensati.com', category: 'security', priority: true },
  { domain: 'cloudflare.com', category: 'security', priority: true },
  { domain: 'wordpress.org', category: 'cms', priority: true },
  { domain: 'woocommerce.com', category: 'cms', priority: true },
  { domain: 'aws.amazon.com', category: 'cloud', priority: true },
  { domain: 'google.com', category: 'tech', priority: true },
  { domain: 'github.com', category: 'tech', priority: true },
  { domain: 'shopify.com', category: 'cms', priority: true },
  { domain: 'stripe.com', category: 'security', priority: true },
  { domain: 'vercel.com', category: 'cloud', priority: false },
  { domain: 'openai.com', category: 'tech', priority: true },
  { domain: 'linux.org', category: 'tech', priority: false },
  { domain: 'docker.com', category: 'cloud', priority: false },
  { domain: 'digitalocean.com', category: 'cloud', priority: false },
  { domain: 'cpanel.net', category: 'cms', priority: false },
  { domain: 'apple.com', category: 'tech', priority: false },
  { domain: 'microsoft.com', category: 'cloud', priority: false },
  { domain: 'netflix.com', category: 'tech', priority: false },
  { domain: 'spotify.com', category: 'tech', priority: false },
  { domain: 'meta.com', category: 'tech', priority: false },
  { domain: 'sunat.gob.pe', category: 'security', priority: false },
  { domain: 'bcp.com.pe', category: 'security', priority: false },
  { domain: 'wikipedia.org', category: 'tech', priority: false },
  { domain: 'mit.edu', category: 'tech', priority: false },
  { domain: 'debian.org', category: 'tech', priority: false },
  { domain: 'prestashop.com', category: 'cms', priority: false },
];

interface Node3D {
  domain: string;
  category: 'security' | 'cms' | 'cloud' | 'tech';
  priority: boolean;
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  glowColor: string;
  pulsePhase: number;
  pulseSpeed: number;
  screenX: number;
  screenY: number;
  scale: number;
  depthAlpha: number;
  z2: number;
  visible: boolean;
  neighbors: number[];
}

interface SynapseImpulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface NeuralProps {
  onSelectDomain?: (domain: string) => void;
  showDomains?: boolean;
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

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;

    // Cap devicePixelRatio to 2 to prevent GPU fill-rate throttling on 4K/retina displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
    };

    resize();
    window.addEventListener('resize', resize);

    // ==========================================
    // 1. GENERACIÓN DE NODOS EN ESPACIO 3D
    // ==========================================
    const nodeCount = isMobile ? 36 : (showDomains ? 68 : 80);
    const nodes: Node3D[] = [];

    // Distribución esférica volumétrica 3D uniforme con Fibonacci Spiral
    const sphereRadiusX = isMobile ? 260 : 440;
    const sphereRadiusY = isMobile ? 240 : 380;
    const sphereRadiusZ = isMobile ? 280 : 440;

    for (let i = 0; i < nodeCount; i++) {
      const def = WEB_DOMAINS[i % WEB_DOMAINS.length];
      
      // Espiral esférica tridimensional de Fibonacci
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      // Variación orgánica de profundidad
      const radialJitter = 0.72 + Math.random() * 0.45;
      const x = Math.sin(phi) * Math.cos(theta) * sphereRadiusX * radialJitter;
      const y = Math.cos(phi) * sphereRadiusY * radialJitter;
      const z = Math.sin(phi) * Math.sin(theta) * sphereRadiusZ * radialJitter;

      // Colores de alta gama Apple Pro Dark / Cyberpunk
      let color = '#38bdf8'; // Cyan
      let glowColor = 'rgba(56, 189, 248, 0.45)';

      if (def.category === 'cms') {
        color = '#c084fc'; // Violeta neón
        glowColor = 'rgba(192, 132, 252, 0.45)';
      } else if (def.category === 'cloud') {
        color = '#60a5fa'; // Azul zafiro
        glowColor = 'rgba(96, 165, 250, 0.4)';
      } else if (def.category === 'tech') {
        color = '#34d399'; // Esmeralda / Menta
        glowColor = 'rgba(52, 211, 153, 0.4)';
      }

      if (def.domain === 'defensati.com') {
        color = '#00f0ff'; // Super Cyan Eléctrico
        glowColor = 'rgba(0, 240, 255, 0.75)';
      }

      nodes.push({
        domain: def.domain,
        category: def.category,
        priority: def.priority,
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: 0,
        vy: 0,
        vz: 0,
        radius: def.priority ? 3.8 : 2.5,
        color,
        glowColor,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.025,
        screenX: 0,
        screenY: 0,
        scale: 1,
        depthAlpha: 1,
        z2: 0,
        visible: true,
        neighbors: [],
      });
    }

    // ==========================================
    // 2. PRE-CÁLCULO DE SINAPSIS (VECINOS MÁS CERCANOS 3D)
    // ==========================================
    // Pre-calculamos los enlaces fijos para que el loop de render sea ultraligero O(N) a 120 FPS
    const maxNeighbors = isMobile ? 2 : 3;
    for (let i = 0; i < nodes.length; i++) {
      const distances: { index: number; dist: number }[] = [];
      const n1 = nodes[i];

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const n2 = nodes[j];
        const dx = n1.baseX - n2.baseX;
        const dy = n1.baseY - n2.baseY;
        const dz = n1.baseZ - n2.baseZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        distances.push({ index: j, dist });
      }

      distances.sort((a, b) => a.dist - b.dist);
      nodes[i].neighbors = distances.slice(0, maxNeighbors).map(d => d.index);
    }

    // ==========================================
    // 3. IMPULSOS ELÉCTRICOS SINÁPTICOS (FOTONES)
    // ==========================================
    const impulseCount = isMobile ? 14 : 32;
    const impulses: SynapseImpulse[] = [];

    for (let i = 0; i < impulseCount; i++) {
      const from = Math.floor(Math.random() * nodes.length);
      const neighborList = nodes[from].neighbors;
      const to = neighborList.length > 0 ? neighborList[Math.floor(Math.random() * neighborList.length)] : (from + 1) % nodes.length;

      impulses.push({
        from,
        to,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.012,
        color: i % 2 === 0 ? '#38bdf8' : '#c084fc',
        size: 2.2 + Math.random() * 1.4,
      });
    }

    // ==========================================
    // 4. INTERACTIVIDAD 3D (MOUSE / TOUCH)
    // ==========================================
    let mouseX = -2000;
    let mouseY = -2000;
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;
    let autoRotY = 0;

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;

    const shockwaves: Shockwave[] = [];

    const triggerShockwave = (clickX: number, clickY: number) => {
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.85,
        alpha: 1,
      });

      // Impulso físico 3D a los nodos cercanos al clic
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.visible) continue;
        const dx = n.screenX - clickX;
        const dy = n.screenY - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 320) {
          const force = (1 - dist / 320) * 18;
          n.vx += (dx / (dist || 1)) * force;
          n.vy += (dy / (dist || 1)) * force;
          n.vz += (Math.random() - 0.5) * force * 1.5;
        }
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
      if (target.closest('input, button, a, form, nav, section, footer, [role="button"]')) {
        return;
      }

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = Math.abs(clientX - pointerStartX);
      const deltaY = Math.abs(clientY - pointerStartY);
      const deltaTime = Date.now() - pointerStartTime;

      if (deltaX > 8 || deltaY > 8 || deltaTime > 300) return;

      // Comprobar si se hizo clic sobre un nodo de dominio visible
      const callback = onSelectDomainRef.current;
      if (callback) {
        let selectedDomain: string | null = null;
        let closestDist = 38;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (!n.visible || n.depthAlpha < 0.25) continue;
          const dx = clientX - n.screenX;
          const dy = clientY - n.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < closestDist) {
            closestDist = dist;
            selectedDomain = n.domain;
          }
        }

        if (selectedDomain) {
          callback(selectedDomain);
        }
      }

      triggerShockwave(clientX, clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetRotY = ((e.clientX / width) - 0.5) * 0.75;
      targetRotX = -((e.clientY / height) - 0.5) * 0.45;
    };

    const onMouseLeave = () => {
      mouseX = -2000;
      mouseY = -2000;
      targetRotX = 0;
      targetRotY = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        targetRotY = ((mouseX / width) - 0.5) * 0.75;
        targetRotX = -((mouseY / height) - 0.5) * 0.45;
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Pausar animación cuando la pestaña está oculta para ahorrar 100% CPU/batería
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ==========================================
    // 5. MOTOR DE RENDERIZADO 3D (60-120 FPS)
    // ==========================================
    let lastTime = performance.now();

    const render = () => {
      if (!isTabVisible) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Centro de proyección de pantalla
      const cx = width / 2;
      const cy = height * 0.42; // Ligeramente elevado para coronar la sección Hero

      // Rotación continua + Lerp de inclinación con el ratón
      autoRotY += 0.12 * dt;
      curRotY += (targetRotY - curRotY) * 0.05;
      curRotX += (targetRotX - curRotX) * 0.05;

      const totalAngleY = autoRotY + curRotY;
      const totalAngleX = curRotX + Math.sin(now * 0.0006) * 0.08;

      const cosY = Math.cos(totalAngleY);
      const sinY = Math.sin(totalAngleY);
      const cosX = Math.cos(totalAngleX);
      const sinX = Math.sin(totalAngleX);

      const fov = isMobile ? 380 : 520;
      const camZ = isMobile ? 620 : 700;

      // Actualizar y proyectar todos los nodos a 3D
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Fricción física y retorno elástico suave
        n.vx *= 0.94;
        n.vy *= 0.94;
        n.vz *= 0.94;
        n.x += (n.baseX - n.x) * 0.02 + n.vx;
        n.y += (n.baseY - n.y) * 0.02 + n.vy;
        n.z += (n.baseZ - n.z) * 0.02 + n.vz;

        // Rotación 3D alrededor de Y
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;

        // Rotación 3D alrededor de X
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        n.z2 = z2;
        const projectedZ = z2 + camZ;

        if (projectedZ <= 40) {
          n.visible = false;
          continue;
        }

        const scale = fov / projectedZ;
        n.scale = scale;
        n.screenX = cx + x1 * scale;
        n.screenY = cy + y2 * scale;

        // Depth cueing: mayor contraste y brillo al frente, sutil en el fondo
        const depthNorm = (z2 + sphereRadiusZ) / (sphereRadiusZ * 2);
        n.depthAlpha = Math.max(0.18, Math.min(1.0, 0.2 + depthNorm * 0.8));
        n.visible = true;
      }

      // ==========================================
      // A. DIBUJAR SINAPSIS NEURONALES (AXONES 3D)
      // ==========================================
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (!n1.visible) continue;

        for (let k = 0; k < n1.neighbors.length; k++) {
          const j = n1.neighbors[k];
          if (j < i) continue; // Evitar trazo duplicado
          const n2 = nodes[j];
          if (!n2.visible) continue;

          const linkAlpha = Math.min(n1.depthAlpha, n2.depthAlpha) * 0.38;
          if (linkAlpha < 0.04) continue;

          ctx.beginPath();
          ctx.moveTo(n1.screenX, n1.screenY);
          ctx.lineTo(n2.screenX, n2.screenY);
          ctx.strokeStyle = `rgba(56, 189, 248, ${linkAlpha})`;
          ctx.stroke();
        }
      }

      // ==========================================
      // B. IMPULSOS ELÉCTRICOS (FOTONES SINÁPTICOS)
      // ==========================================
      for (let i = 0; i < impulses.length; i++) {
        const imp = impulses[i];
        imp.progress += imp.speed;

        if (imp.progress >= 1) {
          imp.progress = 0;
          imp.from = imp.to;
          const nextNeighbors = nodes[imp.from].neighbors;
          if (nextNeighbors.length > 0) {
            imp.to = nextNeighbors[Math.floor(Math.random() * nextNeighbors.length)];
          } else {
            imp.to = (imp.from + 1) % nodes.length;
          }
        }

        const nFrom = nodes[imp.from];
        const nTo = nodes[imp.to];
        if (!nFrom.visible || !nTo.visible) continue;

        const p = imp.progress;
        const curX = nFrom.screenX + (nTo.screenX - nFrom.screenX) * p;
        const curY = nFrom.screenY + (nTo.screenY - nFrom.screenY) * p;
        const curScale = nFrom.scale + (nTo.scale - nFrom.scale) * p;
        const impAlpha = Math.min(nFrom.depthAlpha, nTo.depthAlpha) * 0.85;

        // Fotón con resplandor neón
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(1.5, imp.size * curScale), 0, Math.PI * 2);
        ctx.fillStyle = imp.color;
        ctx.globalAlpha = impAlpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // ==========================================
      // C. ONDAS EXPANSIVAS DE CHOQUE (SHOCKWAVES)
      // ==========================================
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += (sw.maxRadius - sw.radius) * 0.08 + 6;
        sw.alpha *= 0.93;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha * 0.65})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (sw.alpha < 0.015 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // ==========================================
      // D. DIBUJAR NODOS Y DOMINIOS (ORDENADOS POR PROFUNDIDAD Z)
      // ==========================================
      // Ordenar por Z para que los dominios frontales tapen limpiamente a los traseros
      const sortedIndices: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].visible) sortedIndices.push(i);
      }
      sortedIndices.sort((a, b) => nodes[a].z2 - nodes[b].z2);

      for (let idx = 0; idx < sortedIndices.length; idx++) {
        const n = nodes[sortedIndices[idx]];

        n.pulsePhase += n.pulseSpeed;
        const pulse = 0.88 + 0.24 * Math.sin(n.pulsePhase);
        const nodeRadius = Math.max(1.8, n.radius * n.scale * pulse);

        // Distancia al cursor para efecto hover dinámico
        const dxM = mouseX - n.screenX;
        const dyM = mouseY - n.screenY;
        const isHovered = (dxM * dxM + dyM * dyM) < 900; // Radio 30px

        const effectiveAlpha = isHovered ? 1.0 : n.depthAlpha;

        // 1. Halo difuso brillante (Glow)
        const glowRadius = nodeRadius * (isHovered ? 4.5 : 3.0);
        const halo = ctx.createRadialGradient(n.screenX, n.screenY, 0, n.screenX, n.screenY, glowRadius);
        halo.addColorStop(0, n.glowColor);
        halo.addColorStop(0.5, n.glowColor.replace(/[\d.]+\)$/, `${0.2 * effectiveAlpha})`));
        halo.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // 2. Núcleo central del nodo
        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#ffffff' : n.color;
        ctx.globalAlpha = Math.min(1.0, effectiveAlpha * 1.2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 3. Etiqueta del Dominio Web (Solo si showDomains es true y no está demasiado lejos)
        if (showDomains && (effectiveAlpha > 0.32 || isHovered)) {
          const fontSize = Math.max(9, Math.round((n.priority ? 12 : 10.5) * n.scale * (isHovered ? 1.15 : 1.0)));
          ctx.font = `${n.priority ? '600' : '500'} ${fontSize}px ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace`;

          const textWidth = ctx.measureText(n.domain).width;
          const textHeight = fontSize + 6;
          const padX = 6;
          const pillX = n.screenX + nodeRadius + 5;
          const pillY = n.screenY - textHeight / 2;

          // Fondo Glass Dark Apple Pro para el badge de dominio
          ctx.fillStyle = isHovered 
            ? 'rgba(10, 16, 32, 0.9)' 
            : `rgba(6, 10, 22, ${0.72 * effectiveAlpha})`;
          
          ctx.beginPath();
          const ctxWithRoundRect = ctx as CanvasRenderingContext2D & {
            roundRect?: (x: number, y: number, w: number, h: number, radii?: number | number[]) => void;
          };
          if (typeof ctxWithRoundRect.roundRect === 'function') {
            ctxWithRoundRect.roundRect(pillX, pillY, textWidth + padX * 2, textHeight, 5);
          } else {
            ctx.rect(pillX, pillY, textWidth + padX * 2, textHeight);
          }
          ctx.fill();

          // Borde del badge con color de categoría
          ctx.strokeStyle = isHovered 
            ? '#38bdf8' 
            : (n.priority ? `rgba(56, 189, 248, ${0.45 * effectiveAlpha})` : `rgba(255, 255, 255, ${0.12 * effectiveAlpha})`);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Texto legible de alta definición
          ctx.fillStyle = isHovered 
            ? '#ffffff' 
            : (n.priority ? '#7dd3fc' : `rgba(241, 245, 249, ${Math.min(1, effectiveAlpha * 1.1)})`);
          ctx.fillText(n.domain, pillX + padX, pillY + textHeight - 4);
        } else if (!showDomains) {
          // Modo estelar limpio (para Home / Error)
          if (n.priority) {
            ctx.beginPath();
            ctx.arc(n.screenX, n.screenY, nodeRadius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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