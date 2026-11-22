'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Cerebro neuronal a pantalla completa, optimizado: pocas neuronas, trazos agrupados por color
 * (un path por bucket en vez de uno por axón), sin mezcla aditiva, resolución acotada y buffers
 * reutilizados. El puntero excita neuronas (cascada), el clic lanza una onda y el scroll recorre
 * el cerebro. Decorativo (aria-hidden); se pausa con la pestaña oculta.
 */
type V3 = { x: number; y: number; z: number };
type Edge = { a: number; b: number; o: number; hb: number };
type Pulse = { e: number; dir: 1 | -1; t: number; s: number };

const HB = 6; // buckets de color
const bucketColor = (b: number) => 188 + (b / (HB - 1)) * 135;

const fold = (x: number, y: number, z: number) =>
  Math.sin(x * 7.3 + 1.2) * Math.sin(y * 8.1) * Math.sin(z * 6.7 + 2.1) * 0.6 + Math.sin(x * 15 + y * 11 + z * 9) * 0.25;

function buildBrain(total: number) {
  const nodes: V3[] = [];
  const surf = (cx: number, rx: number, ry: number, rz: number, ox = 0, oy = 0, oz = 0, f = 0.09) => {
    let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random() * 2 - 1;
    const l = Math.hypot(x, y, z) || 1;
    x /= l; y /= l; z /= l;
    const inner = Math.random() < 0.2 ? 0.4 + Math.random() * 0.5 : 1;
    const k = 1 + fold(x * rx + cx, y * ry, z * rz) * f * (inner === 1 ? 1 : 0.3);
    return { x: ox + cx + x * rx * k * inner, y: oy + y * ry * k * inner * (y < -0.3 ? 0.8 : 1), z: oz + z * rz * k * inner };
  };
  const cortex = Math.floor(total * 0.78);
  for (let i = 0; i < cortex; i++) nodes.push(surf(i % 2 ? 0.31 : -0.31, 0.58, 0.64, 1.0));
  for (let i = 0; i < total * 0.1; i++) nodes.push(surf(0, 0.28, 0.2, 0.46, (i % 2 ? 1 : -1) * 0.62, -0.34, 0.2, 0.07));
  for (let i = 0; i < total * 0.09; i++) nodes.push(surf(0, 0.5, 0.26, 0.4, 0, -0.52, -0.62, 0.16));
  for (let i = 0; i < total * 0.03; i++) {
    const t = Math.random();
    nodes.push({ x: (Math.random() - 0.5) * 0.1, y: -0.55 - t * 0.55, z: -0.25 - t * 0.12 + (Math.random() - 0.5) * 0.1 });
  }
  const edges: Edge[] = [];
  const adj: number[][] = nodes.map(() => []);
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const near: Array<{ j: number; d: number }> = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const b = nodes[j];
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (d < 0.07) near.push({ j, d });
    }
    near.sort((u, v) => u.d - v.d);
    for (const o of near.slice(0, 3)) {
      const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const hb = Math.max(0, Math.min(HB - 1, Math.round(((a.x + 0.95) / 1.9) * (HB - 1))));
      edges.push({ a: i, b: o.j, o: (Math.random() - 0.5) * 0.6, hb });
      adj[i].push(edges.length - 1);
      adj[o.j].push(edges.length - 1);
    }
  });
  // polvo neuronal 3D en todo el volumen: llena la pantalla y sale de ella por delante de la cámara
  const dust = Math.round(total * 0.45);
  for (let i = 0; i < dust; i++) {
    nodes.push({ x: (Math.random() - 0.5) * 4.2, y: (Math.random() - 0.5) * 3.2, z: (Math.random() - 0.5) * 3.2 });
    adj.push([]);
  }
  return { nodes, edges, adj };
}

