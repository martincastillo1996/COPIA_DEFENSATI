'use client';
/* eslint-disable react-hooks/immutability -- R3F muta cámara, buffers y uniforms dentro de useFrame por diseño */

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { isLand, loadLandMask } from './earth';
import { PHASES, type WorldState } from './phases';

/* ── Paleta Glacial HUD ── */
const ICE = new THREE.Color('#cfe3ee');
const DIM = new THREE.Color('#4a535b');
const THREAT = new THREE.Color('#ff4d3d');
const AMBER = new THREE.Color('#f2b84b');
const BG = '#0a0c0f';

type WRef = MutableRefObject<WorldState>;
export interface Overlays {
  fade: RefObject<HTMLDivElement | null>;
  dim: RefObject<HTMLDivElement | null>;
  label: RefObject<HTMLSpanElement | null>;
  bar: RefObject<HTMLDivElement | null>;
}

/* PRNG determinista (mulberry32): mantiene el render puro */
let seed = 0x9e3779b9;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randDir = (v: THREE.Vector3) => {
  const u = rand() * 2 - 1;
  const th = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return v.set(Math.cos(th) * r, u, Math.sin(th) * r);
};

/* ── Geografía real ── */
const R = 6;
const D2R = Math.PI / 180;
function toVec(lat: number, lon: number, r = R, out = new THREE.Vector3()) {
  const phi = (90 - lat) * D2R;
  const th = (lon + 180) * D2R;
  return out.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
const LIMA = toVec(-12.05, -77.04);
const LIMA_N = LIMA.clone().normalize();
/* Rotaciones que dejan Lima mirando a la cámara (+Z) */
const FACE_Y = Math.atan2(-LIMA.x, LIMA.z);
const FACE_X = Math.atan2(LIMA.y, Math.hypot(LIMA.x, LIMA.z));

/* Grandes nodos de datacenters desde donde suelen operar botnets y VPS alquilados */
const ORIGINS: [number, number][] = [
  [39.04, -77.49], [-23.55, -46.63], [52.37, 4.9], [50.11, 8.68], [1.35, 103.82],
  [35.68, 139.69], [19.08, 72.88], [-26.2, 28.05], [37.57, 126.98], [6.52, 3.38],
  [19.43, -99.13], [4.71, -74.07], [-34.6, -58.38], [34.05, -118.24], [22.32, 114.17],
  [55.76, 37.62], [41.01, 28.98], [-33.87, 151.21], [40.42, -3.7], [25.76, -80.19],
  [48.86, 2.35], [51.51, -0.13], [45.5, -73.57], [-33.45, -70.67], [31.23, 121.47],
];

/* ── Cámara: un fotograma por fase; dos "saltos" entre la Tierra y el servidor ── */
const O = new THREE.Vector3(0, 0, -300);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const o = (x: number, y: number, z: number) => O.clone().add(v(x, y, z));
type Key = { p: THREE.Vector3; l: THREE.Vector3 };
const KEYS: Key[] = [
  { p: v(0, 2.5, 21), l: v(0, 0, 0) }, // 0 objetivo
  { p: v(4.5, 1.5, 13.5), l: v(0, 0, 2) }, // 1 reconocimiento
  { p: v(0.9, 1.1, 9.2), l: v(0, 0, R) }, // 2 intrusión
  { p: o(6, 3, 12), l: o(0, 0, 0) }, // 3 explotación (servidor)
  { p: o(0.6, 0, -32), l: o(0, 0, -48) }, // 4 persistencia (puerta trasera)
  { p: o(0, 0, -68), l: o(0, 0, -80) }, // 5 respuesta
  { p: v(-5.5, 1.5, 13.5), l: v(0, 0, 2) }, // 6 detección
  { p: v(5, -1.5, 15), l: v(0, 0, 1) }, // 7 contención
  { p: v(0, 4, 24), l: v(0, 0, 0) }, // 8 recuperación
];
const JUMPS: Record<number, { exit: Key; entry: Key }> = {
  2: { exit: { p: v(0, 0, R + 0.3), l: v(0, 0, 0) }, entry: { p: o(0, 0, 48), l: o(0, 0, 0) } },
  5: { exit: { p: o(0, 0, -73), l: o(0, 0, -80) }, entry: { p: v(0, 0, 42), l: v(0, 0, 0) } },
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/* Intensidad del ataque por fase */
const INTENSITY = [0.35, 0.55, 1, 0.6, 0.6, 0.6, 0.5, 0.85, 0.2];

function Director({ world, overlays }: { world: WRef; overlays: Overlays }) {
  const { camera, scene } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lastLabel = useRef(-1);

  useFrame((state, rawDt) => {
    const w = world.current;
    const dt = Math.min(rawDt, 0.1);
    w.dt = dt * w.speed;
    w.time += w.dt;
    w.eased = THREE.MathUtils.damp(w.eased, w.phase, 3.2, dt);

    const f = Math.min(w.eased, KEYS.length - 1.0001);
    const i = Math.floor(f);
    const t = smooth(f - i);
    const jump = JUMPS[i];
    let fade = 0;
    if (jump) {
      if (t < 0.5) {
        const u = smooth(t * 2);
        pos.lerpVectors(KEYS[i].p, jump.exit.p, u);
        look.lerpVectors(KEYS[i].l, jump.exit.l, u);
      } else {
        const u = smooth((t - 0.5) * 2);
        pos.lerpVectors(jump.entry.p, KEYS[i + 1].p, u);
        look.lerpVectors(jump.entry.l, KEYS[i + 1].l, u);
      }
      fade = clamp01(1 - Math.abs(t - 0.5) / 0.18);
    } else {
      pos.lerpVectors(KEYS[i].p, KEYS[i + 1].p, t);
      look.lerpVectors(KEYS[i].l, KEYS[i + 1].l, t);
    }

    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, state.pointer.x, 2, dt);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, state.pointer.y, 2, dt);
    pos.x += mouse.current.x * 0.7;
    pos.y += mouse.current.y * 0.45;
    camera.position.copy(pos);
    camera.lookAt(look);

    // Niebla distinta para la órbita y para el interior del servidor
    const inner = camera.position.z < -150;
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = inner ? 14 : 28;
      fog.far = inner ? 46 : 80;
    }

    // Capas DOM: fundido en los saltos, atenuación para leer el contenido, HUD
    if (overlays.fade.current) overlays.fade.current.style.opacity = fade.toFixed(3);
    if (overlays.dim.current) overlays.dim.current.style.opacity = (clamp01((w.eased - 5.5) * 2) * 0.82).toFixed(3);
    if (overlays.bar.current) overlays.bar.current.style.transform = `scaleX(${(w.eased / (KEYS.length - 1)).toFixed(4)})`;
    const li = Math.min(PHASES.length - 1, Math.floor(w.eased + 0.2));
    if (li !== lastLabel.current && overlays.label.current) {
      lastLabel.current = li;
      overlays.label.current.textContent = `Fase ${String(li).padStart(2, '0')} · ${PHASES[li]}`;
    }
  });
  return null;
}

