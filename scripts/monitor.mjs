#!/usr/bin/env node
/**
 * DEFENSA TI — Monitor de Mantenimiento Mensual
 *
 * Vigila los sitios de los clientes con plan de mantenimiento:
 *   - plan "basico": comprobación de uptime cada 15 minutos
 *   - plan "tienda": comprobación de uptime cada 5 minutos
 *   - certificado SSL: alerta cuando quedan 15 días o menos (una vez al día)
 *   - plan "tienda": re-escaneo semanal de seguridad con el motor de DEFENSA TI
 *     (llama a la app local; alerta si la calificación baja)
 *
 * Clientes:  data/monitor-clients.json
 *   [{ "domain": "cliente.pe", "plan": "basico", "name": "Cliente SAC" }]
 * Historial: data/monitor/<dominio>.jsonl   (una línea por comprobación)
 * Estado:    data/monitor/state.json
 *
 * Alertas: Telegram (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) y/o LEAD_WEBHOOK_URL.
 *
 * Uso:
 *   node scripts/monitor.mjs                  → servicio continuo (PM2)
 *   node scripts/monitor.mjs --once           → una sola pasada y termina
 *   node scripts/monitor.mjs --report 2026-11 → reporte mensual de uptime por cliente
 *
 * PM2:  pm2 start scripts/monitor.mjs --name defensati-monitor && pm2 save
 */
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'monitor-clients.json');
const MONITOR_DIR = path.join(DATA_DIR, 'monitor');
const STATE_FILE = path.join(MONITOR_DIR, 'state.json');

const INTERVAL_MIN = { basico: 15, tienda: 5 };
const REQUEST_TIMEOUT_MS = 20_000;
const FAILURES_BEFORE_ALERT = 2; // evita falsas alarmas por un único fallo de red
const SSL_ALERT_DAYS = 15;
const RESCAN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const RESCAN_RETRY_MS = 6 * 60 * 60 * 1000; // si el re-escaneo falla, se reintenta a las 6 horas
const DOMAIN_REGEX = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(ROOT, envFile));
  } catch {
    // Archivo ausente: se usan las variables ya presentes en el entorno
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function loadClients() {
  const raw = readJson(CLIENTS_FILE, []);
  if (!Array.isArray(raw)) return [];
  const clients = [];
  for (const item of raw) {
    const domain = String(item?.domain || '').trim().toLowerCase();
    if (!DOMAIN_REGEX.test(domain)) {
      console.warn(`[monitor] Dominio ignorado por formato inválido: ${JSON.stringify(item?.domain)}`);
      continue;
    }
    clients.push({
      domain,
      plan: item.plan === 'tienda' ? 'tienda' : 'basico',
      name: String(item.name || domain),
    });
  }
  return clients;
}

function loadState() {
  const state = readJson(STATE_FILE, {});
  return state && typeof state === 'object' && !Array.isArray(state) ? state : {};
}

function saveState(state) {
  fs.mkdirSync(MONITOR_DIR, { recursive: true });
  const tmp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

function appendLog(domain, entry) {
  fs.mkdirSync(MONITOR_DIR, { recursive: true });
  fs.appendFileSync(path.join(MONITOR_DIR, `${domain}.jsonl`), JSON.stringify(entry) + '\n');
}

async function checkUptime(domain) {
  const started = Date.now();
  try {
    const res = await fetch(`https://${domain}/`, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'User-Agent': 'DefensaTI-Monitor/1.0 (+https://neuronalgravity.com/defensati)' },
    });
    await res.body?.cancel();
    // 5xx = caída real del sitio. 401/403/429 indican que el servidor responde (WAF o login).
    return { up: res.status < 500, status: res.status, ms: Date.now() - started };
  } catch (err) {
    const reason = err?.cause?.code || err?.name || 'ERROR';
    return { up: false, status: 0, ms: Date.now() - started, error: String(reason) };
  }
}

function checkSslDays(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: domain, port: 443, servername: domain, timeout: 10_000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert?.valid_to) return resolve(null);
      resolve(Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000));
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => resolve(null));
  });
}

