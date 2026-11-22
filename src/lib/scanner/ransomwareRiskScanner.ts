/**
 * Motor Perimetral de Evaluación de Riesgo de Secuestro de Datos (Ransomware Attack Surface Index)
 * DEFENSA TI Enterprise Engine - Standard MITRE ATT&CK & NIST CSF
 * 
 * Evalúa los precursores y vectores de entrada perimetral que grupos como LockBit,
 * BlackCat (ALPHV), Akira y Conti explotan en bancos, corporativos e infraestructuras críticas:
 * 1. Acceso Remoto Expuesto (MITRE T1133 - External Remote Services): RDP, VNC, SSH, Telnet.
 * 2. Protocolos de Movimiento Lateral (MITRE T1021 - Remote Services): SMB 445 (WannaCry), NetBIOS 139, NFS 2049.
 * 3. Fuga de Credenciales y Secretos Maestros (MITRE T1552 - Unsecured Credentials): .env, .git, backups.
 * 4. Exfiltración y Destrucción de Bases de Datos (MITRE T1486 - Data Encrypted for Impact): DBs expuestas sin VPN.
 * 5. Orquestación y Contenedores Expuestos (MITRE T1190): Docker API 2375, Kubernetes etcd 2379.
 */

import { PortCheckResult } from '@/lib/scanner/portScanner';
import { SensitiveFilesResult } from '@/lib/scanner/sensitiveFilesScanner';

export interface RansomwareVectorDetail {
  /** false = no se midió: no puede mostrarse como seguro. */
  evaluated?: boolean;
  exposed: boolean;
  severity: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
  mitreTechnique: string;
  mitreId: string;
  evidence: string[];
  description: string;
  remediation: string;
}

export interface RansomwareRiskResult {
  /** false = ningún vector se midió: ni puntuación ni nivel son válidos. */
  evaluated?: boolean;
  score: number; // 0 (Perímetro Inmune/Bastionado) a 100 (Crítico / Máxima Exposición a Secuestro)
  level: 'BAJO' | 'MODERADO' | 'ELEVADO' | 'CRÍTICO';
  exposureSummary: string;
  vectors: {
    remoteAccess: RansomwareVectorDetail;
    lateralMovement: RansomwareVectorDetail;
    unauthenticatedDataStores: RansomwareVectorDetail;
    credentialLeakage: RansomwareVectorDetail;
    orchestrationEngines: RansomwareVectorDetail;
  };
  threatActorsProfile: string[];
  remediationPlan: string[];
}

