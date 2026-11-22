#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

for (const file of ['.env.local', '.env']) {
  try { process.loadEnvFile(file); } catch {}
}

const HELP = `Uso: npm run audit:cli -- <comando>
  new --domain D --client C --signer S --pdf F --from AAAA-MM-DD --to AAAA-MM-DD
      [--host H]... [--ports 1-1024,8080] [--rps 5] [--active]
      --active: el PDF autoriza expresamente pruebas activas (ZAP puede crear o alterar datos: usar staging)
      --staging: el entorno es de pruebas, sin datos reales (habilita ZAP con sesión)
      --internal: el PDF autoriza revisar código, dependencias y servidor
  verify <id>                      comprueba el TXT o el archivo de verificación
  list                             autorizaciones
  run <host>                       encola una auditoría completa
  auth <host> [--url /privada]...  con sesión: AUDIT_SESSION_A y, para IDOR, AUDIT_SESSION_B ("Cookie: ...")
  jobs | job <id>                  estado y progreso
  stop <id> | resume <id>          detiene o reanuda una autorización
  estop | estop-clear              parada de emergencia global
  findings <id> [--json]           hallazgos de una autorización
  status <hallazgo> <open|mitigated|accepted|false_positive> [--note texto]   falso positivo: baja la precisión del motor que lo generó
  retest <host>                    repite solo los motores de lo abierto (minutos, no horas)
  watch [host]                     foto de DNS, certificado, puertos y cabeceras, y qué cambió desde la anterior (programar a diario)
  portal <id> [--days 30] [--revoke]   enlace de solo lectura para el cliente, con botón de re-test
  bench <id> --truth laboratorio.json [--verify-lab] [--format json]   cuánto detecta tu escáner y cuántos falsos positivos da;
      --verify-lab comprueba contra el laboratorio (solo GET) que cada vulnerabilidad de la verdad de referencia existe
  validate <hallazgo> --note "quién lo comprobó y cómo"   un hallazgo probable pasa a confirmado
  report <id> [--format md|html|json|pdf|resumen|resumen-pdf] [--out archivo]   informe con ataque, rutas y plan de defensa (pdf necesita Chrome)
  ownership <dominio>              qué publicar (TXT o archivo) para demostrar la titularidad y que el escáner público sondee sus puertos
  share <id-informe> [--hours 72]  enlace firmado y con caducidad para abrir un informe de auditoría completa
  user add --name Ana --role analyst|viewer | user list | user revoke <id>   claves por persona para la API
  internal <id> [--repo carpeta] [--lynis lynis-report.dat] [--hibp]   revisión interna (exige --internal)
  auth ... --zap                   ZAP con la sesión A (solo staging con --active)
  log [--seen HASH] [--seen-consents HASH] [--notify]   verifica las cadenas; --notify envía los head fuera del servidor y --seen detecta recortes`;

function session(name) {
  const value = process.env[name];
  if (!value) return undefined;
  const m = value.match(/^(Cookie|Authorization):\s*([^\r\n]+)$/i);
  if (!m) throw new Error(`${name} debe ser "Cookie: ..." o "Authorization: ..."`);
  return { [m[1]]: m[2] };
}