async function sendAlert(text) {
  console.log(`[alerta] ${text.replace(/\n/g, ' | ')}`);
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LEAD_WEBHOOK_URL } = process.env;
  const jobs = [];
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
        signal: AbortSignal.timeout(10_000),
      })
    );
  }
  if (LEAD_WEBHOOK_URL) {
    jobs.push(
      fetch(LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, content: text }),
        signal: AbortSignal.timeout(10_000),
      })
    );
  }
  if (jobs.length === 0) {
    console.warn('[monitor] Sin canal de alerta configurado (TELEGRAM_* o LEAD_WEBHOOK_URL).');
    return;
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === 'rejected' || (r.value && !r.value.ok)) {
      console.warn('[monitor] No se pudo entregar una alerta por uno de los canales.');
    }
  }
}

/**
 * Re-escaneo semanal (plan "tienda"). Usa el motor de la propia app en este servidor.
 * El cliente con plan de mantenimiento autorizó por contrato la auditoría de su dominio.
 */
async function rescanClient(client, s) {
  const base = (process.env.MONITOR_APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
  s.lastScanAttempt = Date.now();
  let data;
  try {
    const res = await fetch(base + '/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DefensaTI-Monitor/1.0 (re-escaneo semanal de cliente con mantenimiento)',
        // Con ADMIN_TOKEN el re-escaneo es completo (puertos y archivos sensibles); sin él, básico.
        ...(process.env.ADMIN_TOKEN ? { Authorization: 'Bearer ' + process.env.ADMIN_TOKEN.trim() } : {}),
      },
      body: JSON.stringify({
        url: client.domain,
        force: true,
        legalConsentAccepted: true,
        ...(process.env.ADMIN_TOKEN ? { mode: 'full' } : {}),
      }),
      signal: AbortSignal.timeout(150_000),
    });
    data = await res.json();
    if (!res.ok || !data?.report) throw new Error(data?.error || 'HTTP ' + res.status);
  } catch (err) {
    console.warn('[monitor] Re-escaneo fallido de ' + client.domain + ': ' + (err?.message || err));
    return;
  }

  const previous = s.lastScan;
  const { score, grade } = data.report;
  s.lastScan = { at: new Date().toISOString(), score, grade, reportId: data.id };
  appendLog(client.domain, { t: s.lastScan.at, scan: true, score, grade, reportId: data.id });

  if (previous && typeof previous.score === 'number' && score < previous.score) {
    await sendAlert(
      '🟠 SEGURIDAD: la calificación de ' + client.name + ' (' + client.domain + ') bajó de ' +
        previous.score + ' (' + previous.grade + ') a ' + score + ' (' + grade + ').\n' +
        'Informe: https://neuronalgravity.com/report/' + data.id
    );
  }
}

function formatDuration(ms) {
  const min = Math.max(1, Math.round(ms / 60_000));
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}

