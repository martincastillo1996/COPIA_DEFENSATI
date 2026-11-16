/**
 * AUDITORÍA COMPLETA (modo de pago) — solo para dominios de clientes con autorización escrita.
 *
 * El escáner público hace únicamente revisión básica (cabeceras, TLS, DNS y portada).
 * El sondeo activo de puertos y de archivos sensibles solo corre en modo "full", que exige
 * el token de administración. Este script lo lanza contra la app en ejecución.
 *
 * Uso:  npm run scan:full -- cliente.com
 * Requiere ADMIN_TOKEN (variable de entorno o .env.local / .env).
 */
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Archivo ausente: se usan las variables ya presentes en el entorno
  }
}

const domain = process.argv[2];
const token = (process.env.ADMIN_TOKEN || '').trim();
const base = (process.env.MONITOR_APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const publicBase = (process.env.NEXT_PUBLIC_APP_URL || 'https://neuronalgravity.com').replace(/\/+$/, '');

if (!domain) {
  console.error('Uso: npm run scan:full -- cliente.com');
  process.exit(1);
}
if (token.length < 16) {
  console.error('Falta ADMIN_TOKEN (mínimo 16 caracteres) en el entorno o en .env.local');
  process.exit(1);
}

try {
  const res = await fetch(base + '/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DefensaTI-FullScan/1.0 (auditoría completa autorizada)',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ url: domain, mode: 'full', force: true, legalConsentAccepted: true }),
    signal: AbortSignal.timeout(150_000),
  });
  const data = await res.json();
  if (!res.ok || !data?.report) throw new Error(data?.error || 'HTTP ' + res.status);

  const { score, grade, ports = [], sensitiveFiles } = data.report;
  const open = ports.filter((p) => p.isOpen).map((p) => p.port + (p.banner ? ' (' + p.banner + ')' : ''));
  console.log('\n  Auditoría completa de ' + domain);
  console.log('  Calificación: ' + score + '/100 (Grado ' + grade + ')');
  console.log('  Puertos abiertos: ' + (open.length ? open.join(', ') : 'ninguno de la matriz'));
  console.log('  Archivos sensibles expuestos: ' + (sensitiveFiles?.findings?.length ? sensitiveFiles.findings.map((f) => f.path).join(', ') : 'ninguno'));
  console.log('  Informe: ' + publicBase + '/report/' + data.id + '\n');
} catch (err) {
  console.error('Auditoría completa fallida: ' + (err?.message || err));
  process.exit(1);
}
