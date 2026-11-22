/** Fases de un ciberataque real contra una web, de punta a punta. */
export const PHASES = [
  'Objetivo',
  'Reconocimiento',
  'Intrusión',
  'Explotación',
  'Persistencia',
  'Respuesta',
  'Detección',
  'Contención',
  'Recuperación',
] as const;

export const MAX_PHASE = PHASES.length - 1;

export interface WorldState {
  /** Fase objetivo (continua) según el scroll */
  phase: number;
  /** Fase suavizada que usa la escena */
  eased: number;
  time: number;
  dt: number;
  /** Multiplicador de velocidad (más lento con movimiento reducido) */
  speed: number;
  scan: 'idle' | 'scanning' | 'done';
  score: number | null;
}
