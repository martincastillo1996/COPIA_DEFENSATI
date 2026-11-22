// Informe en PDF para el cliente, generado con el mismo Chrome del rastreo con navegador.
// El HTML lleva texto del sitio auditado (escapado): se renderiza sin JavaScript y sin red.
import fs from 'node:fs';
import { launchBrowser } from './browser.mjs';

const FOOTER = '<div style="font-size:8px;width:100%;text-align:center;color:#666;font-family:sans-serif">DEFENSA TI · Confidencial · Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>';

/** @param {string} html @param {string} file @param {{ launcher?: any, footer?: boolean }} [opts] footer:false = una hoja sin márgenes ni pie (el resumen de una página) */
export async function renderPdf(html, file, { launcher, footer = true } = {}) {
  let chromium = launcher;
  if (!chromium) {
    try { ({ chromium } = await import('playwright-core')); } catch { throw new Error('Para generar PDF falta playwright-core (npm install) y Chrome o Edge.'); }
  }
  let browser;
  try {
    browser = await launchBrowser(chromium, ['--disable-dev-shm-usage', ...(process.env.AUDIT_BROWSER_NOSANDBOX === '1' ? ['--no-sandbox'] : [])]);
  } catch (e) {
    throw new Error(`No se pudo abrir Chrome ni Edge para generar el PDF (${String(e.message).split('\n')[0].slice(0, 120)}). Instálalo o fija CHROME_PATH.`);
  }
  try {
    const context = await browser.newContext({ javaScriptEnabled: false });
    await context.route('**/*', (route) => route.abort());
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: !footer,
      ...(footer ? { margin: { top: '18mm', bottom: '20mm', left: '14mm', right: '14mm' }, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: FOOTER } : { margin: { top: '0', bottom: '0', left: '0', right: '0' } }) });
  } finally {
    await browser.close().catch(() => {});
  }
  fs.chmodSync(file, 0o600);
  return file;
}
