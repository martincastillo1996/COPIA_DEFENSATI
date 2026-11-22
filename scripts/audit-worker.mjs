#!/usr/bin/env node
// Cola de auditorías, una a la vez. PM2: pm2 start scripts/audit-worker.mjs --name defensati-audit
import { setTimeout as sleep } from 'node:timers/promises';

for (const file of ['.env.local', '.env']) {
  try { process.loadEnvFile(file); } catch {}
}
const { db, emergencyStopped, logEvent } = await import('../src/lib/audit/store.mjs');
const { executeJob } = await import('./audit/run.mjs');

if ((process.env.ADMIN_TOKEN || '').trim().length < 16) {
  console.error('Falta ADMIN_TOKEN (mínimo 16 caracteres).');
  process.exit(1);
}

// Trabajos que quedaron a medias por un reinicio
for (const job of db().prepare("SELECT id,pid FROM jobs WHERE status='running'").all()) {
  let alive = false;
  try {
    if (job.pid && job.pid !== process.pid) { process.kill(job.pid, 0); alive = true; }
  } catch {}
  if (alive) continue;
  db().prepare("UPDATE jobs SET status='failed', error='Interrumpido por reinicio', finished=? WHERE id=?").run(Date.now(), job.id);
  logEvent('job.interrupted', { id: job.id });
}

const once = process.argv.includes('--once');
for (;;) {
  try {
    const job = emergencyStopped() ? null : db().prepare(`UPDATE jobs SET status='running', pid=?
      WHERE id=(SELECT id FROM jobs WHERE status='queued' ORDER BY created LIMIT 1) AND status='queued' RETURNING id`).get(process.pid);
    if (job) {
      const result = await executeJob(job.id);
      console.log(`[audit] ${job.id}: ${result.status}`);
      continue;
    }
  } catch (e) {
    console.error('[audit]', e);
  }
  if (once) break;
  await sleep(5000);
}
