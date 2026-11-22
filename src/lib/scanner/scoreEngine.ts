export interface HeaderCheckResult {
  header: string;
  present: boolean;
  value: string | null;
  status: 'pass' | 'warning' | 'fail' | 'missing';
  description: string;
}

export interface SslCheckResult {
  valid: boolean;
  issuer: string;
  protocol: string;
  daysRemaining: number;
  cipher?: string;
}

export interface ScoreOutput {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  reasons: string[];
}

/**
 * Calcula la puntuación de seguridad considerando arquitectura perimetral real.
 * Distribución:
 * - 45% Seguridad de Transporte (TLS, Cyphers, Protocolo y HSTS)
 * - 40% Cabeceras Defensivas HTTP (OWASP)
 * Sin bonos por marca: solo puntúa lo observado.
 */
export function calculateSecurityScore(
  _domain: string,
  headers: HeaderCheckResult[],
  ssl: SslCheckResult
): ScoreOutput {
  let score = 0;
  const reasons: string[] = [];

  // ==========================================
  // 1. CAPA TLS / CRIPTOGRAFÍA (Hasta 45 pts)
  // ==========================================
  if (ssl.valid) {
    score += 20;

    // Validación de protocolo de transporte
    if (ssl.protocol.includes('TLSv1.3')) {
      score += 15;
    } else if (ssl.protocol.includes('TLSv1.2')) {
      score += 10;
    } else {
      reasons.push('Protocolo TLS legado detectado (inferior a TLSv1.2).');
    }

    // Vigencia del certificado
    if (ssl.daysRemaining > 30) {
      score += 10;
    } else if (ssl.daysRemaining > 0) {
      score += 5;
      reasons.push('Certificado próximo a expirar (menos de 30 días).');
    }
  } else {
    reasons.push('Fallo crítico en el handshake o validación del certificado SSL/TLS.');
  }

  // ==========================================
  // 2. CAPA CABECERAS DEFENSIVAS (Hasta 40 pts)
  // ==========================================
  const headerMap = new Map<string, HeaderCheckResult>();
  headers.forEach((h) => headerMap.set(h.header.toLowerCase(), h));

  // A. Strict-Transport-Security (HSTS)
  const hsts = headerMap.get('strict-transport-security');
  if (hsts?.status === 'pass') {
    score += 10;
  } else if (hsts?.status === 'warning') {
    score += 6;
  } else {
    reasons.push('Falta cabecera HSTS o no está precargada.');
  }

  // B. Content-Security-Policy (CSP)
  const csp = headerMap.get('content-security-policy');
  if (csp?.status === 'pass') {
    score += 10;
  } else if (csp?.status === 'warning') {
    score += 6;
  } else {
    reasons.push('Falta política de control de recursos (CSP).');
  }

  // C. X-Frame-Options / Frame-Ancestors
  const xfo = headerMap.get('x-frame-options');
  if (xfo?.status === 'pass' || xfo?.value?.includes('SAMEORIGIN')) {
    score += 8;
  } else {
    reasons.push('Riesgo de Clickjacking: Falta X-Frame-Options.');
  }

  // D. X-Content-Type-Options
  const xcto = headerMap.get('x-content-type-options');
  if (xcto?.status === 'pass') {
    score += 6;
  } else {
    reasons.push('Falta nosniff en X-Content-Type-Options.');
  }

  // E. Referrer-Policy
  const rp = headerMap.get('referrer-policy');
  if (rp?.status === 'pass' || rp?.value) {
    score += 6;
  }

  // Tope de escala normalizada
  score = Math.min(100, Math.max(0, score));

  // ==========================================
  // 4. DETERMINACIÓN DEL GRADO
  // ==========================================
  let grade: ScoreOutput['grade'] = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';

  return {
    score,
    grade,
    reasons,
  };
}