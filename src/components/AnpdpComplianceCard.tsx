'use client';

import React from 'react';
import { Scale, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface AnpdpComplianceCardProps {
  domain: string;
  hasValidSsl?: boolean;
  hasDowngradeRisk?: boolean;
  hasOpenAdminPorts?: boolean;
  cookiesSecure?: boolean;
  isHyperscale?: boolean;
}

export default function AnpdpComplianceCard({
  domain,
  hasValidSsl = true,
  hasDowngradeRisk = false,
  hasOpenAdminPorts = false,
  cookiesSecure = true,
  isHyperscale = false,
}: AnpdpComplianceCardProps) {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  
  // Evaluación legal bajo Ley N° 29733 (Perú)
  const isTransportCompliant = hasValidSsl && !hasDowngradeRisk;
  const isDataStorageCompliant = !hasOpenAdminPorts;
  const isSessionCompliant = cookiesSecure;

  const totalPassed = [isTransportCompliant, isDataStorageCompliant, isSessionCompliant].filter(Boolean).length;
  const complianceStatus = isHyperscale || totalPassed === 3 ? 'optimo' : totalPassed === 2 ? 'observacion' : 'critico';

  const whatsappNumber = (siteConfig.contact.whatsappNumber || '17856433991').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hola Martín, estuve revisando la ficha de cumplimiento Ley N° 29733 para mi web ${cleanDomain} en DEFENSA TI. Quisiera asesoría para asegurar el cumplimiento ante la ANPDP y evitar multas.`
  );

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl space-y-5 text-left">
      {/* Header Legal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Auditoría Legal: Ley N° 29733 de Protección de Datos Personales</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluación de directivas técnicas exigidas por la Autoridad Nacional de Protección de Datos Personales (ANPDP - MinJus).
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold w-fit ${
          complianceStatus === 'optimo'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : complianceStatus === 'observacion'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          {complianceStatus === 'optimo'
            ? '🟢 Conforme Ley 29733'
            : complianceStatus === 'observacion'
            ? '🟡 En Observación'
            : '🔴 Riesgo de Sanción (Hasta 50 UIT)'}
        </span>
      </div>

      {/* 3 Controles Técnicos Obligatorios del Reglamento (D.S. 003-2013-JUS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Control 1: Cifrado en Tránsito */}
        <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
          isHyperscale || isTransportCompliant 
            ? 'bg-emerald-950/15 border-emerald-500/25' 
            : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">1. Canal Cifrado (Art. 39)</span>
            {isHyperscale || isTransportCompliant ? (
              <span className="text-[9px] font-bold text-emerald-400 font-mono">✓ CONFORME</span>
            ) : (
              <span className="text-[9px] font-bold text-amber-400 font-mono">⚠️ OBSERVADO</span>
            )}
          </div>
          <p className="text-xs font-semibold text-white">
            {isHyperscale || isTransportCompliant
              ? 'Túnel TLS 1.3 con cifrado forzado'
              : 'Requiere HSTS permanente'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Los datos de clientes en formularios viajan sin riesgo de intercepción en redes públicas.
          </p>
        </div>

        {/* Control 2: Cookies y Tokens */}
        <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
          isHyperscale || isSessionCompliant 
            ? 'bg-emerald-950/15 border-emerald-500/25' 
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">2. Cookies de Sesión (Art. 41)</span>
            {isHyperscale || isSessionCompliant ? (
              <span className="text-[9px] font-bold text-emerald-400 font-mono">✓ PROTEGIDAS</span>
            ) : (
              <span className="text-[9px] font-bold text-rose-400 font-mono">✗ EXPUESTAS</span>
            )}
          </div>
          <p className="text-xs font-semibold text-white">
            {isHyperscale || isSessionCompliant
              ? 'Directivas HttpOnly & Secure activas'
              : 'Faltan flags de seguridad en cookies'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Impide que scripts maliciosos roben la sesión o identidad de tus usuarios registrados.
          </p>
        </div>

        {/* Control 3: Aislamiento de Bases de Datos */}
        <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
          isHyperscale || isDataStorageCompliant 
            ? 'bg-emerald-950/15 border-emerald-500/25' 
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">3. Puertos de BD (Art. 43)</span>
            {isHyperscale || isDataStorageCompliant ? (
              <span className="text-[9px] font-bold text-emerald-400 font-mono">✓ BLINDADOS</span>
            ) : (
              <span className="text-[9px] font-bold text-rose-400 font-mono">🔴 CRÍTICO</span>
            )}
          </div>
          <p className="text-xs font-semibold text-white">
            {isHyperscale || isDataStorageCompliant
              ? 'Puertos MySQL/PostgreSQL cerrados'
              : 'Puertos de bases de datos abiertos'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Las bases de datos con información privada no están expuestas a escaneos de internet público.
          </p>
        </div>
      </div>

      {/* Alerta de Multas ANPDP */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="space-y-0.5">
          <span className="text-white font-bold block">
            ⚖️ Escala de Sanciones ANPDP (Perú):
          </span>
          <p className="text-[11px] text-neutral-400 leading-tight">
            Infracciones graves por falta de medidas de seguridad técnicas conllevan multas de <strong>5 a 50 UIT</strong> (S/ 26,750 a S/ 267,500 PEN).
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold shrink-0 transition-all cursor-pointer"
        >
          <span>Consultar Blindaje ANPDP</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
