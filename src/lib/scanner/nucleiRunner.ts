/**
 * Integración opcional con Nuclei (ProjectDiscovery): miles de plantillas comunitarias de CVE,
 * exposiciones y configuraciones erróneas.
 *
 * - Solo se ejecuta en auditoría completa (modo "full", token de administración y autorización escrita).
 * - Requiere el binario instalado en el servidor: NUCLEI_PATH o `nuclei` en el PATH.
 * - Perfil no destructivo: se excluyen plantillas de DoS, fuzzing, fuerza bruta e intrusivas,
 *   con límite de peticiones por segundo y tiempo total acotado.
 * - Se invoca con execFile (sin shell) y argumentos fijos: la URL ya fue validada contra SSRF.
 */

import { execFile } from 'child_process';
import { createHash } from 'crypto';
import type { ScanFinding, FindingSeverity } from '@/lib/scanner/findingTypes';

export interface NucleiResult {
  available: boolean;
  ran: boolean;
  /** false si se cortó por tiempo, parada, error o tope de resultados. */
  complete: boolean;
  durationMs: number;
  templatesMatched: number;
  findings: ScanFinding[];
  error?: string;
}

const SEV: Record<string, FindingSeverity> = { critical: 'CRÍTICO', high: 'ALTO', medium: 'MEDIO', low: 'BAJO', info: 'BAJO' };

interface NucleiLine {
  'template-id'?: string;
  info?: {
    name?: string;
    severity?: string;
    description?: string;
    remediation?: string;
    classification?: { 'cve-id'?: string[] | null; 'cwe-id'?: string[] | null; 'cvss-score'?: number };
  };
  'matched-at'?: string;
  'extracted-results'?: string[];
}

function run(bin: string, args: string[], timeoutMs: number, check?: () => void): Promise<{ stdout: string; error?: string }> {
  return new Promise((resolve) => {
    // Las plantillas son de terceros: el proceso no hereda los secretos de la app
    const env = { NODE_ENV: process.env.NODE_ENV } as NodeJS.ProcessEnv;
    for (const key of ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'TEMP', 'TMP']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    const child = execFile(bin, args, { env, timeout: timeoutMs, killSignal: 'SIGKILL', maxBuffer: 8 * 1024 * 1024, windowsHide: true }, (err, stdout) => {
      clearInterval(watch);
      // Nuclei puede terminar por tiempo con resultados parciales válidos en stdout
      resolve({ stdout: String(stdout || ''), error: err ? err.message : undefined });
    });
    const watch = setInterval(() => {
      try {
        check?.();
      } catch {
        child.kill('SIGKILL');
      }
    }, 1000);
  });
}

export async function runNuclei(
  targetUrl: string,
  { timeoutMs = 90_000, rps = 5, check }: { timeoutMs?: number; rps?: number; check?: () => void } = {}
): Promise<NucleiResult> {
  const bin = process.env.NUCLEI_PATH?.trim() || 'nuclei';
  const t0 = Date.now();

  const probe = await run(bin, ['-version'], 5000);
  if (probe.error && /ENOENT|not found|no se reconoce/i.test(probe.error)) {
    return { available: false, ran: false, complete: false, durationMs: 0, templatesMatched: 0, findings: [] };
  }

  const args = [
    '-u', targetUrl,
    '-jsonl', '-silent', '-nc',
    '-severity', 'low,medium,high,critical',
    '-tags', 'cve,exposure,misconfig,takeover,default-login-page,panel,tech,kev',
    '-exclude-tags', 'dos,fuzz,intrusive,bruteforce,brute-force,default-login,sqli,rce-blind',
    '-rate-limit', String(rps),
    // Sin salir del objetivo ni tocar la red interna del servidor
    '-disable-redirects',
    '-restrict-local-network-access',
    '-concurrency', '5',
    '-timeout', '5',
    '-retries', '0',
    '-disable-update-check',
    '-no-interactsh',
  ];
  const out = await run(bin, args, timeoutMs, check);

  const findings: ScanFinding[] = [];
  const seen = new Set<string>();
  for (const line of out.stdout.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('{')) continue;
    let j: NucleiLine;
    try {
      j = JSON.parse(t);
    } catch {
      continue;
    }
    const id = j['template-id'] || 'nuclei';
    const key = `${id}|${j['matched-at'] || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cves = (j.info?.classification?.['cve-id'] || []).filter(Boolean).map((c) => c.toUpperCase());
    findings.push({
      id: `nuclei-${id}-${createHash('sha256').update(key).digest('hex').slice(0, 10)}`,
      cwe: j.info?.classification?.['cwe-id']?.[0]?.toUpperCase(),
      cvss: j.info?.classification?.['cvss-score'],
      category: cves.length ? 'webapp' : 'api',
      title: `${j.info?.name || id}${cves.length ? ` (${cves.slice(0, 2).join(', ')})` : ''}`,
      severity: SEV[(j.info?.severity || 'info').toLowerCase()] || 'BAJO',
      // Una plantilla coincide, pero no prueba que sea explotable: se valida a mano (audit validate)
      confidence: 'probable',
      attackVector: (j.info?.description || 'Plantilla de Nuclei que coincide con una vulnerabilidad o exposición conocida.').trim().slice(0, 600),
      mitigation: (j.info?.remediation || 'Actualizar el componente afectado o restringir el acceso al recurso expuesto, siguiendo la referencia del CVE o del fabricante.').trim().slice(0, 600),
      evidence: `Plantilla ${id} → ${(j['matched-at'] || targetUrl).split('?')[0].slice(0, 140)}`,
    });
    if (findings.length >= 60) break;
  }

  return {
    available: true,
    ran: !out.error || findings.length > 0,
    complete: !out.error && findings.length < 60,
    durationMs: Date.now() - t0,
    templatesMatched: findings.length,
    findings,
    error: out.error,
  };
}
