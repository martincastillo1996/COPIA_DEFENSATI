#!/usr/bin/env node
/**
 * DEFENSA TI — Generador del Informe de Entrega al Cliente (PDF)
 *
 * Documenta de forma obligatoria y estructurada cada intervención (AGENTS.md, regla 6):
 *   1. Qué se encontró        4. Qué respaldos se realizaron
 *   2. Qué se corrigió        5. Qué responsabilidad se asume
 *   3. Qué quedó pendiente    6. Qué garantías se ofrecen y cuáles no
 *
 * Uso:
 *   node scripts/generate-delivery-report.mjs <datos.json> [salida.pdf]
 *
 * Plantilla de datos: scripts/informe-entrega.ejemplo.json
 * Salida por defecto: informes/informe-entrega-<dominio>-<fecha>.pdf (carpeta fuera de git)
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

const SECTIONS = [
  { key: 'encontrado', title: '1. Qué se encontró', hint: 'Virus, malware, redirecciones maliciosas, fallas de cabeceras, puertos expuestos o vulnerabilidades detectadas.' },
  { key: 'corregido', title: '2. Qué se corrigió', hint: 'Acciones exactas de desinfección, parches perimetrales y cabeceras aplicadas.' },
  { key: 'pendiente', title: '3. Qué quedó pendiente', hint: 'Tareas fuera del alcance o que dependen del cliente.' },
  { key: 'respaldos', title: '4. Qué respaldos se realizaron', hint: 'Copias de seguridad de archivos y base de datos previas a la intervención.' },
  { key: 'responsabilidad', title: '5. Qué responsabilidad se asume', hint: 'Alcance técnico directo sobre la desinfección y el blindaje perimetral implementado.' },
];

const DEFAULT_RESPONSABILIDAD = [
  'DEFENSA TI asume responsabilidad técnica directa sobre la desinfección ejecutada y el blindaje perimetral implementado que se detallan en este informe.',
  'La responsabilidad se limita a los sistemas, archivos y configuraciones efectivamente intervenidos con los accesos entregados por el cliente.',
];

const DEFAULT_GARANTIAS_SI = [
  'Garantía de 30 días: si la web vuelve a infectarse por la misma causa remediada, se desinfecta nuevamente sin costo.',
];

const DEFAULT_GARANTIAS_NO = [
  'Reinfecciones originadas por la instalación de plugins o temas piratas o vulnerables.',
  'Accesos comprometidos por contraseñas débiles o reutilizadas.',
  'Modificaciones realizadas por terceros con posterioridad a la entrega.',
];

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function asList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

// Las fuentes estándar de PDF solo admiten WinAnsi: se normalizan los caracteres fuera de rango
function clean(text) {
  return String(text ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E -ÿ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) fail('Falta el archivo de datos.\n  Uso: node scripts/generate-delivery-report.mjs <datos.json> [salida.pdf]');

let data;
try {
  data = JSON.parse(fs.readFileSync(path.resolve(inputArg), 'utf-8'));
} catch (e) {
  fail(`No se pudo leer el JSON de datos: ${e.message}`);
}

const cliente = clean(data.cliente);
const dominio = clean(data.dominio).toLowerCase();
const servicio = clean(data.servicio);
if (!cliente || !dominio || !servicio) fail('Los campos "cliente", "dominio" y "servicio" son obligatorios.');

const content = {
  encontrado: asList(data.encontrado),
  corregido: asList(data.corregido),
  pendiente: asList(data.pendiente),
  respaldos: asList(data.respaldos),
  responsabilidad: asList(data.responsabilidad),
};
if (content.responsabilidad.length === 0) content.responsabilidad = DEFAULT_RESPONSABILIDAD;
if (content.pendiente.length === 0) content.pendiente = ['No quedaron tareas pendientes dentro del alcance contratado.'];

// Apartados que no pueden quedar vacíos: sin ellos el informe no cumple el protocolo
const missing = ['encontrado', 'corregido', 'respaldos'].filter((k) => content[k].length === 0);
if (missing.length > 0) fail(`Faltan apartados obligatorios en el JSON: ${missing.join(', ')}.`);

const garantiasSi = asList(data.garantias?.incluye);
const garantiasNo = asList(data.garantias?.excluye);
const garantias = {
  incluye: garantiasSi.length ? garantiasSi : DEFAULT_GARANTIAS_SI,
  excluye: garantiasNo.length ? garantiasNo : DEFAULT_GARANTIAS_NO,
};

const fechaEntrega = clean(data.fechaEntrega) || new Date().toISOString().slice(0, 10);
const reportCode = `DTI-${fechaEntrega.replace(/-/g, '')}-${dominio.replace(/[^a-z0-9]/g, '').slice(0, 10).toUpperCase()}`;

// ---------- Maquetación ----------
const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

const C = {
  navy: rgb(15 / 255, 23 / 255, 42 / 255),
  blue: rgb(0 / 255, 113 / 255, 227 / 255),
  sky: rgb(56 / 255, 189 / 255, 248 / 255),
  text: rgb(30 / 255, 41 / 255, 59 / 255),
  muted: rgb(100 / 255, 116 / 255, 139 / 255),
  border: rgb(226 / 255, 232 / 255, 240 / 255),
  bg: rgb(248 / 255, 250 / 255, 252 / 255),
  green: rgb(5 / 255, 150 / 255, 105 / 255),
  red: rgb(225 / 255, 29 / 255, 72 / 255),
  white: rgb(1, 1, 1),
};

const W = 595.28;
const H = 841.89;
const MARGIN = 44;
const BOTTOM = 60;
let page;
let y;

function newPage() {
  page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: H - 64, width: W, height: 64, color: C.navy });
  page.drawText('DEFENSA TI  |  NEURONAL GRAVITY', { x: MARGIN, y: H - 30, size: 13, font: bold, color: C.white });
  page.drawText('INFORME DE ENTREGA DE SERVICIO', { x: MARGIN, y: H - 46, size: 8.5, font, color: rgb(148 / 255, 163 / 255, 184 / 255) });
  const ruc = 'RUC 10704877850  |  Lima, Perú';
  page.drawText(ruc, { x: W - MARGIN - bold.widthOfTextAtSize(ruc, 8.5), y: H - 30, size: 8.5, font: bold, color: C.sky });
  page.drawText(reportCode, { x: W - MARGIN - font.widthOfTextAtSize(reportCode, 8), y: H - 46, size: 8, font, color: rgb(148 / 255, 163 / 255, 184 / 255) });
  y = H - 64 - 28;
}

function ensure(space) {
  if (y - space < BOTTOM) newPage();
}

function wrap(text, f, size, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of clean(text).split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (f.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    // Palabra más larga que la línea (URL o ruta): se parte por caracteres
    let chunk = word;
    while (f.widthOfTextAtSize(chunk, size) > maxWidth) {
      let cut = chunk.length - 1;
      while (cut > 1 && f.widthOfTextAtSize(chunk.slice(0, cut), size) > maxWidth) cut -= 1;
      lines.push(chunk.slice(0, cut));
      chunk = chunk.slice(cut);
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(text, { f = font, size = 10, color = C.text, x = MARGIN, maxWidth = W - MARGIN * 2, gap = 4 } = {}) {
  for (const line of wrap(text, f, size, maxWidth)) {
    ensure(size + gap);
    page.drawText(line, { x, y, size, font: f, color });
    y -= size + gap;
  }
}

function bullets(items, color = C.blue) {
  for (const item of items) {
    const lines = wrap(item, font, 10, W - MARGIN * 2 - 16);
    ensure(14);
    page.drawCircle({ x: MARGIN + 4, y: y + 3.2, size: 2, color });
    for (const line of lines) {
      ensure(14);
      page.drawText(line, { x: MARGIN + 16, y, size: 10, font, color: C.text });
      y -= 14;
    }
    y -= 3;
  }
}

function sectionTitle(title, hint) {
  ensure(70);
  y -= 10;
  page.drawRectangle({ x: MARGIN, y: y - 6, width: W - MARGIN * 2, height: 22, color: C.bg, borderColor: C.border, borderWidth: 0.8 });
  page.drawRectangle({ x: MARGIN, y: y - 6, width: 3, height: 22, color: C.blue });
  page.drawText(clean(title).toUpperCase(), { x: MARGIN + 12, y: y + 1, size: 10.5, font: bold, color: C.navy });
  y -= 22;
  if (hint) {
    paragraph(hint, { size: 8.5, color: C.muted, gap: 3 });
    y -= 4;
  }
}

newPage();

// Ficha del servicio
const ficha = [
  ['Cliente', cliente],
  ['Sitio web', dominio],
  ['Servicio', servicio],
  ['Fecha de intervención', clean(data.fechaIntervencion) || fechaEntrega],
  ['Fecha de entrega', fechaEntrega],
  ['Responsable técnico', clean(data.responsable) || 'Martín Castillo - DEFENSA TI'],
];
for (const [label, value] of ficha) {
  const lines = wrap(value, bold, 10, W - MARGIN * 2 - 140);
  ensure(lines.length * 14 + 4);
  page.drawText(`${label}:`, { x: MARGIN, y, size: 10, font, color: C.muted });
  for (const line of lines) {
    page.drawText(line, { x: MARGIN + 140, y, size: 10, font: bold, color: C.text });
    y -= 14;
  }
  y -= 2;
}
page.drawLine({ start: { x: MARGIN, y: y + 2 }, end: { x: W - MARGIN, y: y + 2 }, thickness: 0.8, color: C.border });

if (clean(data.resumen)) {
  y -= 12;
  paragraph(data.resumen, { size: 10.5 });
}

for (const section of SECTIONS) {
  sectionTitle(section.title, section.hint);
  bullets(content[section.key]);
}

sectionTitle('6. Qué garantías se ofrecen y cuáles no', 'Condiciones de garantía aplicables a esta intervención.');
paragraph('La garantía CUBRE:', { f: bold, size: 10, color: C.green });
y -= 2;
bullets(garantias.incluye, C.green);
y -= 4;
paragraph('La garantía NO CUBRE:', { f: bold, size: 10, color: C.red });
y -= 2;
bullets(garantias.excluye, C.red);

// Conformidad
ensure(110);
y -= 26;
page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + 210, y }, thickness: 0.8, color: C.muted });
page.drawLine({ start: { x: W - MARGIN - 210, y }, end: { x: W - MARGIN, y }, thickness: 0.8, color: C.muted });
y -= 13;
page.drawText('Martín Castillo - DEFENSA TI', { x: MARGIN, y, size: 9, font: bold, color: C.text });
page.drawText(`Conformidad del cliente: ${cliente}`.slice(0, 52), { x: W - MARGIN - 210, y, size: 9, font: bold, color: C.text });
y -= 12;
page.drawText('Responsable técnico de la intervención', { x: MARGIN, y, size: 8, font, color: C.muted });
page.drawText('Nombre, firma y fecha', { x: W - MARGIN - 210, y, size: 8, font, color: C.muted });

// Pie de página numerado
const pages = pdf.getPages();
pages.forEach((p, i) => {
  const footer = `neuronalgravity.com/defensati  |  contacto@neuronalgravity.com  |  WhatsApp +1 (785) 643-3991`;
  p.drawLine({ start: { x: MARGIN, y: 42 }, end: { x: W - MARGIN, y: 42 }, thickness: 0.6, color: C.border });
  p.drawText(footer, { x: MARGIN, y: 28, size: 7.5, font, color: C.muted });
  const num = `Página ${i + 1} de ${pages.length}`;
  p.drawText(num, { x: W - MARGIN - font.widthOfTextAtSize(num, 7.5), y: 28, size: 7.5, font, color: C.muted });
});

pdf.setTitle(`Informe de entrega - ${dominio}`);
pdf.setAuthor('DEFENSA TI - Neuronal Gravity');

const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.join(process.cwd(), 'informes', `informe-entrega-${dominio.replace(/[^a-z0-9.-]/g, '')}-${fechaEntrega}.pdf`);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, await pdf.save());
console.log(`\n✓ Informe de entrega generado (${pages.length} página${pages.length === 1 ? '' : 's'}):\n  ${outputPath}\n`);
