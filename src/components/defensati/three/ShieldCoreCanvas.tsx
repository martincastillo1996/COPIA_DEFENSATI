'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Núcleo de defensa 3D: un cristal (tu web) rodeado de una malla-escudo.
 * Las partículas rojas son ataques que llegan desde fuera; al tocar el escudo
 * se desvían y se vuelven cian. Reacciona al cursor, al scroll y al escaneo
 * real (evento `defensati:scan`).
 */

export type ScanSignal = { state: 'idle' | 'scanning' | 'done'; score?: number };

const THREATS = 700;
const SHIELD_R = 1.85;
const RED = new THREE.Color('#ff453a');
const CYAN = new THREE.Color('#00e5ff');
const OCTA = new THREE.OctahedronGeometry(1.05, 0);

function scoreColor(score?: number) {
  if (score == null) return new THREE.Color('#ff453a');
  if (score >= 80) return new THREE.Color('#30d158');
  if (score >= 55) return new THREE.Color('#ffd60a');
  return new THREE.Color('#ff453a');
}

type ThreatBuffers = { positions: Float32Array; colors: Float32Array; velocity: Float32Array; life: Float32Array };

function makeThreatBuffers(): ThreatBuffers {
  const positions = new Float32Array(THREATS * 3);
  const colors = new Float32Array(THREATS * 3);
  const velocity = new Float32Array(THREATS);
  const life = new Float32Array(THREATS);
  const v = new THREE.Vector3();
  for (let i = 0; i < THREATS; i++) {
    v.randomDirection().multiplyScalar(3 + Math.random() * 6).toArray(positions, i * 3);
    RED.toArray(colors, i * 3);
    velocity[i] = 0.4 + Math.random() * 0.9;
  }
  return { positions, colors, velocity, life };
}

function makeDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function Threats({ signal }: { signal: React.RefObject<ScanSignal> }) {
  const geo = useRef<THREE.BufferGeometry>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const buf = useRef<ThreatBuffers | null>(null);
  const tmp = useRef(new THREE.Vector3());
  const tmpC = useRef(new THREE.Color());

  // Buffers mutables fuera del render (se animan en useFrame)
  useEffect(() => {
    const b = makeThreatBuffers();
    buf.current = b;
    geo.current?.setAttribute('position', new THREE.BufferAttribute(b.positions, 3));
    geo.current?.setAttribute('color', new THREE.BufferAttribute(b.colors, 3));
    const tex = makeDotTexture();
    if (mat.current) { mat.current.map = tex; mat.current.needsUpdate = true; }
    return () => tex.dispose();
  }, []);

  useFrame((_, dt) => {
    const b = buf.current;
    const g = geo.current;
    if (!b || !g) return;
    const { positions, colors, velocity, life } = b;
    const p = tmp.current;
    const d = Math.min(dt, 0.05);
    const boost = signal.current.state === 'scanning' ? 3.2 : 1;
    for (let i = 0; i < THREATS; i++) {
      p.fromArray(positions, i * 3);
      const r = p.length();
      if (life[i] > 0) {
        // Desviado: sale disparado hacia fuera en cian y se desvanece a rojo
        p.multiplyScalar(1 + d * 1.6 * boost);
        life[i] -= d * 0.7;
        tmpC.current.copy(CYAN).lerp(RED, 1 - Math.max(life[i], 0)).toArray(colors, i * 3);
        if (p.length() > 9.5) {
          p.randomDirection().multiplyScalar(7 + Math.random() * 2.5);
          life[i] = 0;
          RED.toArray(colors, i * 3);
        }
      } else {
        // Atacando: espiral hacia el núcleo
        p.applyAxisAngle(THREE.Object3D.DEFAULT_UP, d * 0.25 * boost);
        p.multiplyScalar(1 - (d * velocity[i] * 0.35 * boost) / Math.max(r, 0.5));
        if (p.length() < SHIELD_R) {
          p.setLength(SHIELD_R + 0.02);
          life[i] = 1;
        }
      }
      p.toArray(positions, i * 3);
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo} />
      <pointsMaterial ref={mat} alphaTest={0.01} size={0.11} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Core({ signal }: { signal: React.RefObject<ScanSignal> }) {
  const shell = useRef<THREE.Mesh>(null);
  const shellMat = useRef<THREE.MeshBasicMaterial>(null);
  const crystal = useRef<THREE.Group>(null);
  const heart = useRef<THREE.MeshStandardMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const target = useMemo(() => new THREE.Color('#ff453a'), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const s = signal.current;
    const scanning = s.state === 'scanning';
    if (shell.current) {
      shell.current.rotation.y += dt * (scanning ? 0.9 : 0.12);
      shell.current.rotation.x += dt * 0.05;
      const pulse = 1 + Math.sin(t * (scanning ? 9 : 2)) * (scanning ? 0.035 : 0.012);
      shell.current.scale.setScalar(pulse);
    }
    if (shellMat.current) shellMat.current.opacity = scanning ? 0.55 + Math.sin(t * 12) * 0.2 : 0.22;
    if (crystal.current) crystal.current.rotation.y -= dt * 0.25;
    if (ring.current) {
      ring.current.rotation.z += dt * (scanning ? 2.4 : 0.3);
      ring.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.6) * 0.25;
    }
    if (heart.current) {
      target.copy(s.state === 'done' ? scoreColor(s.score) : scanning ? CYAN : RED);
      heart.current.emissive.lerp(target, Math.min(dt * 3, 1));
      heart.current.emissiveIntensity = scanning ? 3 + Math.sin(t * 14) * 1.2 : 1.8 + Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      {/* Escudo: malla geodésica */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[SHIELD_R, 3]} />
        <meshBasicMaterial ref={shellMat} color="#00e5ff" wireframe transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Anillo de escaneo */}
      <mesh ref={ring}>
        <torusGeometry args={[SHIELD_R + 0.35, 0.008, 8, 160]} />
        <meshBasicMaterial color="#EDEDED" transparent opacity={0.6} />
      </mesh>
      {/* Cristal: tu web */}
      <group ref={crystal}>
        <mesh>
          <octahedronGeometry args={[1.05, 0]} />
          <meshStandardMaterial color="#0b1a22" metalness={0.6} roughness={0.15} flatShading transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[OCTA]} />
          <lineBasicMaterial color="#bfefff" transparent opacity={0.9} />
        </lineSegments>
      </group>
      {/* Corazón: color = estado de seguridad */}
      <mesh>
        <icosahedronGeometry args={[0.32, 2]} />
        <meshStandardMaterial ref={heart} color="#111" emissive="#ff453a" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </Float>
  );
}

function Rig({ children, offsetX }: { children: React.ReactNode; offsetX: number }) {
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);

  useEffect(() => {
    const onScroll = () => { scroll.current = Math.min(window.scrollY / window.innerHeight, 1.5); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame((state, dt) => {
    const { camera, pointer } = state;
    const k = Math.min(dt * 2.5, 1);
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.5 + scroll.current * 1.2, k);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.3, k);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, offsetX, k);
    }
    // Scroll: la cámara se adentra en el escudo
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7 - scroll.current * 3.2, k);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, scroll.current * 0.8, k);
    camera.lookAt(0, 0, 0);
  });

  return <group ref={group} scale={offsetX ? 0.82 : 0.7}>{children}</group>;
}

export default function ShieldCoreCanvas({ offsetX = 0 }: { offsetX?: number }) {
  const signal = useRef<ScanSignal>({ state: 'idle' });

  useEffect(() => {
    const on = (e: Event) => { signal.current = (e as CustomEvent<ScanSignal>).detail; };
    window.addEventListener('defensati:scan', on);
    return () => window.removeEventListener('defensati:scan', on);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 5]} intensity={60} color="#00e5ff" />
      <pointLight position={[-5, -3, 2]} intensity={40} color="#ff453a" />
      <Rig offsetX={offsetX}>
        <Core signal={signal} />
        <Threats signal={signal} />
      </Rig>
    </Canvas>
  );
}