/* ── Shader de fresnel para atmósfera y cúpula ── */
const fresnelVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const fresnelFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uHit; uniform float uTime; uniform float uAlpha; uniform float uPow;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(1.0 - abs(dot(vN, vV)), uPow);
    float scan = 0.6 + 0.4 * sin(vN.y * 30.0 - uTime * 2.5);
    vec3 col = mix(uColor, vec3(1.0, 0.33, 0.24), uHit * 0.7);
    gl_FragColor = vec4(col, (f * scan + uHit * 0.25 * f) * uAlpha);
  }`;
/* Atmósfera: brillo suave que se desvanece hacia afuera (sin aro duro) */
const atmoFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha;
  varying vec3 vN; varying vec3 vV;
  void main(){
    // Cara trasera: máximo junto al borde de la Tierra, cero en el borde exterior
    float i = pow(abs(dot(vN, vV)), 5.0) * 0.9;
    gl_FragColor = vec4(uColor, clamp(i, 0.0, 1.0) * uAlpha);
  }`;
const makeFresnel = (color: THREE.Color, pow: number, alpha: number) => ({
  uColor: { value: color.clone() },
  uHit: { value: 0 },
  uTime: { value: 0 },
  uAlpha: { value: alpha },
  uPow: { value: pow },
});

