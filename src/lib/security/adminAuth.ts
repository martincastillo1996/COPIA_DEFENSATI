import crypto from 'crypto';
import { findUserByToken } from '@/lib/audit/users.mjs';

export type Role = 'admin' | 'analyst' | 'viewer';
export interface Principal {
  role: Role;
  /** Quién es: el nombre de la persona, o "token-admin" para el token compartido heredado. */
  actor: string;
}

const RANK: Record<Role, number> = { viewer: 1, analyst: 2, admin: 3 };

function provided(req: Request): string {
  const auth = req.headers.get('authorization') || '';
  return (auth.startsWith('Bearer ') ? auth.slice(7) : req.headers.get('x-admin-token') || '').trim();
}

/**
 * Identifica quién llama (cabecera Authorization: Bearer o x-admin-token):
 *  - ADMIN_TOKEN (mínimo 16 caracteres, tiempo constante): rol admin, el del monitor y los scripts.
 *  - Clave personal "dti_..." creada con `audit:cli user add`: rol analyst o viewer.
 */
export function authenticate(req: Request): Principal | null {
  const token = provided(req);
  if (!token) return null;

  const expected = (process.env.ADMIN_TOKEN || '').trim();
  if (expected.length >= 16) {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return { role: 'admin', actor: 'token-admin' };
  }
  if (token.startsWith('dti_')) {
    try {
      const user = findUserByToken(token);
      if (user) return { role: user.role as Role, actor: user.name };
    } catch {
      // Node sin SQLite integrado: solo funciona el token de administración
    }
  }
  return null;
}

export const allows = (principal: Principal, min: Role): boolean => RANK[principal.role] >= RANK[min];

/** Devuelve quien llama solo si su rol alcanza el mínimo. */
export function hasRole(req: Request, min: Role): Principal | null {
  const p = authenticate(req);
  return p && allows(p, min) ? p : null;
}

/** Quien puede operar auditorías (admin o analista). Los lectores no. */
export function isAdminRequest(req: Request): boolean {
  return Boolean(hasRole(req, 'analyst'));
}