try {
  const { values: o, positionals: [command, a, b] } = parseArgs({ allowPositionals: true, options: {
    domain: { type: 'string' }, client: { type: 'string' }, signer: { type: 'string' }, pdf: { type: 'string' },
    from: { type: 'string' }, to: { type: 'string' }, host: { type: 'string', multiple: true }, ports: { type: 'string' },
    rps: { type: 'string' }, active: { type: 'boolean' }, seen: { type: 'string' }, 'seen-consents': { type: 'string' }, notify: { type: 'boolean' },
    truth: { type: 'string' }, days: { type: 'string' }, revoke: { type: 'boolean' }, hours: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' }, staging: { type: 'boolean' }, internal: { type: 'boolean' }, zap: { type: 'boolean' }, hibp: { type: 'boolean' },
    repo: { type: 'string' }, lynis: { type: 'string' }, format: { type: 'string' }, out: { type: 'string' }, url: { type: 'string', multiple: true },
    note: { type: 'string' }, json: { type: 'boolean' }, 'verify-lab': { type: 'boolean' },
  } });
  const s = await import('../src/lib/audit/store.mjs');
  const day = (t) => new Date(t - 5 * 3600000).toISOString().slice(0, 10);

  switch (command) {
    case 'new': {
      if (!o.pdf || !o.domain) throw new Error(HELP);
      const e = s.createEngagement({ ...o, hosts: o.host });
      console.log(`Autorización ${e.id}. Pide al cliente UNA de estas pruebas:
  TXT      _defensati-verify.${e.domain} = defensati-verify=${e.token}
  Archivo  https://${e.domain}/.well-known/defensati-verify.txt con: defensati-verify=${e.token}
Luego: npm run audit:cli -- verify ${e.id}`);
      break;
    }
    case 'verify': {
      const { verifyEngagement } = await import('../src/lib/audit/authorization.mjs');
      console.log(`Verificado por ${await verifyEngagement(a)}.`);
      break;
    }
    case 'list':
      console.table(s.db().prepare('SELECT * FROM engagements ORDER BY created DESC').all().map((e) => ({
        id: e.id, dominio: e.domain, cliente: e.client, desde: day(e.starts), hasta: day(e.ends),
        verificado: !!e.verified, activo: !!e.active, detenido: !!e.stopped,
      })));
      break;
    case 'run': {
      const { authorizeFull } = await import('../src/lib/audit/authorization.mjs');
      const host = s.cleanHost(a);
      const e = await authorizeFull(host);
      console.log(`En cola: ${s.enqueue(e.id, host)}`);
      break;
    }
    case 'auth': {
      const sessionA = session('AUDIT_SESSION_A');
      const sessionB = session('AUDIT_SESSION_B');
      if (!sessionA) throw new Error('Falta AUDIT_SESSION_A.');
      if (o.url?.length && !sessionB) throw new Error('La prueba IDOR necesita AUDIT_SESSION_B.');
      const { authorizeFull } = await import('../src/lib/audit/authorization.mjs');
      const { executeJob } = await import('./audit/run.mjs');
      const host = s.cleanHost(a);
      const e = await authorizeFull(host);
      const result = await executeJob(s.enqueue(e.id, host, 'running'), { sessionA, sessionB, urls: o.url, zap: o.zap });
      console.log(result);
      if (result.status === 'failed') process.exitCode = 1;
      break;
    }
    case 'jobs':
      console.table(s.db().prepare('SELECT id,host,status,progress,step FROM jobs ORDER BY created DESC LIMIT 30').all());
      break;
    case 'job':
      console.log(s.getJob(a) ?? 'No existe.');
      break;
    case 'stop':
    case 'resume':
      s.getEngagement(a);
      s.db().prepare('UPDATE engagements SET stopped=? WHERE id=?').run(command === 'stop' ? 1 : 0, a);
      s.logEvent(`engagement.${command}`, { id: a });
      break;
    case 'estop':
    case 'estop-clear':
      s.setEmergencyStop(command === 'estop');
      break;
    case 'findings': {
      s.getEngagement(a);
      const rows = s.db().prepare('SELECT * FROM findings WHERE engagement=?').all(a);
      if (o.json) console.log(JSON.stringify(rows, null, 2));
      else console.table(rows.map((f) => ({ id: f.id, host: f.host, motor: f.engine, severidad: f.severity, estado: f.status, hallazgo: f.title })));
      break;
    }
    case 'status': {
      const { setStatus } = await import('./audit/findings.mjs');
      setStatus(a, b, o.note);
      break;
    }
    case 'validate': {
      const { validate } = await import('./audit/findings.mjs');
      validate(a, o.note);
      break;
    }
    case 'report': {
      const x = await import('../src/lib/audit/expert.mjs');
      const report = x.buildReport(a);
      if (o.format === 'pdf' || o.format === 'resumen-pdf') {
        if (!o.out) throw new Error(`--format ${o.format} necesita --out archivo.pdf`);
        const { renderPdf } = await import('./audit/pdf.mjs');
        await renderPdf(o.format === 'pdf' ? x.toHtml(report) : x.toSummaryHtml(report), o.out, o.format === 'pdf' ? {} : { footer: false });
        console.log(`PDF escrito en ${o.out}`);
        break;
      }
      const text = o.format === 'json' ? JSON.stringify(report, null, 2) : o.format === 'html' ? x.toHtml(report) : o.format === 'resumen' ? x.toSummaryHtml(report) : x.toMarkdown(report);
      if (o.out) {
        fs.writeFileSync(o.out, text, { mode: 0o600 });
        console.log(`Informe escrito en ${o.out}`);
      } else console.log(text);
      break;
    }
    case 'internal': {
      const { runInternal } = await import('./audit/internal.mjs');
      console.table(await runInternal(s.getEngagement(a), { repo: o.repo, lynis: o.lynis, hibp: o.hibp }));
      break;
    }
    case 'retest': {
      const { authorizeFull } = await import('../src/lib/audit/authorization.mjs');
      const { planRetest } = await import('../src/lib/audit/retest.mjs');
      const host = s.cleanHost(a);
      const e = await authorizeFull(host);
      const plan = planRetest(e.id, host);
      console.log(`Re-test de ${plan.open} hallazgo(s): ${plan.engines.join(', ')}${plan.ports ? ` · puertos ${plan.ports}` : ''}${plan.manual.length ? ` · manual: ${plan.manual.join(', ')}` : ''}`);
      console.log(`En cola: ${s.enqueue(e.id, host, 'queued', { only: plan.engines, ports: plan.ports })}`);
      break;
    }
    case 'watch': {
      const { authorizeFull } = await import('../src/lib/audit/authorization.mjs');
      const { watchHost } = await import('./audit/watch.mjs');
      const { notify } = await import('./audit/notify.mjs');
      const now = Date.now();
      const hosts = a ? [s.cleanHost(a)] : [...new Set(s.db().prepare('SELECT hosts FROM engagements WHERE verified IS NOT NULL AND stopped=0 AND starts<=? AND ends>=?').all(now, now).flatMap((r) => JSON.parse(r.hosts)))];
      const rows = [];
      for (const host of hosts) {
        try {
          const r = await watchHost(await authorizeFull(host), host);
          rows.push({ host, estado: r.first ? 'primera foto' : r.events.length ? `${r.events.length} cambio(s)` : 'sin cambios' });
          for (const x of r.events) console.log(`[${x.severity}] ${host}: ${x.title} · ${x.detail}`);
          const urgent = r.events.filter((x) => x.severity !== 'BAJO');
          if (urgent.length) await notify(`👁 Cambios en ${host}\n${urgent.slice(0, 8).map((x) => `• [${x.severity}] ${x.title}: ${x.detail}`).join('\n')}`);
        } catch (err) {
          rows.push({ host, estado: `error: ${err.message}` });
          process.exitCode = 1;
        }
      }
      console.table(rows);
      break;
    }
    case 'portal': {
      const portal = await import('../src/lib/audit/portal.mjs');
      if (o.revoke) {
        portal.revokePortal(a);
        console.log('Enlace revocado.');
        break;
      }
      const { token, until } = portal.createPortalToken(a, Number(o.days ?? 30));
      const base = (process.env.PUBLIC_APP_URL || 'https://neuronalgravity.com').replace(/\/+$/, '');
      console.log(`Enlace del cliente (vence ${day(until)}; se muestra una sola vez):\n${base}/portal/${token}`);
      break;
    }
    case 'bench': {
      if (!o.truth) throw new Error('Falta --truth archivo.json');
      const { scoreBench, benchMarkdown, verifyTruth, validateTruth } = await import('./audit/bench.mjs');
      const e = s.getEngagement(a);
      const findings = s.db().prepare("SELECT * FROM findings WHERE engagement=? AND status!='false_positive'").all(a);
      const jobs = s.db().prepare('SELECT created, finished FROM jobs WHERE engagement=?').all(a);
      let truth = validateTruth(JSON.parse(fs.readFileSync(o.truth, 'utf8')));
      let verified = { dropped: [], unverifiable: [] };
      if (o['verify-lab']) {
        // Solo contra el dominio autorizado de esta autorización, con su IP validada como pública
        s.assertAllowed(a, e.domain);
        const { resolvePublic } = await import('../src/lib/audit/net.mjs');
        verified = await verifyTruth(truth, { origin: `https://${e.domain}`, ip: await resolvePublic(e.domain), check: () => s.assertAllowed(a, e.domain) });
        truth = verified.truth;
      }
      const r = { ...scoreBench(truth, findings, jobs), dropped: verified.dropped, unverifiable: verified.unverifiable };
      console.log(o.format === 'json' ? JSON.stringify(r, null, 2) : benchMarkdown(r));
      break;
    }
    case 'ownership': {
      const { ownershipRecord } = await import('../src/lib/audit/ownership.mjs');
      const host = s.cleanHost(a);
      const r = ownershipRecord(host);
      console.log(`Para demostrar la titularidad de ${host}, publica UNA de estas pruebas (sirve también en el dominio principal):\n  TXT      ${r.host} = ${r.value}\n  Archivo  ${r.file} con: ${r.value}`);
      break;
    }
    case 'share': {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(a || '')) throw new Error('Indica el id (UUID) del informe de una auditoría completa.');
      const { signShare } = await import('../src/lib/audit/share.mjs');
      const hours = Number(o.hours ?? 72);
      const token = signShare(a, hours);
      s.logEvent('share.create', { report: a, hours });
      const base = (process.env.PUBLIC_APP_URL || 'https://neuronalgravity.com').replace(/\/+$/, '');
      console.log(`${base}/report/${a}?t=${token}\nVence en ${hours} h.`);
      break;
    }
    case 'user': {
      const users = await import('../src/lib/audit/users.mjs');
      if (a === 'add') {
        const u = users.createUser(o.name, o.role);
        console.log(`Usuario ${u.id} (${u.name}, ${u.role}). Clave, se muestra una sola vez:\n${u.token}`);
      } else if (a === 'list') {
        console.table(users.listUsers().map((u) => ({ id: u.id, nombre: u.name, rol: u.role, activo: !u.revoked, creado: day(u.created), ultimo_uso: u.last_used ? day(u.last_used) : '-' })));
      } else if (a === 'revoke') {
        users.revokeUser(b);
        console.log('Clave revocada.');
      } else throw new Error('Uso: user add --name Ana --role analyst|viewer | user list | user revoke <id>');
      break;
    }
    case 'log': {
      const { verifyChained, containsHash } = await import('../src/lib/audit/chain.mjs');
      const saved = { 'audit-log.jsonl': o.seen, 'audit-consents.jsonl': o['seen-consents'] };
      const heads = [];
      for (const name of ['audit-log.jsonl', 'audit-consents.jsonl']) {
        const file = path.join(s.dataDir(), name);
        const r = verifyChained(file);
        console.log(name, r);
        heads.push(`${name}: ${r.count} registros, head ${r.head}`);
        if (!r.valid) process.exitCode = 1;
        if (saved[name] && !containsHash(file, saved[name])) {
          console.error(`${name}: no contiene el hash guardado ${saved[name]}: la cadena fue recortada o reemplazada.`);
          process.exitCode = 1;
        }
      }
      if (o.notify) {
        const { notify } = await import('./audit/notify.mjs');
        await notify(`🔗 Cadenas de auditoría. Guarda esto fuera del servidor:\n${heads.join('\n')}`);
      }
      break;
    }
    default:
      console.log(HELP);
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
