import * as dns from 'dns';

export interface DnsSecurityResult {
  dmarc: {
    present: boolean;
    policy: 'reject' | 'quarantine' | 'none' | 'missing';
    raw?: string;
    risk: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
    description: string;
  };
  spf: {
    present: boolean;
    strict: boolean;
    raw?: string;
    risk: 'BAJO' | 'MEDIO' | 'ALTO';
    description: string;
  };
  scoreBonus: number; // Modificador de puntuación
}

/**
 * Inspección DNS Pasiva de Seguridad y Anti-Suplantación (Anti-Spoofing & Phishing Defense)
 * Verifica si el dominio corporativo implementa políticas DMARC y SPF para proteger su identidad.
 */
export async function scanDnsSecurity(domain: string): Promise<DnsSecurityResult> {
  const cleanDomain = domain.replace(/^www\./i, '').toLowerCase();

  const [dmarcRecords, domainTxtRecords] = await Promise.all([
    dns.promises.resolveTxt(`_dmarc.${cleanDomain}`).catch(() => []),
    dns.promises.resolveTxt(cleanDomain).catch(() => []),
  ]);

  // 1. Análisis de DMARC
  const rawDmarc = dmarcRecords.flat().join(' ');
  let dmarcPolicy: 'reject' | 'quarantine' | 'none' | 'missing' = 'missing';
  let dmarcRisk: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO' = 'CRÍTICO';
  let dmarcDesc = 'Sin registro DMARC. Cualquier atacante puede enviar correos fraudulentos suplantando este dominio corporativo.';

  if (rawDmarc && rawDmarc.includes('v=DMARC1')) {
    const policyMatch = rawDmarc.match(/p=([a-zA-Z]+)/);
    const p = policyMatch ? policyMatch[1].toLowerCase() : 'none';

    if (p === 'reject') {
      dmarcPolicy = 'reject';
      dmarcRisk = 'BAJO';
      dmarcDesc = 'Política DMARC estricta (p=reject). Los servidores de correo mundiales rechazan automáticamente cualquier correo suplantado.';
    } else if (p === 'quarantine') {
      dmarcPolicy = 'quarantine';
      dmarcRisk = 'MEDIO';
      dmarcDesc = 'Política DMARC en cuarentena (p=quarantine). Los correos no autorizados se envían a la carpeta de Spam/No deseado.';
    } else {
      dmarcPolicy = 'none';
      dmarcRisk = 'ALTO';
      dmarcDesc = 'DMARC en modo pasivo (p=none). Solo genera reportes estadísticos, no bloquea suplantaciones de identidad.';
    }
  }

  // 2. Análisis de SPF
  const spfRecord = domainTxtRecords.flat().find((r) => r.startsWith('v=spf1'));
  let spfPresent = false;
  let spfStrict = false;
  let spfRisk: 'BAJO' | 'MEDIO' | 'ALTO' = 'ALTO';
  let spfDesc = 'Sin registro SPF configurado. No hay validación de servidores autorizados para el envío de correos corporativos.';

  if (spfRecord) {
    spfPresent = true;
    if (spfRecord.includes('-all')) {
      spfStrict = true;
      spfRisk = 'BAJO';
      spfDesc = 'Registro SPF estricto (-all). Prohíbe explícitamente el envío desde cualquier servidor no autorizado.';
    } else if (spfRecord.includes('~all')) {
      spfStrict = false;
      spfRisk = 'MEDIO';
      spfDesc = 'Registro SPF permisivo (~all SoftFail). Los correos de servidores no listados podrían ser aceptados o marcados como sospechosos.';
    } else {
      spfStrict = false;
      spfRisk = 'ALTO';
      spfDesc = 'Registro SPF neutro o abierto (?all o +all). Permite a casi cualquier servidor despachar correos a nombre del dominio.';
    }
  }

  // Bonificación / Penalización
  let scoreBonus = 0;
  if (dmarcPolicy === 'reject' && spfStrict) {
    scoreBonus = 5;
  } else if (dmarcPolicy === 'missing' && !spfPresent) {
    scoreBonus = -10;
  }

  return {
    dmarc: {
      present: dmarcPolicy !== 'missing',
      policy: dmarcPolicy,
      raw: rawDmarc || undefined,
      risk: dmarcRisk,
      description: dmarcDesc,
    },
    spf: {
      present: spfPresent,
      strict: spfStrict,
      raw: spfRecord || undefined,
      risk: spfRisk,
      description: spfDesc,
    },
    scoreBonus,
  };
}