export function evaluateRansomwareRisk(params: {
  ports: PortCheckResult[];
  sensitiveFiles?: SensitiveFilesResult;
  isHyperscale?: boolean;
  /** Los archivos sensibles solo se buscan en modo full. */
  filesScanned?: boolean;
}): RansomwareRiskResult {
  const openPortSet = new Set(params.ports.filter((p) => p.isOpen).map((p) => p.port));
  const openPortDetails = new Map(params.ports.filter((p) => p.isOpen).map((p) => [p.port, p]));
  const findings = params.sensitiveFiles?.findings?.filter((f) => f.isExposed) || [];

  const portsScanned = params.ports.length > 0;
  let riskScore = 0;

  // 1. Vector: Acceso Remoto Expuesto (MITRE T1133)
  const remotePorts = [3389, 5900, 5901, 23, 22].filter((p) => openPortSet.has(p));
  const hasRdp = openPortSet.has(3389);
  const hasVnc = openPortSet.has(5900) || openPortSet.has(5901);
  const hasTelnet = openPortSet.has(23);
  const hasSsh = openPortSet.has(22);

  let remoteAccessSeverity: RansomwareVectorDetail['severity'] = 'BAJO';
  const remoteEvidences: string[] = [];

  if (hasRdp) {
    remoteEvidences.push('Puerto 3389 (RDP Escritorio Remoto) expuesto directamente.');
    riskScore += 40; // Vector #1 de ransomware en corporativos
    remoteAccessSeverity = 'CRÍTICO';
  }
  if (hasVnc) {
    remoteEvidences.push('Puerto 5900/5901 (VNC Desktop) accesible sin túnel seguro.');
    riskScore += 30;
    remoteAccessSeverity = 'CRÍTICO';
  }
  if (hasTelnet) {
    remoteEvidences.push('Puerto 23 (Telnet en texto plano) activo.');
    riskScore += 25;
    remoteAccessSeverity = 'CRÍTICO';
  }
  if (hasSsh && !params.isHyperscale) {
    const banner = openPortDetails.get(22)?.banner;
    remoteEvidences.push(`Puerto 22 (SSH) expuesto a la red pública${banner ? ` [${banner}]` : ''}.`);
    riskScore += 15;
    if (remoteAccessSeverity !== 'CRÍTICO') remoteAccessSeverity = 'ALTO';
  }

  const remoteAccess: RansomwareVectorDetail = {
    exposed: remotePorts.length > 0,
    evaluated: portsScanned,
    severity: remoteAccessSeverity,
    mitreTechnique: 'External Remote Services',
    mitreId: 'T1133',
    evidence: remoteEvidences,
    description: remotePorts.length > 0
      ? `Se detectaron ${remotePorts.length} interfaces de administración remota abiertas. Son el vector primario de intrusión de operadores de ransomware para ejecutar fuerza bruta y despliegue de payloads.`
      : !portsScanned
      ? 'No evaluado: este informe no incluye medición de puertos.'
      : 'No se detectaron puertos de administración remota (RDP, VNC, Telnet) entre los revisados.',
    remediation: 'Cerrar de inmediato el puerto en el firewall de borde y canalizar el acceso administrativo exclusivamente a través de VPN corporativa con MFA o Zero Trust.',
  };

  // 2. Vector: Movimiento Lateral / Compartición de Archivos (MITRE T1021.002)
  const lateralPorts = [445, 139, 2049, 111].filter((p) => openPortSet.has(p));
  const hasSmb = openPortSet.has(445);
  const hasNetbios = openPortSet.has(139);
  const hasNfs = openPortSet.has(2049);
  const hasRpc = openPortSet.has(111);

  let lateralSeverity: RansomwareVectorDetail['severity'] = 'BAJO';
  const lateralEvidences: string[] = [];

  if (hasSmb) {
    lateralEvidences.push('Puerto 445 (SMB) abierto: Altamente vulnerable a exploits tipo EternalBlue / WannaCry.');
    riskScore += 45;
    lateralSeverity = 'CRÍTICO';
  }
  if (hasNetbios) {
    lateralEvidences.push('Puerto 139 (NetBIOS Session) expuesto a enumeración de red y credenciales NTLM.');
    riskScore += 25;
    if (lateralSeverity !== 'CRÍTICO') lateralSeverity = 'ALTO';
  }
  if (hasNfs) {
    lateralEvidences.push('Puerto 2049 (NFS) accesible públicamente: riesgo de montaje no autorizado de discos.');
    riskScore += 30;
    lateralSeverity = 'CRÍTICO';
  }
  if (hasRpc) {
    lateralEvidences.push('Puerto 111 (RPC / Portmapper) abierto a consultas de topología interna.');
    riskScore += 15;
    if (lateralSeverity === 'BAJO') lateralSeverity = 'MEDIO';
  }

  const lateralMovement: RansomwareVectorDetail = {
    exposed: lateralPorts.length > 0,
    evaluated: portsScanned,
    severity: lateralSeverity,
    mitreTechnique: 'Remote Services: SMB/Windows Admin Shares',
    mitreId: 'T1021.002',
    evidence: lateralEvidences,
    description: lateralPorts.length > 0
      ? 'Protocolos de red interna expuestos a internet. Permiten a gusanos y actores maliciosos propagar ransomware automáticamente entre servidores sin requerir credenciales válidas.'
      : !portsScanned
      ? 'No evaluado: este informe no incluye medición de puertos.'
      : 'Sin protocolos de compartición de archivos o RPC expuestos perimetralmente.',
    remediation: 'Bloquear los puertos TCP 445, 139, 2049 y 111 en el enrutador perimetral de inmediato. Ningún servicio SMB debe ser visible en internet.',
  };

  // 3. Vector: Almacenes de Datos sin Autenticación / Bases de Datos Expuestas (MITRE T1486 / T1567)
  const dbPorts = [3306, 5432, 1433, 1521, 6379, 27017, 5984, 9200, 5601, 7474].filter((p) => openPortSet.has(p));
  let dbSeverity: RansomwareVectorDetail['severity'] = 'BAJO';
  const dbEvidences: string[] = [];

  for (const port of dbPorts) {
    const item = openPortDetails.get(port);
    const serviceName = item?.service || `Puerto ${port}`;
    const banner = item?.banner ? ` (${item.banner})` : '';
    dbEvidences.push(`${serviceName}${banner} expuesto a la red pública.`);
    riskScore += (port === 6379 || port === 27017 || port === 9200) ? 35 : 25;
    dbSeverity = 'CRÍTICO';
  }

  const unauthenticatedDataStores: RansomwareVectorDetail = {
    exposed: dbPorts.length > 0,
    evaluated: portsScanned,
    severity: dbSeverity,
    mitreTechnique: 'Data Encrypted for Impact & Exfiltration',
    mitreId: 'T1486',
    evidence: dbEvidences,
    description: dbPorts.length > 0
      ? `Se detectaron ${dbPorts.length} motores de base de datos o índices accesibles desde internet. Los sindicatos de ransomware utilizan bots que escanean estos puertos para exfiltrar las tablas, borrar la base de datos y dejar una nota de extorsión monetaria.`
      : !portsScanned
      ? 'No evaluado: este informe no incluye medición de puertos.'
      : 'No se detectaron bases de datos entre los puertos revisados.',
    remediation: 'Enlazar los daemons de base de datos a 127.0.0.1 o interfaz privada de red y restringir las conexiones con reglas estrictas de iptables/firewall de nube.',
  };

  // 4. Vector: Fuga de Credenciales y Secretos Maestros (MITRE T1552)
  let credSeverity: RansomwareVectorDetail['severity'] = 'BAJO';
  const credEvidences: string[] = [];

  for (const finding of findings) {
    credEvidences.push(`${finding.name}: ${finding.path}`);
    if (finding.severity === 'CRÍTICA') {
      riskScore += 35;
      credSeverity = 'CRÍTICO';
    } else if (finding.severity === 'ALTA') {
      riskScore += 20;
      if (credSeverity !== 'CRÍTICO') credSeverity = 'ALTO';
    }
  }

  const credentialLeakage: RansomwareVectorDetail = {
    exposed: findings.length > 0,
    evaluated: findings.length > 0 || Boolean(params.filesScanned),
    severity: credSeverity,
    mitreTechnique: 'Unsecured Credentials: File and Directory Discovery',
    mitreId: 'T1552.001',
    evidence: credEvidences,
    description: findings.length > 0
      ? `Se identificaron ${findings.length} archivos con fuga de credenciales o código fuente (.env, .git, backups). Proveen las contraseñas necesarias para que los atacantes accedan a la infraestructura en la nube sin levantar alertas.`
      : params.filesScanned
      ? 'No se detectaron fugas públicas de archivos .env, repositorios Git ni copias de seguridad.'
      : 'No evaluado: los archivos .env, .git y los respaldos solo se buscan en la auditoría completa autorizada.',
    remediation: 'Configurar el servidor web para denegar peticiones a archivos ocultos (location ~ /\\. { deny all; }) y eliminar respaldos de la carpeta pública.',
  };

  // 5. Vector: Orquestación y Contenedores Expuestos (MITRE T1190)
  const orchPorts = [2375, 2376, 2379, 8888, 9090].filter((p) => openPortSet.has(p));
  let orchSeverity: RansomwareVectorDetail['severity'] = 'BAJO';
  const orchEvidences: string[] = [];

  if (openPortSet.has(2375)) {
    orchEvidences.push('Docker Daemon API sin TLS (2375): Ejecución remota arbitraria de contenedores como root.');
    riskScore += 45;
    orchSeverity = 'CRÍTICO';
  }
  if (openPortSet.has(2376)) {
    orchEvidences.push('Docker Daemon API TLS (2376) expuesta a internet.');
    riskScore += 25;
    if (orchSeverity !== 'CRÍTICO') orchSeverity = 'ALTO';
  }
  if (openPortSet.has(2379)) {
    orchEvidences.push('Kubernetes etcd (2379): Almacén de configuración y secretos del clúster accesible.');
    riskScore += 40;
    orchSeverity = 'CRÍTICO';
  }
  if (openPortSet.has(8888)) {
    orchEvidences.push('Jupyter Notebook (8888) activo: Ejecución interactiva de scripts y comandos de consola.');
    riskScore += 25;
    if (orchSeverity !== 'CRÍTICO') orchSeverity = 'ALTO';
  }

  const orchestrationEngines: RansomwareVectorDetail = {
    exposed: orchPorts.length > 0,
    evaluated: portsScanned,
    severity: orchSeverity,
    mitreTechnique: 'Exploit Public-Facing Application: Container/API Control',
    mitreId: 'T1190',
    evidence: orchEvidences,
    description: orchPorts.length > 0
      ? 'APIs de Docker, clústeres Kubernetes o consolas de ejecución expuestas al exterior, permitiendo el despliegue directo de payloads de cifrado y minería.'
      : !portsScanned
      ? 'No evaluado: este informe no incluye medición de puertos.'
      : 'No se detectaron API de contenedores entre los puertos revisados.',
    remediation: 'Aislar las APIs de Docker y etcd para que únicamente escuchen en localhost o red interna autenticada con mTLS.',
  };

  // Consolidación y Normalización del Índice de Riesgo (0-100)
  const normalizedScore = Math.min(100, Math.max(0, riskScore));

  let level: RansomwareRiskResult['level'] = 'BAJO';
  if (normalizedScore >= 60) level = 'CRÍTICO';
  else if (normalizedScore >= 35) level = 'ELEVADO';
  else if (normalizedScore >= 15) level = 'MODERADO';

  const threatActorsProfile: string[] = [];
  if (hasRdp || hasVnc) {
    threatActorsProfile.push('LockBit 3.0 / BlackCat (Explotación de RDP y Credenciales Iniciales)');
  }
  if (hasSmb || hasNetbios) {
    threatActorsProfile.push('WannaCry / NotPetya Variants (Propagación por gusanos SMB)');
  }
  if (dbPorts.length > 0) {
    threatActorsProfile.push('Ransomware Automatizado de Bases de Datos (Scrapers NoSQL/SQL Dump & Extort)');
  }
  if (findings.length > 0) {
    threatActorsProfile.push('FIN7 / Initial Access Brokers (Compra y venta de accesos basados en credenciales .env)');
  }
  if (portsScanned && threatActorsProfile.length === 0) {
    threatActorsProfile.push('Sin actividad detectable de sindicatos conocidos en este perímetro');
  }

  const remediationPlan: string[] = [];
  if (remoteAccess.exposed) remediationPlan.push(remoteAccess.remediation);
  if (lateralMovement.exposed) remediationPlan.push(lateralMovement.remediation);
  if (unauthenticatedDataStores.exposed) remediationPlan.push(unauthenticatedDataStores.remediation);
  if (credentialLeakage.exposed) remediationPlan.push(credentialLeakage.remediation);
  if (orchestrationEngines.exposed) remediationPlan.push(orchestrationEngines.remediation);

  if (remediationPlan.length === 0) {
    remediationPlan.push('Mantener la política de Cero Confianza (Zero Trust) y auditorías automatizadas periódicas.');
  }

  let exposureSummary = '';
  if (level === 'CRÍTICO') {
    exposureSummary = 'PELIGRO INMEDIATO: El perímetro presenta vulnerabilidades críticas que permiten el secuestro de datos y el compromiso total de la infraestructura en cuestión de minutos.';
  } else if (level === 'ELEVADO') {
    exposureSummary = 'RIESGO SIGNIFICATIVO: Existen servicios o configuraciones expuestas que facilitan el acceso no autorizado a atacantes dirigidos.';
  } else if (level === 'MODERADO') {
    exposureSummary = 'RIESGO CONTROLADO: Perímetro web estándar pero con puertos o cabeceras que requieren blindaje para evitar escalamiento.';
  } else if (!portsScanned) {
    exposureSummary = params.filesScanned
      ? 'Puertos no evaluados. Solo se revisaron archivos sensibles.'
      : 'No evaluado: este informe no incluye medición de puertos ni de archivos sensibles.';
  } else {
    exposureSummary = params.filesScanned
      ? 'Sin exposición detectada en los puertos y archivos revisados.'
      : 'Sin exposición detectada en los puertos revisados. Archivos y secretos no evaluados.';
  }

  return {
    evaluated: portsScanned || findings.length > 0,
    score: normalizedScore,
    level,
    exposureSummary,
    vectors: {
      remoteAccess,
      lateralMovement,
      unauthenticatedDataStores,
      credentialLeakage,
      orchestrationEngines,
    },
    threatActorsProfile,
    remediationPlan,
  };
}