export default function NeuralGravityField({ className = '', global = false }: { className?: string; global?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    let w = 0, h = 0, raf = 0, spin = 0, lastScroll = 0, lastBuild = 0;
    let brain = buildBrain(320);
    let N = brain.nodes.length;
    let act = new Float32Array(N);
    let px = new Float32Array(N), py = new Float32Array(N), pd = new Float32Array(N);
    const mouse = { x: -999, y: -999, tx: -999, ty: -999, in: false };
    const pulses: Pulse[] = [];
    const waves: Array<{ x: number; y: number; r: number }> = [];
    const MAXP = 90;
    let amb: Array<{ x: number; y: number; vx: number; vy: number }> = [];

    const rebuild = (want: number) => {
      if (want === lastBuild) return;
      lastBuild = want;
      brain = buildBrain(want);
      N = brain.nodes.length;
      act = new Float32Array(N); px = new Float32Array(N); py = new Float32Array(N); pd = new Float32Array(N);
      pulses.length = 0;
    };
    lastBuild = 320;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild(w < 700 ? 180 : 320);
      const n = global ? Math.min(36, Math.floor((w * h) / 30000)) : 0;
      amb = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }));
    };
    const move = (e: PointerEvent) => {
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      if (!mouse.in) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      mouse.in = true;
    };
    const leave = () => { mouse.in = false; };
    const fire = (node: number, strength = 1) => {
      act[node] = Math.max(act[node], strength);
      for (const ei of brain.adj[node]) {
        if (pulses.length >= MAXP) break;
        pulses.push({ e: ei, dir: brain.edges[ei].a === node ? 1 : -1, t: 0, s: 0.03 + Math.random() * 0.03 });
      }
    };
    const press = (ev: PointerEvent) => {
      waves.push({ x: ev.clientX, y: ev.clientY, r: 0 });
      for (let i = 0; i < N; i++) if (Math.hypot(px[i] - ev.clientX, py[i] - ev.clientY) < 160 && Math.random() < 0.5) fire(i);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const sMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const sp = global ? Math.min(1, window.scrollY / sMax) : 0;
      const sv = global ? Math.abs(window.scrollY - lastScroll) : 0;
      lastScroll = window.scrollY;
      const t = performance.now() / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.15;
      mouse.y += (mouse.ty - mouse.y) * 0.15;

      // red ambiente (pocos nodos)
      if (amb.length) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(120,140,255,0.16)';
        ctx.beginPath();
        for (const n of amb) {
          if (mouse.in) {
            const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
            if (d < 260 && d > 1) { n.vx += (dx / d) * 0.035; n.vy += (dy / d) * 0.035; }
          }
          n.vx *= 0.985; n.vy *= 0.985; n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
        for (let i = 0; i < amb.length; i++) {
          const a = amb[i];
          for (let j = i + 1; j < amb.length; j++) {
            const b = amb[j];
            if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < 19600) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
          }
          if (mouse.in && (a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2 < 57600) { ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); }
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(160,170,255,0.6)';
        ctx.beginPath();
        for (const a of amb) { ctx.moveTo(a.x + 1.3, a.y); ctx.arc(a.x, a.y, 1.3, 0, 6.3); }
        ctx.fill();
      }

      // cámara
      const wide = w > 900;
      const zoom = 1 + Math.sin(sp * Math.PI) * 0.5;
      const R = Math.max(w * (wide ? 0.42 : 0.85), h * 0.72) * zoom;
      const cx = w * (0.5 + Math.sin(sp * 6) * 0.08);
      const cy = h * (0.5 + Math.sin(sp * 5) * 0.08);
      const nx = mouse.in ? (mouse.x - w / 2) / w : 0;
      const ny = mouse.in ? (mouse.y - h / 2) / h : 0;
      spin += 0.0028;
      const rotY = 1.1 + Math.sin(spin) * 0.35 + nx * 1.3 + sp * Math.PI * 1.6;
      const rotX = 0.1 + ny * 0.7 + Math.sin(sp * 4) * 0.15;
      const cr = Math.cos(rotY), sr = Math.sin(rotY), cxr = Math.cos(rotX), sxr = Math.sin(rotX);
      const beat = 1 + 0.02 * Math.sin(t * 2.0);
      const reach = R * 0.55;

      const ns = brain.nodes;
      for (let i = 0; i < N; i++) {
        const p = ns[i];
        const x = p.x * cr + p.z * sr;
        let z = -p.x * sr + p.z * cr;
        const y = p.y * cxr - z * sxr;
        z = p.y * sxr + z * cxr;
        const persp = Math.min(3.2, 1 / Math.max(0.3, 1 - z * 0.5));
        let sx = cx + x * R * beat * persp;
        let sy = cy + y * R * beat * persp;
        if (mouse.in) {
          const dx = mouse.x - sx, dy = mouse.y - sy, d = Math.hypot(dx, dy);
          if (d < reach && d > 0.5) { const f = (1 - d / reach) ** 2 * 0.4; sx += dx * f; sy += dy * f; }
          if (d < 70 && act[i] < 0.5 && Math.random() < 0.15) fire(i, 1);
        }
        px[i] = sx; py[i] = sy; pd[i] = Math.max(0, Math.min(1.4, (z + 1) / 2));
      }
      if (sv > 6) for (let k = 0; k < Math.min(4, sv / 15); k++) fire((Math.random() * N) | 0, 0.8);
      if (Math.random() < 0.12) fire((Math.random() * N) | 0, 0.7);

      // axones: un path por color (apagados) + individuales solo los activos
      ctx.lineWidth = 1;
      const lit: number[] = [];
      const edges = brain.edges;
      for (let b = 0; b < HB; b++) {
        ctx.strokeStyle = `hsla(${bucketColor(b)},100%,62%,0.17)`;
        ctx.beginPath();
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.hb !== b) continue;
          if (act[e.a] > 0.2 || act[e.b] > 0.2) { lit.push(i); continue; }
          const mx = (px[e.a] + px[e.b]) / 2 - (py[e.b] - py[e.a]) * e.o;
          const my = (py[e.a] + py[e.b]) / 2 + (px[e.b] - px[e.a]) * e.o;
          ctx.moveTo(px[e.a], py[e.a]);
          ctx.quadraticCurveTo(mx, my, px[e.b], py[e.b]);
        }
        ctx.stroke();
      }
      for (const i of lit) {
        const e = edges[i];
        const a = Math.max(act[e.a], act[e.b]);
        const mx = (px[e.a] + px[e.b]) / 2 - (py[e.b] - py[e.a]) * e.o;
        const my = (py[e.a] + py[e.b]) / 2 + (px[e.b] - px[e.a]) * e.o;
        ctx.strokeStyle = `hsla(${bucketColor(e.hb)},100%,70%,${0.25 + a * 0.55})`;
        ctx.beginPath(); ctx.moveTo(px[e.a], py[e.a]); ctx.quadraticCurveTo(mx, my, px[e.b], py[e.b]); ctx.stroke();
      }

      // neuronas: apagadas por bucket en un solo path; activas con halo
      for (let b = 0; b < HB; b++) {
        ctx.fillStyle = `hsla(${bucketColor(b)},100%,68%,0.7)`;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          if (act[i] > 0.1) continue;
          const hb = Math.max(0, Math.min(HB - 1, Math.round(((ns[i].x + 0.95) / 1.9) * (HB - 1))));
          if (hb !== b) continue;
          const r = 0.6 + pd[i] * pd[i] * 3.4;
          ctx.moveTo(px[i] + r, py[i]);
          ctx.arc(px[i], py[i], r, 0, 6.3);
        }
        ctx.fill();
      }
      for (let i = 0; i < N; i++) {
        const a = act[i];
        if (a > 0.1) {
          const hue = 188 + ((ns[i].x + 0.95) / 1.9) * 135;
          ctx.fillStyle = `hsla(${hue},100%,70%,${a * 0.28})`;
          ctx.beginPath(); ctx.arc(px[i], py[i], 4 + a * 10, 0, 6.3); ctx.fill();
          ctx.fillStyle = `hsla(${hue},100%,${70 + a * 25}%,0.95)`;
          ctx.beginPath(); ctx.arc(px[i], py[i], 1.5 + a * 2.5, 0, 6.3); ctx.fill();
        }
        act[i] = a * 0.95;
      }

      // bokeh: neuronas muy cercanas a la cámara, grandes y desenfocadas
      ctx.fillStyle = 'rgba(120,160,255,0.07)';
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        if (pd[i] > 1.0) { const r = 10 + (pd[i] - 1) * 90; ctx.moveTo(px[i] + r, py[i]); ctx.arc(px[i], py[i], r, 0, 6.3); }
      }
      ctx.fill();

      // impulsos
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.s;
        const e = edges[p.e];
        const ai = p.dir === 1 ? e.a : e.b, bi = p.dir === 1 ? e.b : e.a;
        const mx = (px[e.a] + px[e.b]) / 2 - (py[e.b] - py[e.a]) * e.o;
        const my = (py[e.a] + py[e.b]) / 2 + (px[e.b] - px[e.a]) * e.o;
        const u = Math.min(1, p.t), iu = 1 - u;
        const x = iu * iu * px[ai] + 2 * iu * u * mx + u * u * px[bi];
        const y = iu * iu * py[ai] + 2 * iu * u * my + u * u * py[bi];
        ctx.moveTo(x + 2, y);
        ctx.arc(x, y, 2, 0, 6.3);
        if (p.t >= 1) {
          pulses.splice(i, 1);
          act[bi] = Math.max(act[bi], 0.9);
          if (Math.random() < 0.55 && pulses.length < MAXP) {
            const nb = brain.adj[bi];
            const k = nb[(Math.random() * nb.length) | 0];
            if (k !== undefined && k !== p.e) pulses.push({ e: k, dir: edges[k].a === bi ? 1 : -1, t: 0, s: p.s });
          }
        }
      }
      ctx.fill();

      // ondas del clic
      for (let i = waves.length - 1; i >= 0; i--) {
        const wv = waves[i];
        wv.r += 10;
        ctx.strokeStyle = `rgba(0,229,255,${Math.max(0, 0.6 - wv.r / 600)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, 6.3); ctx.stroke();
        for (let k = 0; k < N; k++) if (Math.abs(Math.hypot(px[k] - wv.x, py[k] - wv.y) - wv.r) < 12) act[k] = Math.max(act[k], 0.9);
        if (wv.r > 600) waves.splice(i, 1);
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', press);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [global]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${global ? 'fixed' : 'absolute'} inset-0 h-full w-full ${className}`} />;
}
