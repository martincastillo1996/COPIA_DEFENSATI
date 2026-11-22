#!/usr/bin/env node
// Copias de seguridad cifradas de data/. Ver docs/despliegue.md.
//   node scripts/backup.mjs create [--out dir] [--keep 14] [--no-reports] [--with-env] [--notify]
//   node scripts/backup.mjs verify <archivo>
//   node scripts/backup.mjs restore <archivo> --to <carpeta nueva> [--force]
// La clave va en BACKUP_PASSPHRASE (mínimo 12 caracteres). Sin clave no se crea ninguna copia.
import path from 'node:path';
import { parseArgs } from 'node:util';

for (const file of ['.env.local', '.env']) {
  try { process.loadEnvFile(file); } catch {}
}

const HELP = `Uso: node scripts/backup.mjs <comando>
  create [--out dir] [--keep N] [--no-reports] [--with-env] [--no-encrypt] [--notify]
  verify <archivo>                  restaura en una carpeta temporal y lo comprueba todo
  restore <archivo> --to <carpeta>  restaura en una carpeta nueva (nunca pisa datos vivos) [--force]
BACKUP_PASSPHRASE: clave de cifrado (mínimo 12 caracteres). BACKUP_DIR y BACKUP_KEEP fijan los valores por defecto.`;

const { values: o, positionals: [command, file] } = parseArgs({ allowPositionals: true, options: {
  out: { type: 'string' }, keep: { type: 'string' }, to: { type: 'string' }, force: { type: 'boolean' },
  'no-reports': { type: 'boolean' }, 'with-env': { type: 'boolean' }, 'no-encrypt': { type: 'boolean' }, notify: { type: 'boolean' },
} });

const { dataDir } = await import('../src/lib/audit/store.mjs');
const lib = await import('./backup/lib.mjs');
const pass = process.env.BACKUP_PASSPHRASE;
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

async function tell(text) {
  if (!o.notify) return;
  try { await (await import('./audit/notify.mjs')).notify(text); } catch { /* el aviso es un extra */ }
}

try {
  switch (command) {
    case 'create': {
      const r = await lib.createBackup({
        dataDir: dataDir(), outDir: o.out || process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'),
        passphrase: pass, keep: Number(o.keep ?? process.env.BACKUP_KEEP ?? 14), reports: !o['no-reports'],
        envFile: o['with-env'] ? path.join(process.cwd(), '.env.local') : undefined, encrypt: !o['no-encrypt'],
      });
      const heads = Object.entries(r.manifest.chains).map(([k, v]) => `${k}: ${v.count} registros, head ${v.head}`);
      console.log(`Copia: ${r.file}\nTamaño: ${mb(r.size)}\nSHA-256: ${r.sha256}\nBase: ${JSON.stringify(r.manifest.db?.counts ?? 'sin base')}`);
      for (const h of heads) console.log(h);
      for (const w of r.warnings) console.warn(`AVISO: ${w}`);
      if (r.pruned.length) console.log(`Borradas por retención: ${r.pruned.length}`);
      await tell(`💾 Copia de DEFENSA TI hecha: ${path.basename(r.file)} (${mb(r.size)})${r.warnings.length ? `\n⚠ ${r.warnings.join('\n⚠ ')}` : ''}\n${heads.join('\n')}`);
      break;
    }
    case 'verify': {
      if (!file) throw new Error(HELP);
      const r = await lib.verifyBackup(path.resolve(file), pass);
      if (!r.ok) throw new Error(`La copia NO pasa la verificación:\n- ${r.problems.join('\n- ')}`);
      console.log(`Copia verificada: ${r.manifest.files.length} archivos, hashes e integridad de la base correctos, cadenas válidas.`);
      break;
    }
    case 'restore': {
      if (!file || !o.to) throw new Error(HELP);
      const r = await lib.restoreBackup(path.resolve(file), pass, o.to, { force: o.force, liveDataDir: dataDir() });
      console.log(`Restaurado en ${r.to} (${r.files} archivos).\nPara usarlo: detén la app y el worker, mueve esa carpeta a data/ y arranca de nuevo.`);
      break;
    }
    default:
      console.log(HELP);
  }
} catch (e) {
  console.error(e.message);
  await tell(`🔴 La copia de DEFENSA TI FALLÓ (${command}): ${e.message.split('\n')[0]}`);
  process.exitCode = 1;
}
