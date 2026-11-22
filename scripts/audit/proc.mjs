import { spawn } from 'node:child_process';

/**
 * Ejecuta una herramienta sin shell, con límite de tiempo y parada de emergencia.
 * No hereda los secretos de la aplicación (ADMIN_TOKEN, llaves de API).
 */
export function runTool(bin, args, { timeout = 600000, check, onStop, env: extra } = {}) {
  return new Promise((resolve) => {
    const env = {};
    for (const key of ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'TEMP', 'TMP', 'LANG']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    Object.assign(env, extra); // solo lo que el llamador pide de forma expresa
    const child = spawn(bin, args, { windowsHide: true, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    let reason;
    let spawnError;
    const stop = (why) => {
      if (reason) return;
      reason = why;
      child.kill('SIGKILL');
      onStop?.();
    };
    const timer = setTimeout(() => stop('tiempo agotado'), timeout);
    const watch = setInterval(() => {
      try { check?.(); } catch (e) { stop(e.message); }
    }, 1000);
    child.stdout.on('data', (d) => { if (out.length < 16e6) out += d; });
    child.stderr.on('data', (d) => { err = (err + d).slice(-4000); });
    child.on('error', (e) => { spawnError = e; });
    child.on('close', (code) => {
      clearTimeout(timer);
      clearInterval(watch);
      resolve({ code, out, err, reason, missing: spawnError?.code === 'ENOENT' });
    });
  });
}