async function checkClient(client, state) {
  const now = Date.now();
  const s = (state[client.domain] ||= { failures: 0, downSince: null, alerted: false, lastCheck: 0, lastSslCheckDay: '' });
  s.lastCheck = now;

  const result = await checkUptime(client.domain);
  appendLog(client.domain, { t: new Date(now).toISOString(), up: result.up, status: result.status, ms: result.ms, error: result.error });

  if (result.up) {
    if (s.alerted && s.downSince) {
      await sendAlert(`✅ RECUPERADO: ${client.name} (${client.domain})\nEstuvo caído ${formatDuration(now - s.downSince)}.`);
    }
    s.failures = 0;
    s.downSince = null;
    s.alerted = false;
  } else {
    s.failures += 1;
    s.downSince ??= now;
    if (s.failures >= FAILURES_BEFORE_ALERT && !s.alerted) {
      s.alerted = true;
      const detail = result.status ? `HTTP ${result.status}` : result.error || 'sin respuesta';
      const priority = client.plan === 'tienda' ? ' [PRIORITARIO · TIENDA]' : '';
      await sendAlert(`🔴 CAÍDA${priority}: ${client.name} (${client.domain})\nMotivo: ${detail}\nDesde: ${new Date(s.downSince).toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
    }
  }

  // Certificado SSL: una comprobación diaria por cliente
  const today = new Date(now).toISOString().slice(0, 10);
  if (s.lastSslCheckDay !== today) {
    s.lastSslCheckDay = today;
    const days = await checkSslDays(client.domain);
    s.sslDaysRemaining = days;
    if (days !== null && days <= SSL_ALERT_DAYS) {
      const label = days < 0 ? `venció hace ${Math.abs(days)} día(s)` : `vence en ${days} día(s)`;
      await sendAlert(`🟠 SSL: el certificado de ${client.name} (${client.domain}) ${label}.`);
    }
  }
}

async function runPass({ force = false } = {}) {
  const clients = loadClients();
  const state = loadState();
  const now = Date.now();
  const due = clients.filter((c) => {
    const last = state[c.domain]?.lastCheck || 0;
    return force || now - last >= INTERVAL_MIN[c.plan] * 60_000 - 5_000;
  });
  // Lotes pequeños para no saturar el Droplet de 1 GB
  for (let i = 0; i < due.length; i += 5) {
    await Promise.all(due.slice(i, i + 5).map((c) => checkClient(c, state).catch((e) => console.error(`[monitor] ${c.domain}:`, e))));
  }

  // Re-escaneo semanal: como máximo un sitio por pasada para no cargar el servidor
  const toScan = clients.find((c) => {
    if (c.plan !== 'tienda') return false;
    const s = state[c.domain];
    if (!s || s.alerted) return false; // sitio caído: no tiene sentido escanearlo
    const lastOk = s.lastScan ? new Date(s.lastScan.at).getTime() : 0;
    return now - lastOk >= RESCAN_INTERVAL_MS && now - (s.lastScanAttempt || 0) >= RESCAN_RETRY_MS;
  });
  if (toScan) await rescanClient(toScan, state[toScan.domain]);

  if (due.length > 0 || toScan) saveState(state);
  return { total: clients.length, checked: due.length, scanned: toScan?.domain };
}

function monthlyReport(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    console.error('Formato de mes inválido. Usa AAAA-MM, por ejemplo: --report 2026-11');
    process.exit(1);
  }
  const clients = loadClients();
  const state = loadState();
  const rows = clients.map((c) => {
    const file = path.join(MONITOR_DIR, `${c.domain}.jsonl`);
    let total = 0;
    let up = 0;
    let msSum = 0;
    let incidents = 0;
    let wasUp = true;
    if (fs.existsSync(file)) {
      for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
        if (!line.startsWith(`{"t":"${month}`)) continue;
        try {
          const e = JSON.parse(line);
          if (e.scan) continue; // los re-escaneos no cuentan como comprobación de uptime
          total += 1;
          if (e.up) {
            up += 1;
            msSum += e.ms || 0;
          } else if (wasUp) {
            incidents += 1;
          }
          wasUp = e.up;
        } catch {
          // Línea corrupta: se omite
        }
      }
    }
    return {
      Cliente: c.name,
      Dominio: c.domain,
      Plan: c.plan,
      Comprobaciones: total,
      'Uptime %': total ? ((up / total) * 100).toFixed(2) : 'sin datos',
      Incidentes: incidents,
      'Respuesta media (ms)': up ? Math.round(msSum / up) : '-',
      'SSL (días)': state[c.domain]?.sslDaysRemaining ?? '-',
      'Último escaneo': state[c.domain]?.lastScan ? state[c.domain].lastScan.score + ' (' + state[c.domain].lastScan.grade + ')' : '-',
    };
  });
  console.log(`\nDEFENSA TI — Reporte mensual de mantenimiento · ${month}\n`);
  console.table(rows);
}

const args = process.argv.slice(2);

if (args.includes('--report')) {
  monthlyReport(args[args.indexOf('--report') + 1] || new Date().toISOString().slice(0, 7));
} else if (args.includes('--once')) {
  const r = await runPass({ force: true });
  console.log(`[monitor] Pasada única: ${r.checked}/${r.total} sitios comprobados.` + (r.scanned ? ` Re-escaneado: ${r.scanned}.` : ''));
} else {
  console.log(`[monitor] Servicio iniciado. Clientes: ${loadClients().length} (${path.relative(ROOT, CLIENTS_FILE)})`);
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runPass();
    } catch (e) {
      console.error('[monitor] Error en la pasada:', e);
    } finally {
      running = false;
    }
  };
  await tick();
  setInterval(tick, 60_000);
}
