import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const primaryBlue = rgb(0 / 255, 113 / 255, 227 / 255);
  const darkNavy = rgb(15 / 255, 23 / 255, 42 / 255);
  const textDark = rgb(30 / 255, 41 / 255, 59 / 255);
  const textMuted = rgb(100 / 255, 116 / 255, 139 / 255);
  const borderLight = rgb(226 / 255, 232 / 255, 240 / 255);
  const bgLight = rgb(248 / 255, 250 / 255, 252 / 255);
  const badgeRed = rgb(225 / 255, 29 / 255, 72 / 255);
  const badgeGreen = rgb(16 / 255, 185 / 255, 129 / 255);
  const white = rgb(1, 1, 1);

  // ==========================================
  // PÁGINA 1: DICTAMEN EJECUTIVO (GERENCIA)
  // ==========================================
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
  const { width, height } = page1.getSize();

  // Encabezado Corporativo
  page1.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: darkNavy,
  });

  page1.drawText('DEFENSA TI  |  NEURONAL GRAVITY', {
    x: 40,
    y: height - 40,
    size: 16,
    font: fontBold,
    color: white,
  });

  page1.drawText('DICTAMEN TÉCNICO PERIMETRAL DE SEGURIDAD WEB & E-COMMERCE', {
    x: 40,
    y: height - 58,
    size: 9,
    font: fontHelvetica,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  page1.drawText('RUC: 10704877850  |  Lima, Perú', {
    x: width - 210,
    y: height - 40,
    size: 9,
    font: fontBold,
    color: rgb(56 / 255, 189 / 255, 248 / 255),
  });

  page1.drawText('WhatsApp: +1 (785) 643-3991', {
    x: width - 210,
    y: height - 55,
    size: 8.5,
    font: fontHelvetica,
    color: white,
  });

  // Marca de Agua "DOCUMENTO DE MUESTRA"
  page1.drawText('DOCUMENTO DE MUESTRA - CASO DIDACTICO', {
    x: 75,
    y: height / 2 - 20,
    size: 24,
    font: fontBold,
    color: rgb(226 / 255, 232 / 255, 240 / 255),
    rotate: { angle: 35, type: 'degrees' },
  });

  // Ficha de Auditoría
  let y = height - 105;
  page1.drawRectangle({
    x: 40,
    y: y - 50,
    width: width - 80,
    height: 60,
    color: bgLight,
    borderColor: borderLight,
    borderWidth: 1,
  });

  page1.drawText('FICHA DE LA AUDITORIA', {
    x: 52,
    y: y - 6,
    size: 8.5,
    font: fontBold,
    color: primaryBlue,
  });

  page1.drawText('Dominio Auditado: ejemplo-empresa-demo.pe (Sitio Modelo de Negocio)', {
    x: 52,
    y: y - 22,
    size: 9,
    font: fontBold,
    color: textDark,
  });

  page1.drawText('Tipo de Servicio: Auditoria Perimetral Independiente RFC / OWASP', {
    x: 52,
    y: y - 36,
    size: 8.5,
    font: fontHelvetica,
    color: textMuted,
  });

  page1.drawText('N° Expediente: DFT-2026-EJEMPLO', {
    x: width - 230,
    y: y - 22,
    size: 8.5,
    font: fontBold,
    color: textDark,
  });

  page1.drawText('Fecha de Emisión: 2026 (Vigente)', {
    x: width - 230,
    y: y - 36,
    size: 8.5,
    font: fontHelvetica,
    color: textMuted,
  });

  // Resumen Ejecutivo de Calificación
  y -= 75;
  page1.drawText('1. RESUMEN EJECUTIVO PARA LA GERENCIA', {
    x: 40,
    y,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  y -= 10;
  // Caja de Score
  page1.drawRectangle({
    x: 40,
    y: y - 75,
    width: 140,
    height: 75,
    color: rgb(255 / 255, 241 / 255, 242 / 255),
    borderColor: rgb(254 / 255, 205 / 255, 211 / 255),
    borderWidth: 1,
  });

  page1.drawText('CALIFICACION INICIAL', {
    x: 52,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: badgeRed,
  });

  page1.drawText('28 / 100', {
    x: 52,
    y: y - 45,
    size: 24,
    font: fontBold,
    color: badgeRed,
  });

  page1.drawText('GRADO F (VULNERABLE)', {
    x: 52,
    y: y - 62,
    size: 8.5,
    font: fontBold,
    color: badgeRed,
  });

  // Caja Proyectada con Blindaje
  page1.drawRectangle({
    x: 190,
    y: y - 75,
    width: 140,
    height: 75,
    color: rgb(236 / 255, 253 / 255, 245 / 255),
    borderColor: rgb(167 / 255, 243 / 255, 208 / 255),
    borderWidth: 1,
  });

  page1.drawText('OBJETIVO CON BLINDAJE', {
    x: 202,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: badgeGreen,
  });

  page1.drawText('96 / 100', {
    x: 202,
    y: y - 45,
    size: 24,
    font: fontBold,
    color: badgeGreen,
  });

  page1.drawText('GRADO A+ (MAXIMO NIVEL)', {
    x: 202,
    y: y - 62,
    size: 8.5,
    font: fontBold,
    color: badgeGreen,
  });

  // Diagnóstico Comercial
  page1.drawRectangle({
    x: 340,
    y: y - 75,
    width: width - 380,
    height: 75,
    color: bgLight,
    borderColor: borderLight,
    borderWidth: 1,
  });

  page1.drawText('DIAGNOSTICO DE IMPACTO EN VENTAS', {
    x: 350,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: textDark,
  });

  page1.drawText('• Riesgo de suspension de hosting por abuso.', {
    x: 350,
    y: y - 32,
    size: 7.5,
    font: fontHelvetica,
    color: textDark,
  });
  page1.drawText('• Pasarelas expuestas a ataques de fuerza bruta.', {
    x: 350,
    y: y - 45,
    size: 7.5,
    font: fontHelvetica,
    color: textDark,
  });
  page1.drawText('• Navegadores alertan sitio no seguro (fuga de clientes).', {
    x: 350,
    y: y - 58,
    size: 7.5,
    font: fontHelvetica,
    color: textDark,
  });

  // Tabla de Telemetría Perimetral (6 Cabeceras Críticas)
  y -= 105;
  page1.drawText('2. TELEMETRIA TECNICA DE LAS 6 CABECERAS DEFENSIVAS OWASP', {
    x: 40,
    y,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  y -= 15;
  const headers = [
    { name: 'Strict-Transport-Security (HSTS)', status: 'AUSENTE', pts: '0/25', risk: 'Conexión degradable a HTTP plano; vulnerable a Man-In-The-Middle.' },
    { name: 'Content-Security-Policy (CSP)', status: 'AUSENTE', pts: '0/25', risk: 'Permite ejecución de scripts inyectados y robo de cookies/sesiones.' },
    { name: 'X-Frame-Options (Clickjacking)', status: 'AUSENTE', pts: '0/15', risk: 'El sitio puede ser clonado o embebido en iframes invisibles fraudulentos.' },
    { name: 'X-Content-Type-Options (MIME Sniffing)', status: 'AUSENTE', pts: '0/10', risk: 'Navegadores ejecutan archivos de imagen o texto como scripts ejecutables.' },
    { name: 'Referrer-Policy', status: 'CORRECTO', pts: '10/10', risk: 'Protección activa al navegar hacia sitios externos.' },
    { name: 'Permissions-Policy', status: 'PARCIAL', pts: '5/15', risk: 'Acceso a cámara, geolocalización o micrófono no restringido formalmente.' },
  ];

  // Encabezado de tabla
  page1.drawRectangle({
    x: 40,
    y: y - 18,
    width: width - 80,
    height: 18,
    color: darkNavy,
  });

  page1.drawText('DIRECTIVA HTTP', { x: 48, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('ESTADO', { x: 250, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('PUNTAJE', { x: 320, y: y - 13, size: 8, font: fontBold, color: white });
  page1.drawText('EVALUACION DE RIESGO COMERCIAL', { x: 375, y: y - 13, size: 8, font: fontBold, color: white });

  y -= 20;

  for (let i = 0; i < headers.length; i++) {
    const row = headers[i];
    const rowColor = i % 2 === 0 ? bgLight : white;

    page1.drawRectangle({
      x: 40,
      y: y - 22,
      width: width - 80,
      height: 22,
      color: rowColor,
      borderColor: borderLight,
      borderWidth: 0.5,
    });

    page1.drawText(row.name, { x: 48, y: y - 14, size: 7.5, font: fontBold, color: textDark });
    
    const isBad = row.status === 'AUSENTE';
    const isGood = row.status === 'CORRECTO';
    const statColor = isBad ? badgeRed : (isGood ? badgeGreen : primaryBlue);
    page1.drawText(row.status, { x: 250, y: y - 14, size: 7.5, font: fontBold, color: statColor });
    page1.drawText(row.pts, { x: 320, y: y - 14, size: 7.5, font: fontMonoBold, color: textDark });
    page1.drawText(row.risk, { x: 375, y: y - 14, size: 7, font: fontHelvetica, color: textMuted });

    y -= 22;
  }

  // Dictamen del Auditor
  y -= 25;
  page1.drawRectangle({
    x: 40,
    y: y - 80,
    width: width - 80,
    height: 80,
    color: rgb(240 / 255, 249 / 255, 255 / 255),
    borderColor: rgb(186 / 255, 230 / 255, 253 / 255),
    borderWidth: 1,
  });

  page1.drawText('3. DICTAMEN OFICIAL DEL AUDITOR RESPONSABLE', {
    x: 52,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: primaryBlue,
  });

  page1.drawText(
    'SE DICTAMINA QUE EL SITIO WEB PRESENTA FALENCIAS CRITICAS DE TRANSPORTE Y AISLAMIENTO.',
    { x: 52, y: y - 32, size: 8, font: fontBold, color: textDark }
  );

  page1.drawText(
    'Recomendación Urgente: Se requiere aplicar el paquete de cabeceras canónicas (Blindaje Llave en Mano, S/ 165 PEN) y',
    { x: 52, y: y - 46, size: 8, font: fontHelvetica, color: textDark }
  );
  page1.drawText(
    'reforzar el perímetro con Cloudflare WAF (S/ 335 PEN) para asegurar Grado A+ y cumplimiento PCI-DSS en pasarelas.',
    { x: 52, y: y - 58, size: 8, font: fontHelvetica, color: textDark }
  );
  page1.drawText(
    'Firma y Sello Digital: Ing. Karol Martín Castillo Rojas — RUC 10704877850 — NEURONAL GRAVITY',
    { x: 52, y: y - 72, size: 8, font: fontBold, color: darkNavy }
  );

  // Pie de Página 1
  page1.drawRectangle({
    x: 40,
    y: 30,
    width: width - 80,
    height: 25,
    color: white,
    borderColor: borderLight,
    borderWidth: 0.5,
  });

  page1.drawText('DEFENSA TI  •  contacto@neuronalgravity.com  •  WhatsApp: +1 (785) 643-3991  •  RUC 10704877850', {
    x: 50,
    y: 39,
    size: 7.5,
    font: fontHelvetica,
    color: textMuted,
  });

  page1.drawText('Página 1 de 2  (Vista Gerencial)', {
    x: width - 180,
    y: 39,
    size: 7.5,
    font: fontBold,
    color: primaryBlue,
  });

  // ==========================================
  // PÁGINA 2: RECETA DE CÓDIGO (PARA DESARROLLADOR)
  // ==========================================
  const page2 = pdfDoc.addPage([595.28, 841.89]);

  // Encabezado Página 2
  page2.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: darkNavy,
  });

  page2.drawText('DEFENSA TI  |  GUIA TECNICA DE REMEDIACION', {
    x: 40,
    y: height - 40,
    size: 16,
    font: fontBold,
    color: white,
  });

  page2.drawText('RECETAS DE CODIGO OFICIALES OWASP & DIRECTIVAS DE SERVIDOR', {
    x: 40,
    y: height - 58,
    size: 9,
    font: fontHelvetica,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  page2.drawText('Expediente: DFT-2026-EJEMPLO', {
    x: width - 210,
    y: height - 40,
    size: 9,
    font: fontBold,
    color: rgb(56 / 255, 189 / 255, 248 / 255),
  });

  page2.drawText('Portal: ejemplo-empresa-demo.pe', {
    x: width - 210,
    y: height - 55,
    size: 8.5,
    font: fontHelvetica,
    color: white,
  });

  // Marca de Agua Página 2
  page2.drawText('DOCUMENTO DE MUESTRA - CASO DIDACTICO', {
    x: 75,
    y: height / 2 - 20,
    size: 24,
    font: fontBold,
    color: rgb(226 / 255, 232 / 255, 240 / 255),
    rotate: { angle: 35, type: 'degrees' },
  });

  let y2 = height - 105;
  page2.drawText('1. INSTRUCCIONES PARA TU PROGRAMADOR O ADMINISTRADOR DE SISTEMAS', {
    x: 40,
    y: y2,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  y2 -= 15;
  page2.drawRectangle({
    x: 40,
    y: y2 - 40,
    width: width - 80,
    height: 45,
    color: bgLight,
    borderColor: borderLight,
    borderWidth: 1,
  });

  page2.drawText('Para alcanzar Grado A+ (Score 96-100), tu programador debe copiar y pegar el bloque correspondiente a tu servidor.', {
    x: 50,
    y: y2 - 14,
    size: 8,
    font: fontBold,
    color: textDark,
  });
  page2.drawText('Si no cuentas con personal técnico o no deseas asumir riesgos de configuración, el equipo de DEFENSA TI implementa', {
    x: 50,
    y: y2 - 26,
    size: 7.5,
    font: fontHelvetica,
    color: textMuted,
  });
  page2.drawText('este blindaje llave en mano por S/ 165 PEN (entrega en 3 a 5 días con re-medición incluida).', {
    x: 50,
    y: y2 - 37,
    size: 7.5,
    font: fontBold,
    color: primaryBlue,
  });

  // Bloque NGINX
  y2 -= 60;
  page2.drawText('RECETA PARA SERVIDORES NGINX (/etc/nginx/conf.d/security.conf)', {
    x: 40,
    y: y2,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  y2 -= 10;
  const nginxLines = [
    '# 1. Forzar HTTPS con HSTS Precarga (2 anos)',
    'add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;',
    '# 2. Prevenir Clickjacking',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
    '# 3. Mitigar ataques de MIME Sniffing',
    'add_header X-Content-Type-Options "nosniff" always;',
    '# 4. Politica de Referrer Segura',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    '# 5. Content Security Policy (Anti-XSS)',
    'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\' https:; style-src \'self\' \'unsafe-inline\' https:;" always;',
    '# 6. Ocultar version de Nginx',
    'server_tokens off;',
  ];

  page2.drawRectangle({
    x: 40,
    y: y2 - (nginxLines.length * 14 + 16),
    width: width - 80,
    height: nginxLines.length * 14 + 16,
    color: darkNavy,
  });

  let codeY = y2 - 16;
  for (const line of nginxLines) {
    const isComment = line.startsWith('#');
    page2.drawText(line, {
      x: 50,
      y: codeY,
      size: 7.5,
      font: fontMono,
      color: isComment ? rgb(148 / 255, 163 / 255, 184 / 255) : rgb(52 / 255, 211 / 255, 153 / 255),
    });
    codeY -= 14;
  }

  y2 = codeY - 20;

  // Bloque APACHE / .htaccess
  page2.drawText('RECETA PARA SERVIDORES APACHE / cPanel (.htaccess)', {
    x: 40,
    y: y2,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  y2 -= 10;
  const apacheLines = [
    '<IfModule mod_headers.c>',
    '  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"',
    '  Header always set X-Frame-Options "SAMEORIGIN"',
    '  Header always set X-Content-Type-Options "nosniff"',
    '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
    '  Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"',
    '</IfModule>',
    '# Ocultar firmas de servidor en Apache',
    'ServerSignature Off',
  ];

  page2.drawRectangle({
    x: 40,
    y: y2 - (apacheLines.length * 14 + 16),
    width: width - 80,
    height: apacheLines.length * 14 + 16,
    color: darkNavy,
  });

  codeY = y2 - 16;
  for (const line of apacheLines) {
    const isComment = line.startsWith('#');
    page2.drawText(line, {
      x: 50,
      y: codeY,
      size: 7.5,
      font: fontMono,
      color: isComment ? rgb(148 / 255, 163 / 255, 184 / 255) : rgb(56 / 255, 189 / 255, 248 / 255),
    });
    codeY -= 14;
  }

  y2 = codeY - 20;

  // Checklist de 5 Pasos para el Cierre
  page2.drawText('CHECKLIST TECNICO DE AUDITORIA FINAL', {
    x: 40,
    y: y2,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  y2 -= 10;
  const checklist = [
    '1. Backup previo verificado: Respaldo integral de archivos web y volcado SQL en destino seguro.',
    '2. Inyeccion de directivas HTTP: Guardar configuracion y reiniciar servicio web (nginx -t / apachectl configtest).',
    '3. Revision de SSL/TLS: Forzado de TLS 1.3 con desactivacion de protocolos obsoletos TLS 1.0/1.1.',
    '4. Cierre de puertos de gestion: Validar que puertos 22 (SSH), 3306 (MySQL) y 8080 no esten expuestos al publico.',
    '5. Re-escaneo independiente: Validar subida a Grado A en DEFENSA TI (https://neuronalgravity.com/defensati).',
  ];

  for (const item of checklist) {
    page2.drawText(`[OK] ${item}`, {
      x: 45,
      y: y2 - 4,
      size: 7.5,
      font: fontHelvetica,
      color: textDark,
    });
    y2 -= 13;
  }

  // Pie de Página 2
  page2.drawRectangle({
    x: 40,
    y: 30,
    width: width - 80,
    height: 25,
    color: white,
    borderColor: borderLight,
    borderWidth: 0.5,
  });

  page2.drawText('DEFENSA TI  •  contacto@neuronalgravity.com  •  WhatsApp: +1 (785) 643-3991  •  RUC 10704877850', {
    x: 50,
    y: 39,
    size: 7.5,
    font: fontHelvetica,
    color: textMuted,
  });

  page2.drawText('Página 2 de 2  (Receta de Código para Dev)', {
    x: width - 230,
    y: 39,
    size: 7.5,
    font: fontBold,
    color: primaryBlue,
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'public', 'informe-ejemplo-defensati.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[OK] PDF generado con éxito en: ${outputPath} (${pdfBytes.length} bytes)`);
}

generateSamplePdf().catch(console.error);
