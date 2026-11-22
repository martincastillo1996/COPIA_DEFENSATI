#!/usr/bin/env node
// Chequeo previo y posterior al despliegue: npm run deploy:check [-- --json]
// Sale con código 1 si hay algún "fail". Los "warn" no bloquean, pero conviene leerlos.
import fs from 'node:fs';
import path from 'node:path';

for (const file of ['.env.local', '.env']) {
  try { process.loadEnvFile(file); } catch {}
}
const { dataDir } = await import('../src/lib/audit/store.mjs');
const { runChecks, probeTool, hasFailures } = await import('./deploy/checks.mjs');

const firstFound = (cands) => { for (const c of cands.filter(Boolean)) { const t = probeTool(c); if (t.found) return t; } return { found: false }; };

const tools = {
  nmap: probeTool(process.env.NMAP_PATH || 'nmap'),
  testssl: process.env.TESTSSL_PATH ? probeTool(process.env.TESTSSL_PATH) : (probeTool('testssl').found ? probeTool('testssl') : probeTool('testssl.sh')),
  nuclei: probeTool(process.env.NUCLEI_PATH || 'nuclei', ['-version']),
  docker: probeTool(process.env.DOCKER_PATH || 'docker'),
  chrome: firstFound([process.env.CHROME_PATH, 'google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser',
    ...(process.platform === 'win32' ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'] : [])]),
};
let freeBytes;
try {
  fs.mkdirSync(dataDir(), { recursive: true });
  const s = fs.statfsSync(dataDir());
  freeBytes = s.bavail * s.bsize;
} catch { /* sin dato de disco */ }

const results = runChecks({ dataDir: dataDir(), backupDir: process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'), freeBytes, tools });

if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2));
else {
  const mark = { ok: 'OK   ', warn: 'AVISO', fail: 'FALLO' };
  for (const r of results) console.log(`${mark[r.level]}  ${r.title}${r.detail ? `\n         ${r.detail}` : ''}`);
  const count = (l) => results.filter((r) => r.level === l).length;
  console.log(`\n${count('ok')} correctos, ${count('warn')} avisos, ${count('fail')} fallos.`);
  if (hasFailures(results)) console.log('NO despliegues hasta resolver los fallos.');
}
process.exitCode = hasFailures(results) ? 1 : 0;