/* ── La Tierra: continentes reales, Lima y ataques en arco ── */
function Earth({ world, dots }: { world: WRef; dots: number }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const yRot = useRef(FACE_Y - 1.1);
  const [land, setLand] = useState<Float32Array | null>(null);

  useEffect(() => {
    let alive = true;
    loadLandMask()
      .then((mask) => {
        const pts: number[] = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        const v3 = new THREE.Vector3();
        for (let i = 0; i < dots; i++) {
          const y = 1 - (i / (dots - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = golden * i;
          v3.set(Math.cos(th) * r, y, Math.sin(th) * r);
          const lat = Math.asin(v3.y) / D2R;
          const lon = ((Math.atan2(v3.z, -v3.x) / D2R + 360) % 360) - 180;
          if (isLand(mask, lat, lon)) pts.push(v3.x * R * 1.003, v3.y * R * 1.003, v3.z * R * 1.003);
        }
        if (alive) setLand(new Float32Array(pts));
      })
      .catch(() => {
        /* Sin mapa: queda la esfera y los ataques */
      });
    return () => {
      alive = false;
    };
  }, [dots]);

  /* Arcos de gran círculo desde cada origen hasta Lima */
  const SEG = 64;
  const arcs = useMemo(() => {
    const a = new THREE.Vector3();
    const b = LIMA_N.clone();
    const curves = ORIGINS.map(([lat, lon]) => {
      toVec(lat, lon, 1, a);
      const ang = a.angleTo(b);
      const h = 0.12 + ang * 0.35;
      const pts: THREE.Vector3[] = [];
      const q = new THREE.Quaternion();
      const axis = new THREE.Vector3().crossVectors(a, b).normalize();
      for (let s = 0; s <= SEG; s++) {
        const u = s / SEG;
        q.setFromAxisAngle(axis, ang * u);
        const p = a.clone().applyQuaternion(q);
        pts.push(p.multiplyScalar(R * (1 + Math.sin(Math.PI * u) * h)));
      }
      return pts;
    });
    const lines = new Float32Array(curves.length * SEG * 6);
    curves.forEach((pts, k) => {
      for (let s = 0; s < SEG; s++) {
        const p = pts[s];
        const n = pts[s + 1];
        lines.set([p.x, p.y, p.z, n.x, n.y, n.z], (k * SEG + s) * 6);
      }
    });
    return {
      curves,
      lines,
      offset: curves.map(() => rand()),
      speed: curves.map(() => 0.22 + rand() * 0.3),
    };
  }, []);

  const heads = useMemo(() => new Float32Array(ORIGINS.length * 3), []);
  const headCol = useMemo(() => new Float32Array(ORIGINS.length * 3), []);
  const headGeo = useRef<THREE.BufferGeometry>(null);
  const arcGeo = useRef<THREE.BufferGeometry>(null);
  const arcMat = useRef<THREE.LineBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const col = useMemo(() => new THREE.Color(), []);

  const atmo = useMemo(() => makeFresnel(ICE, 3.2, 0.45), []);
  const dome = useMemo(() => makeFresnel(ICE, 1.8, 0), []);
  const domeQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), LIMA_N), []);
  const hitLevel = useRef(0);

  useFrame(() => {
    const w = world.current;
    const t = w.time;
    const e = w.eased;

    /* Rotación: gira libre al inicio y al final; en el ataque, Lima mira a cámara */
    if (spin.current && tilt.current) {
      if (e < 0.55 || e > 7.6) {
        yRot.current += w.dt * 0.07;
      } else {
        const k = Math.round((yRot.current - FACE_Y) / (Math.PI * 2));
        yRot.current = THREE.MathUtils.damp(yRot.current, FACE_Y + k * Math.PI * 2, 2.2, w.dt || 0.016);
      }
      spin.current.rotation.y = yRot.current;
      tilt.current.rotation.x = FACE_X;
    }

    const fi = Math.min(Math.floor(e), INTENSITY.length - 2);
    let intensity = THREE.MathUtils.lerp(INTENSITY[fi], INTENSITY[fi + 1], e - fi);
    if (w.scan === 'scanning') intensity = 1;
    const shielded = e > 5.5 || w.scan === 'done';
    const active = Math.max(3, Math.ceil(intensity * ORIGINS.length));
    const end = shielded ? 0.955 : 1;

    let hits = 0;
    arcs.curves.forEach((pts, k) => {
      const on = k < active;
      let u = (t * arcs.speed[k] + arcs.offset[k]) % 1;
      if (u > end) {
        hits++;
        u = end;
      }
      if (!on) {
        heads.set([0, 0, 0], k * 3);
        headCol.set([0, 0, 0], k * 3);
        return;
      }
      const s = u * SEG;
      const a = pts[Math.floor(s)];
      const b = pts[Math.min(SEG, Math.floor(s) + 1)];
      tmp.lerpVectors(a, b, s - Math.floor(s));
      heads.set([tmp.x, tmp.y, tmp.z], k * 3);
      col.copy(THREAT);
      if (shielded && u > end - 0.08) col.lerp(ICE, (u - (end - 0.08)) / 0.08);
      headCol.set([col.r, col.g, col.b], k * 3);
    });
    if (headGeo.current) {
      headGeo.current.attributes.position.needsUpdate = true;
      headGeo.current.attributes.color.needsUpdate = true;
    }
    if (arcGeo.current) arcGeo.current.setDrawRange(0, active * SEG * 2);
    if (arcMat.current) {
      arcMat.current.opacity = 0.08 + 0.32 * intensity;
      arcMat.current.color.copy(shielded ? DIM : THREAT).lerp(THREAT, shielded ? 0.35 : 0);
    }

    /* Cúpula sobre Lima: aparece en la intrusión, se enciende con impactos */
    hitLevel.current = THREE.MathUtils.damp(hitLevel.current, Math.min(1, hits / 2), 8, w.dt || 0.016);
    const domeAlpha = clamp01((e - 1.2) * 1.5) * (e > 7.8 ? 0.6 : 1);
    dome.uAlpha.value = domeAlpha;
    dome.uTime.value = t;
    dome.uHit.value = shielded ? hitLevel.current * 0.3 : hitLevel.current;
    const target =
      w.scan === 'done' && w.score !== null ? (w.score >= 80 ? ICE : w.score >= 50 ? AMBER : THREAT) : shielded ? ICE : THREAT;
    dome.uColor.value.lerp(target, 0.05);
    atmo.uTime.value = t;

    /* Pulso de Lima: más rápido durante un escaneo */
    const rate = w.scan === 'scanning' ? 2.4 : 0.7;
    [ring.current, ring2.current].forEach((m, idx) => {
      if (!m) return;
      const p = (t * rate + idx * 0.5) % 1;
      m.scale.setScalar(0.2 + p * 1.6);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.8;
    });
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[R * 0.995, 64, 64]} />
          <meshBasicMaterial color="#0d1217" />
        </mesh>
        {land && (
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[land, 3]} />
            </bufferGeometry>
            <pointsMaterial color={ICE} size={0.042} sizeAttenuation transparent opacity={0.85} />
          </points>
        )}
        <lineSegments>
          <bufferGeometry ref={arcGeo}>
            <bufferAttribute attach="attributes-position" args={[arcs.lines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={arcMat} color={THREAT} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <points>
          <bufferGeometry ref={headGeo}>
            <bufferAttribute attach="attributes-position" args={[heads, 3]} />
            <bufferAttribute attach="attributes-color" args={[headCol, 3]} />
          </bufferGeometry>
          <pointsMaterial vertexColors size={0.2} sizeAttenuation transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>

        {/* Lima */}
        <group position={LIMA} quaternion={domeQuat}>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color={ICE} />
          </mesh>
          <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.31, 48]} />
            <meshBasicMaterial color={ICE} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.31, 48]} />
            <meshBasicMaterial color={ICE} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.05, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <shaderMaterial
              vertexShader={fresnelVert}
              fragmentShader={fresnelFrag}
              uniforms={dome}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* Atmósfera */}
      <mesh>
        <sphereGeometry args={[R * 1.16, 64, 64]} />
        <shaderMaterial
          vertexShader={fresnelVert}
          fragmentShader={atmoFrag}
          uniforms={atmo}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── Fase 03 · Explotación: el servidor de la víctima ── */
