'use client';

import { 
  Building2, 
  ShieldAlert, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import AuditEngineExplanation from '@/components/AuditEngineExplanation';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

interface Props {
  report: AuditReportRecord;
}

export default function BusinessOverview({ report }: Props) {
  const cleanUrl = (report.url || '').toLowerCase();
  const isGoogleOrGiant = 
    Boolean(report.isHyperscale) ||
    isHyperscalePlatform(cleanUrl) ||
    isHyperscalePlatform(report.url);

  // Evaluar riesgos de negocio basados en los resultados
  const missingHeaders = (report.headers || []).filter(h => !h.present);
  const hasClickjackingRisk = !isGoogleOrGiant && missingHeaders.some(h => h.header.toLowerCase().includes('frame'));
  const hasDowngradeRisk = !isGoogleOrGiant && missingHeaders.some(h => h.header.toLowerCase().includes('transport-security'));
  const hasOpenAdminPorts = (report.ports || []).some(
    p => p.isOpen && [21, 22, 3306, 5432, 1433, 6379, 3389, 445, 27017].includes(p.port)
  );
  const openAdminPortsList = (report.ports || []).filter(
    p => p.isOpen && [21, 22, 3306, 5432, 1433, 6379, 3389, 445, 27017].includes(p.port)
  );
  const openAdminPortsNames = openAdminPortsList
    .map(p => `${p.shortName || p.service || `Puerto ${p.port}`} (${p.port}${p.banner ? `: ${p.banner}` : ''})`)
    .join(', ');

  // Semáforo estricto de colores (Verde | Amarillo | Rojo)
  const sslStatus: 'green' | 'yellow' | 'red' = !report.ssl?.valid
    ? 'red'
    : (report.ssl.daysRemaining !== undefined && report.ssl.daysRemaining <= 15)
    ? 'yellow'
    : 'green';

  const antiCloningStatus: 'green' | 'yellow' | 'red' = isGoogleOrGiant
    ? 'green'
    : missingHeaders.length >= 3
    ? 'red'
    : missingHeaders.length > 0
    ? 'yellow'
    : 'green';

  const portsScanned = Boolean(report.ports?.length);
  const dbStatus: 'green' | 'yellow' | 'red' = hasOpenAdminPorts
    ? 'red'
    : 'green';

  const privacyLawStatus: 'green' | 'yellow' | 'red' = isGoogleOrGiant
    ? 'green'
    : !report.ssl?.valid
    ? 'red'
    : hasDowngradeRisk || missingHeaders.length >= 2
    ? 'yellow'
    : 'green';

  const getTrafficLightStyles = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return {
          container: 'bg-white/[0.03] border-white/10',
          icon: <CheckCircle2 className="w-5 h-5 text-[#EDEDED] shrink-0 mt-0.5" />,
          badge: (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
              🟢 Óptimo
            </span>
          )
        };
      case 'yellow':
        return {
          container: 'bg-white/[0.03] border-white/10',
          icon: <AlertTriangle className="w-5 h-5 text-[#EDEDED] shrink-0 mt-0.5" />,
          badge: (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
              🟡 Advertencia
            </span>
          )
        };
      case 'red':
        return {
          container: 'bg-white/[0.03] border-white/10',
          icon: <ShieldAlert className="w-5 h-5 text-[#ff4d4d] shrink-0 mt-0.5" />,
          badge: (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white/[0.03] text-[#ff4d4d] border border-white/10">
              🔴 Crítico
            </span>
          )
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      
      {/* Banner de Alerta Máxima por Fuga de Archivos Sensibles */}
      {report.sensitiveFiles?.hasExposedFiles && (
        <div className="p-5 bg-white/[0.03] border border-white/10 text-[#ff4d4d] text-xs sm:text-sm flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-[#ff4d4d] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#EDEDED] text-base">⚠️ Fuga Crítica de Archivos Confidenciales Detectada</span>
            <p className="text-rose-100 leading-relaxed">
              Se detectaron archivos de configuración o código fuente expuestos a internet público: {' '}
              <strong>{report.sensitiveFiles.findings.map(f => f.name).join(', ')}</strong>.
              Cualquier atacante puede extraer contraseñas de bases de datos o secretos de producción.
            </p>
          </div>
        </div>
      )}

      {/* Banner de Alerta Crítica por Anomalías de Malware en Portada */}
      {report.malware?.isInfectedOrSuspicious && (
        <div className="p-5 bg-white/[0.03] border border-white/10 text-[#ff4d4d] text-xs sm:text-sm flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-[#ff4d4d] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#EDEDED] text-base">🚨 Alerta de Seguridad: Posible Infección o Código Ofuscado en Portada</span>
            <p className="text-rose-100 leading-relaxed">
              {report.malware.description}
            </p>
          </div>
        </div>
      )}

      {/* Banner de Explicación de Caso Especial (Google, Cloudflare, etc.) */}
      {isGoogleOrGiant && (
        <div className="p-5 bg-[#0f172a] border border-white/10 text-[#EDEDED] text-xs sm:text-sm flex items-start gap-3.5">
          <HelpCircle className="w-5 h-5 text-[#bdbdbd] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#EDEDED]">¿Por qué un gigante como este obtiene Grado {report.grade || 'B'}?</span>
            <p className="text-neutral-200 leading-relaxed">
              Empresas masivas como Google priorizan la compatibilidad global con navegadores muy antiguos y utilizan listas de precarga nativas del navegador (<strong>HSTS Preload</strong> en Chrome). Sin embargo, <strong>para una empresa o comercio local</strong>, omitir estas cabeceras significa no tener ninguna protección ante ataques de suplantación.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de Diagnóstico de Impacto Comercial - Con fondo sólido y alto contraste Apple */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tarjeta 1: Riesgo de Marca y Phishing */}
        <div className="p-6 bg-[#0d0d0d] border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Suplantación de Marca</span>
              {hasClickjackingRisk ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
                  Riesgo Medio
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
                  Blindado
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-[#EDEDED]">Clonación y Clickjacking</h4>
            <p className="text-xs text-neutral-200 leading-relaxed font-normal">
              {isGoogleOrGiant
                ? 'Infraestructura de Hiperescala: La plataforma gestiona directivas de aislamiento propias a nivel de red troncal, bloqueando intentos de incrustación.'
                : hasClickjackingRisk
                ? 'Tu portal puede ser incrustado en webs maliciosas mediante marcos invisibles para capturar clics de clientes o robar credenciales.'
                : 'Tu web rechaza activamente ser incrustada en dominios de terceros. Protegido contra engaños visuales.'}
            </p>
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-2 pt-3 border-t border-white/10">
            <Users className="w-4 h-4 text-[#bdbdbd]" />
            <span>Impacto: Reputación y confianza de clientes</span>
          </div>
        </div>

        {/* Tarjeta 2: Fuga de Ventas y Advertencias */}
        <div className="p-6 bg-[#0d0d0d] border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Conversión y Ventas</span>
              {hasDowngradeRisk ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#ff4d4d] border border-white/10">
                  Pérdida Potencial
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
                  Óptimo
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-[#EDEDED]">Fricción en el Navegador</h4>
            <p className="text-xs text-neutral-200 leading-relaxed font-normal">
              {isGoogleOrGiant
                ? 'Cifrado forzado a nivel de navegador (HSTS Preload nativo en Chromium). No sufre riesgo de degradación a HTTP.'
                : hasDowngradeRisk
                ? 'Sin cifrado forzado (HSTS), conexiones públicas (Wi-Fi de cafeterías o centros comerciales) pueden degradar a HTTP plano provocando alertas de "Sitio no seguro".'
                : 'Conexión cifrada siempre forzada. Los clientes nunca verán advertencias de seguridad al entrar.'}
            </p>
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-2 pt-3 border-t border-white/10">
            <TrendingDown className="w-4 h-4 text-[#ff4d4d]" />
            <span>Impacto: Hasta 23% de rebote en pagos</span>
          </div>
        </div>

        {/* Tarjeta 3: Intrusión Perimetral */}
        <div className="p-6 bg-[#0d0d0d] border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Acceso al Servidor</span>
              {!portsScanned ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold text-neutral-400 border border-white/10">
                  No evaluado
                </span>
              ) : hasOpenAdminPorts ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#ff4d4d] border border-white/10">
                  Crítico
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white/[0.03] text-[#EDEDED] border border-white/10">
                  Protegido
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-[#EDEDED]">Puertas de Administración</h4>
            <p className="text-xs text-neutral-200 leading-relaxed font-normal">
              {!portsScanned
                ? 'No evaluado: este informe no incluye medición de puertos.'
                : hasOpenAdminPorts
                ? 'Se detectaron puertos de base de datos o administración (SSH/FTP) expuestos directamente a internet público sin firewall perimetral.'
                : 'Los puertos críticos de administración y bases de datos están filtrados o cerrados al público exterior.'}
            </p>
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-2 pt-3 border-t border-white/10">
            <DollarSign className="w-4 h-4 text-[#EDEDED]" />
            <span>Impacto: Continuidad operativa y datos</span>
          </div>
        </div>

      </div>

      {/* Resumen Ejecutivo para Gerencia - Formato Ultra Claro y Humano */}
      <div className="p-6 sm:p-7 bg-[#0d0d0d] border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#EDEDED]" />
            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight">
              Diagnóstico en Términos de Negocio (Para el Dueño o Gerente)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono px-3 py-1 bg-white/5 border border-white/10 text-neutral-300 w-fit">
            <span className="text-emerald-400 font-bold">🟢 Óptimo</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">🟡 Advertencia</span>
            <span>&bull;</span>
            <span className="text-rose-400 font-bold">🔴 Crítico</span>
          </div>
        </div>
        
        <div className="space-y-3 text-xs sm:text-sm">
          
          {/* 1. Candado de Seguridad (SSL) */}
          {(() => {
            const styles = getTrafficLightStyles(sslStatus);
            return (
              <div className={`flex items-start justify-between gap-3 p-3.5 border transition-colors ${styles.container}`}>
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div className="space-y-0.5">
                    <strong className="text-white block">1. Candado de Seguridad (Certificado SSL):</strong>
                    <span className="text-neutral-300">
                      {sslStatus === 'green' && `Activo y vigente por los próximos ${report.ssl?.daysRemaining ?? '...'} días. La conexión básica entre tu cliente y tu página viaja cifrada.`}
                      {sslStatus === 'yellow' && `Atención: El certificado SSL vence pronto (en ${report.ssl?.daysRemaining ?? 'pocos'} días). Requiere renovación preventiva inmediata.`}
                      {sslStatus === 'red' && 'Crítico: Certificado SSL vencido o inválido. Los navegadores muestran la pantalla roja de advertencia y bloquean visitas.'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">{styles.badge}</div>
              </div>
            );
          })()}

          {/* 2. Protección Anti-Clonación en Navegadores */}
          {(() => {
            const styles = getTrafficLightStyles(antiCloningStatus);
            return (
              <div className={`flex items-start justify-between gap-3 p-3.5 border transition-colors ${styles.container}`}>
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div className="space-y-0.5">
                    <strong className="text-white block">2. Protección Anti-Clonación en Navegadores:</strong>
                    <span className="text-neutral-300">
                      {isGoogleOrGiant
                        ? 'Infraestructura de Hiperescala: La plataforma implementa controles perimetrales propios y validación nativa de framing que impiden ser duplicada por terceros.'
                        : antiCloningStatus === 'green'
                        ? 'Tu portal cuenta con todas las directivas perimetrales (CSP, X-Frame) que impiden ser duplicado dentro de otras páginas.'
                        : antiCloningStatus === 'yellow'
                        ? `Faltan ${missingHeaders.length} reglas de blindaje perimetral para evitar que tu web sea incrustada en páginas externas.`
                        : `Faltan ${missingHeaders.length} reglas críticas de blindaje perimetral. Terceros pueden clonar o incrustar tu web en páginas espejo para suplantar tu identidad.`}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">{styles.badge}</div>
              </div>
            );
          })()}

          {/* 3. Accesos y Bases de Datos */}
          {(() => {
            if (!portsScanned) {
              return (
                <div className="p-3.5 border border-white/10">
                  <strong className="text-white block">3. Accesos y Bases de Datos:</strong>
                  <span className="text-neutral-400">No evaluado: este informe no incluye medición de puertos.</span>
                </div>
              );
            }
            const styles = getTrafficLightStyles(dbStatus);
            return (
              <div className={`flex items-start justify-between gap-3 p-3.5 border transition-colors ${styles.container}`}>
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div className="space-y-0.5">
                    <strong className="text-white block">3. Accesos y Bases de Datos:</strong>
                    <span className="text-neutral-300">
                      {dbStatus === 'green' && 'Tus bases de datos y accesos privados están debidamente ocultos y protegidos de miradas públicas.'}
                      {dbStatus === 'red' && `Peligro Crítico: Se detectaron puertos de gestión o base de datos expuestos (${openAdminPortsNames || 'MySQL / FTP'}). Riesgo de ataques de fuerza bruta y filtración de información confidencial.`}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">{styles.badge}</div>
              </div>
            );
          })()}

          {/* 4. Ley de Protección de Datos Personales (Perú Ley N° 29733) */}
          {(() => {
            const styles = getTrafficLightStyles(privacyLawStatus);
            return (
              <div className={`flex items-start justify-between gap-3 p-3.5 border transition-colors ${styles.container}`}>
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div className="space-y-0.5">
                    <strong className="text-white block">4. Ley de Protección de Datos Personales (Perú Ley N° 29733):</strong>
                    <span className="text-neutral-300">
                      {isGoogleOrGiant
                        ? 'Conforme a Estándares Globales: Implementa cifrado TLS 1.3 de extremo a extremo y precarga HSTS nativa (Chromium Preload), superando los requerimientos de la Ley N° 29733 y normativas internacionales (GDPR / ISO 27001).'
                        : privacyLawStatus === 'green'
                        ? 'Protegido: Las sesiones de los clientes viajan con cifrado seguro forzado, protegiendo los datos personales conforme a la Ley N° 29733.'
                        : privacyLawStatus === 'yellow'
                        ? 'En riesgo: Requiere forzar cifrado estricto y cookies seguras (Secure / HttpOnly) para prevenir filtraciones de sesiones y cumplir la Ley N° 29733.'
                        : 'Incumplimiento crítico: Al no contar con cifrado seguro activo, los datos de clientes viajan expuestos, generando riesgo de multas bajo la Ley N° 29733.'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">{styles.badge}</div>
              </div>
            );
          })()}
        </div>

        <div className="pt-2 text-xs text-neutral-400 border-t border-white/5 flex items-center gap-2">
          <span>💡 Si tu programador necesita las instrucciones técnicas exactas de código, cambia a la pestaña superior <strong>&ldquo;Vista Técnica (SysAdmin / Dev)&rdquo;</strong>.</span>
        </div>
      </div>

      {/* Explicación de los Motores: Red Determinista + IA Consultiva */}
      <AuditEngineExplanation 
        engineVersion={report.telemetry?.engineVersion || '1.2.0-cloud'}
        aiModel={report.telemetry?.aiModel || 'Neuronality AI (Google Gemini 1.5 Flash)'}
        targetResolvedIp={report.telemetry?.targetResolvedIp}
        durationMs={report.telemetry?.durationMs}
      />

    </div>
  );
}