function ServerRacks({ world }: { world: WRef }) {
  const COLS = 5;
  const UNITS = 10;
  const N = COLS * UNITS;
  const units = useRef<THREE.InstancedMesh>(null);
  const frames = useRef<THREE.InstancedMesh>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const pkt = useRef<THREE.BufferGeometry>(null);
  const PK = 90;

  const layout = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const ledList: THREE.Matrix4[] = [];
    for (let c = 0; c < COLS; c++) {
      for (let u = 0; u < UNITS; u++) {
        const x = (c - (COLS - 1) / 2) * 3.2;
        const y = (u - (UNITS - 1) / 2) * 0.62;
        list.push(new THREE.Matrix4().makeTranslation(x, y, 0));
        ledList.push(new THREE.Matrix4().makeTranslation(x + 0.95, y, 0.61));
      }
    }
    return { list, ledList };
  }, []);

  useEffect(() => {
    [units.current, frames.current].forEach((m) => {
      if (!m) return;
      layout.list.forEach((mx, i) => m.setMatrixAt(i, mx));
      m.instanceMatrix.needsUpdate = true;
    });
    if (leds.current) {
      layout.ledList.forEach((mx, i) => leds.current!.setMatrixAt(i, mx));
      leds.current.instanceMatrix.needsUpdate = true;
    }
  }, [layout]);

  const packets = useMemo(() => {
    const pos = new Float32Array(PK * 3);
    const lane = Array.from({ length: PK }, () => ({
      y: (Math.floor(rand() * UNITS) - (UNITS - 1) / 2) * 0.62,
      off: rand(),
      v: 0.15 + rand() * 0.3,
      bad: rand() < 0.18,
    }));
    return { pos, lane };
  }, []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const w = world.current;
    if (w.eased < 2.4 || w.eased > 5.6) return; // fuera de cuadro: no gastar CPU
    const t = w.time;
    if (leds.current) {
      for (let i = 0; i < N; i++) {
        const blink = Math.sin(t * (2 + (i % 7)) + i) > 0.2;
        // El servidor comprometido: cada vez más LEDs en rojo durante la explotación
        const infected = i % 13 === 0 || (w.eased > 2.8 && w.eased < 4.8 && i % 4 === 0);
        color.copy(infected ? THREAT : ICE).multiplyScalar(blink ? 1 : 0.15);
        leds.current.setColorAt(i, color);
      }
      if (leds.current.instanceColor) leds.current.instanceColor.needsUpdate = true;
    }
    const W = COLS * 3.2;
    packets.lane.forEach((l, i) => {
      const x = (((t * l.v + l.off) % 1) - 0.5) * W * 1.4;
      packets.pos.set([x, l.y, 0.9], i * 3);
    });
    if (pkt.current) pkt.current.attributes.position.needsUpdate = true;
  });

  return (
    <group position={O} rotation={[0, -0.35, 0]}>
      <instancedMesh ref={units} args={[undefined, undefined, N]}>
        <boxGeometry args={[2.6, 0.5, 1.2]} />
        <meshBasicMaterial color="#10161b" />
      </instancedMesh>
      <instancedMesh ref={frames} args={[undefined, undefined, N]}>
        <boxGeometry args={[2.62, 0.52, 1.22]} />
        <meshBasicMaterial color={DIM} wireframe transparent opacity={0.35} />
      </instancedMesh>
      <instancedMesh ref={leds} args={[undefined, undefined, N]}>
        <boxGeometry args={[0.35, 0.06, 0.02]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <points>
        <bufferGeometry ref={pkt}>
          <bufferAttribute attach="attributes-position" args={[packets.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={ICE} size={0.12} sizeAttenuation transparent blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/* ── Fase 04 · Persistencia: la puerta trasera escondida en el código ── */
function Backdoor({ world, steps }: { world: WRef; steps: number }) {
  const group = useRef<THREE.Group>(null);
  const LEN = 34;
  const geo = useRef<THREE.BufferGeometry>(null);

  const { strands, rungs, colors, infected } = useMemo(() => {
    const strands = new Float32Array(steps * 6);
    const colors = new Float32Array(steps * 6);
    const rungs = new Float32Array(steps * 6);
    const infected: number[] = [];
    for (let i = 0; i < steps; i++) {
      const z = (i / steps) * LEN - LEN / 2;
      const a = i * 0.32;
      const r = 2.2;
      const p1 = [Math.cos(a) * r, Math.sin(a) * r, z];
      const p2 = [Math.cos(a + Math.PI) * r, Math.sin(a + Math.PI) * r, z];
      strands.set(p1, i * 6);
      strands.set(p2, i * 6 + 3);
      if (i % 11 === 0) infected.push(i);
      if (i % 3 === 0) rungs.set([...p1, ...p2], i * 6);
    }
    return { strands, rungs, colors, infected };
  }, [steps]);

  useFrame(() => {
    const w = world.current;
    if (w.eased < 3.4 || w.eased > 5.6) return;
    if (group.current) group.current.rotation.z += w.dt * 0.25;
    // Al llegar la respuesta (fase 05), los bits infectados se limpian
    const clean = clamp01((w.eased - 4.5) * 2);
    for (let i = 0; i < steps; i++) {
      const bad = infected.includes(i);
      const c = bad ? THREAT.clone().lerp(ICE, clean) : ICE;
      colors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    }
    if (geo.current) geo.current.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={group} position={o(0, 0, -40)}>
      <points>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[strands, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial vertexColors size={0.12} sizeAttenuation transparent blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[rungs, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ICE} transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

/* ── Fase 05 · Respuesta: el escudo de DEFENSA TI hecho de nodos de red ── */
const SHIELD_D =
  'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z';

function insidePoly(x: number, y: number, poly: THREE.Vector2[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function NodeShield({ world }: { world: WRef }) {
  const group = useRef<THREE.Group>(null);
  const nodeGeo = useRef<THREE.BufferGeometry>(null);
  const linkGeo = useRef<THREE.BufferGeometry>(null);
  const linkMat = useRef<THREE.LineBasicMaterial>(null);
  const ringGeo = useRef<THREE.BufferGeometry>(null);

  const net = useMemo(() => {
    // Contorno real del escudo del logo (public/branding/defensa-ti-avatar.svg)
    const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${SHIELD_D}"/></svg>`);
    const shape = svg.paths.flatMap((p) => SVGLoader.createShapes(p))[0];
    const outline = shape.getSpacedPoints(150);
    const target: number[] = [];
    const kind: number[] = []; // 0 contorno, 1 interior, 2 check
    const bulge = (x: number, y: number) => 1.6 * Math.sqrt(Math.max(0, 1 - (x * x) / 90 - (y * y) / 130));

    // Contorno: doble capa para dar grosor al borde
    outline.forEach((pt, i) => {
      const x = pt.x - 12;
      const y = -(pt.y - 12);
      target.push(x, y, bulge(x, y) * 0.35 + (i % 2 ? 0.25 : -0.25));
      kind.push(0);
    });
    // Interior: retícula hexagonal levemente desordenada, abombada como un escudo
    const step = 0.95;
    for (let gy = 2.5; gy < 22.5; gy += step * 0.866) {
      const row = Math.round(gy / (step * 0.866));
      for (let gx = 3.5; gx < 20.5; gx += step) {
        const px = gx + (row % 2 ? step / 2 : 0) + (rand() - 0.5) * 0.25;
        const py = gy + (rand() - 0.5) * 0.25;
        if (!insidePoly(px, py, outline)) continue;
        const x = px - 12;
        const y = -(py - 12);
        target.push(x, y, bulge(x, y));
        kind.push(1);
      }
    }
    // Check del logo: "m9 12 2 2 4-4", nodos brillantes por delante
    const check = [new THREE.Vector2(-3, 0), new THREE.Vector2(-1, -2), new THREE.Vector2(3, 2)];
    for (let sgm = 0; sgm < 2; sgm++) {
      const n = sgm === 0 ? 8 : 15;
      for (let k = 0; k <= n; k++) {
        const v2 = check[sgm].clone().lerp(check[sgm + 1], k / n);
        target.push(v2.x, v2.y, 2.4);
        kind.push(2);
      }
    }

    const count = kind.length;
    const tgt = new Float32Array(target);
    const scatter = new Float32Array(count * 3);
    const dir = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      randDir(dir).multiplyScalar(14 + rand() * 18);
      scatter.set([dir.x, dir.y, dir.z], i * 3);
    }
    const infected = Array.from({ length: count }, (_, i) => kind[i] === 1 && rand() < 0.14);
    const phase = Float32Array.from({ length: count }, () => rand() * Math.PI * 2);

    // Enlaces entre vecinos cercanos (red), el check se une solo consigo mismo
    const links: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if ((kind[i] === 2) !== (kind[j] === 2)) continue;
        const dx = tgt[i * 3] - tgt[j * 3];
        const dy = tgt[i * 3 + 1] - tgt[j * 3 + 1];
        const dz = tgt[i * 3 + 2] - tgt[j * 3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        const max = kind[i] === 2 ? 0.6 : kind[i] === 0 && kind[j] === 0 ? 0.75 : 1.15;
        if (d2 < max * max) links.push(i, j);
      }
    }

    return {
      count,
      tgt,
      scatter,
      kind,
      infected,
      phase,
      links: Uint32Array.from(links),
      pos: new Float32Array(count * 3),
      col: new Float32Array(count * 3),
      linkPos: new Float32Array((links.length / 2) * 6),
      linkCol: new Float32Array((links.length / 2) * 6),
    };
  }, []);

  /* Anillo de partículas en órbita (el perímetro) */
  const RING = 220;
  const ring = useMemo(() => {
    const pos = new Float32Array(RING * 3);
    const ang = Float32Array.from({ length: RING }, () => rand() * Math.PI * 2);
    const rad = Float32Array.from({ length: RING }, () => 15 + rand() * 2.5);
    return { pos, ang, rad };
  }, []);

  const c = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const w = world.current;
    if (w.eased < 4.3 || w.eased > 6) return;
    const t = w.time;
    // Ensamblaje: los nodos dispersos convergen en el escudo al llegar la respuesta
    const k = smooth(clamp01((w.eased - 4.35) * 1.5));
    const clean = clamp01((w.eased - 4.8) * 2.2);
    const sweepY = 13 - ((t * 0.45) % 1) * 26; // barrido de escaneo de arriba abajo

    const { count, tgt, scatter, pos, col, kind, infected, phase } = net;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const wob = (1 - k) * 0.6 + 0.05;
      pos[i3] = THREE.MathUtils.lerp(scatter[i3], tgt[i3], k) + Math.sin(t * 1.3 + phase[i]) * wob;
      pos[i3 + 1] = THREE.MathUtils.lerp(scatter[i3 + 1], tgt[i3 + 1], k) + Math.cos(t * 1.1 + phase[i]) * wob;
      pos[i3 + 2] = THREE.MathUtils.lerp(scatter[i3 + 2], tgt[i3 + 2], k);

      const near = Math.max(0, 1 - Math.abs(tgt[i3 + 1] - sweepY) / 1.4);
      if (kind[i] === 2) {
        c.copy(ICE).multiplyScalar(0.2 + clean * 1.1);
      } else if (infected[i]) {
        const blink = 0.6 + 0.4 * Math.sin(t * 6 + phase[i]);
        c.copy(THREAT).multiplyScalar(blink).lerp(ICE, clean);
      } else {
        c.copy(ICE).multiplyScalar(kind[i] === 0 ? 0.9 : 0.45 + 0.15 * Math.sin(t * 2 + phase[i]));
      }
      c.lerp(ICE, near * 0.8 * k);
      col.set([c.r, c.g, c.b], i3);
    }

    const { links, linkPos, linkCol } = net;
    for (let e = 0; e < links.length; e += 2) {
      const a = links[e] * 3;
      const b = links[e + 1] * 3;
      const o6 = e * 3;
      linkPos[o6] = pos[a];
      linkPos[o6 + 1] = pos[a + 1];
      linkPos[o6 + 2] = pos[a + 2];
      linkPos[o6 + 3] = pos[b];
      linkPos[o6 + 4] = pos[b + 1];
      linkPos[o6 + 5] = pos[b + 2];
      linkCol[o6] = col[a];
      linkCol[o6 + 1] = col[a + 1];
      linkCol[o6 + 2] = col[a + 2];
      linkCol[o6 + 3] = col[b];
      linkCol[o6 + 4] = col[b + 1];
      linkCol[o6 + 5] = col[b + 2];
    }
    if (nodeGeo.current) {
      nodeGeo.current.attributes.position.needsUpdate = true;
      nodeGeo.current.attributes.color.needsUpdate = true;
    }
    if (linkGeo.current) {
      linkGeo.current.attributes.position.needsUpdate = true;
      linkGeo.current.attributes.color.needsUpdate = true;
    }
    if (linkMat.current) linkMat.current.opacity = 0.08 + 0.42 * k;

    for (let i = 0; i < RING; i++) {
      const a = ring.ang[i] + t * 0.12 * (i % 2 ? 1 : -0.6);
      const r = ring.rad[i] * (1.6 - 0.6 * k);
      ring.pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.92, Math.sin(a * 3 + i) * 0.8], i * 3);
    }
    if (ringGeo.current) ringGeo.current.attributes.position.needsUpdate = true;

    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.45 * (0.4 + 0.6 * k);
      group.current.rotation.x = Math.sin(t * 0.25) * 0.1;
    }
  });

  return (
    <group ref={group} position={o(0, 0, -80)} scale={0.24}>
      <lineSegments>
        <bufferGeometry ref={linkGeo}>
          <bufferAttribute attach="attributes-position" args={[net.linkPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[net.linkCol, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={linkMat} vertexColors transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points>
        <bufferGeometry ref={nodeGeo}>
          <bufferAttribute attach="attributes-position" args={[net.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[net.col, 3]} />
        </bufferGeometry>
        <pointsMaterial vertexColors size={0.42} sizeAttenuation transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry ref={ringGeo}>
          <bufferAttribute attach="attributes-position" args={[ring.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={DIM} size={0.3} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
      </points>
    </group>
  );
}

/* Estrellas alrededor de la Tierra y polvo dentro del servidor */
function Dust({ count, center, spread }: { count: number; center: THREE.Vector3; spread: [number, number, number] }) {
  const pos = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p.set(
        [
          center.x + (rand() - 0.5) * spread[0],
          center.y + (rand() - 0.5) * spread[1],
          center.z + (rand() - 0.5) * spread[2],
        ],
        i * 3
      );
    }
    return p;
  }, [count, center, spread]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color={DIM} size={0.07} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

const STARS_C = v(0, 0, -10);
const STARS_S: [number, number, number] = [160, 110, 120];
const INNER_C = o(0, 0, -40);
const INNER_S: [number, number, number] = [70, 50, 140];

export default function CyberWorldScene({ world, overlays, lite }: { world: WRef; overlays: Overlays; lite: boolean }) {
  return (
    <Canvas
      dpr={[1, lite ? 1.25 : 1.75]}
      camera={{ fov: 50, near: 0.05, far: 400, position: [0, 2.5, 21] }}
      gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => gl.setClearColor(BG)}
    >
      <fog attach="fog" args={[BG, 28, 80]} />
      <Director world={world} overlays={overlays} />
      <Dust count={lite ? 700 : 1600} center={STARS_C} spread={STARS_S} />
      <Earth world={world} dots={lite ? 26000 : 52000} />
      <Dust count={lite ? 500 : 1200} center={INNER_C} spread={INNER_S} />
      <ServerRacks world={world} />
      <Backdoor world={world} steps={lite ? 160 : 260} />
      <NodeShield world={world} />
    </Canvas>
  );
}
