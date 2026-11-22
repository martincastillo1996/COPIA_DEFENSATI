'use client';

import React from 'react';
import { Scale, ExternalLink } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { P } from '@/config/catalog';

interface AnpdpComplianceCardProps {
  domain: string;
  hasValidSsl?: boolean;
  hasDowngradeRisk?: boolean;
  hasOpenAdminPorts?: boolean;
  portsScanned?: boolean;
  cookiesSecure?: boolean;
  isHyperscale?: boolean;
}

export default function AnpdpComplianceCard({
  domain,
  hasValidSsl = true,
  hasDowngradeRisk = false,
  hasOpenAdminPorts = false,
  portsScanned = false,
  cookiesSecure = true,
  isHyperscale = false,
}: AnpdpComplianceCardProps) {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  
  // Evaluación legal bajo Ley N° 29733 (Perú)
  const isTransportCompliant = hasValidSsl && !hasDowngradeRisk;
  const isDataStorageCompliant = portsScanned && !hasOpenAdminPorts;
  const isSessionCompliant = cookiesSecure;

  const totalPassed = [isTransportCompliant, isDataStorageCompliant, isSessionCompliant].filter(Boolean).length;
  // Lo no evaluado no aprueba ni cuenta como fallo: impide el "óptimo"
  const failed = 3 - totalPassed - (portsScanned ? 0 : 1);
  const complianceStatus = totalPassed === 3 ? 'optimo' : failed <= 1 ? 'observacion' : 'critico';

  return (
    <div className="p-6 sm:p-7 bg-[#12141c] border border-white/10 space-y-5 text-left">
      {/* Header Legal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/[0.03] border border-white/10 text-[#EDEDED] flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EDEDED] tracking-tight flex items-center gap-2">
              <span>Auditoría Legal: Ley N° 29733 de Protección de Datos Personales</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluación de directivas técnicas exigidas por la Autoridad Nacional de Protección de Datos Personales (ANPDP - MinJus).
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold w-fit ${
          complianceStatus === 'optimo'
            ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10'
            : complianceStatus === 'observacion'
            ? 'bg-white/[0.03] text-[#EDEDED] border border-white/10'
            : 'bg-white/[0.03] text-[#ff4d4d] border border-white/10'
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
        <div className={`p-3.5 border space-y-1.5 ${
          isTransportCompliant 
            ? 'bg-white/[0.03] border-white/10' 
            : 'bg-white/[0.03] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">1. Canal Cifrado (Art. 39)</span>
            {isTransportCompliant ? (
              <span className="text-[9px] font-bold text-[#EDEDED] font-mono">✓ CONFORME</span>
            ) : (
              <span className="text-[9px] font-bold text-[#EDEDED] font-mono">⚠️ OBSERVADO</span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#EDEDED]">
            {isTransportCompliant
              ? 'Túnel TLS 1.3 con cifrado forzado'
              : 'Requiere HSTS permanente'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Los datos de clientes en formularios viajan sin riesgo de intercepción en redes públicas.
          </p>
        </div>

        {/* Control 2: Cookies y Tokens */}
        <div className={`p-3.5 border space-y-1.5 ${
          isSessionCompliant 
            ? 'bg-white/[0.03] border-white/10' 
            : 'bg-white/[0.03] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">2. Cookies de Sesión (Art. 41)</span>
            {isSessionCompliant ? (
              <span className="text-[9px] font-bold text-[#EDEDED] font-mono">✓ PROTEGIDAS</span>
            ) : (
              <span className="text-[9px] font-bold text-[#ff4d4d] font-mono">✗ EXPUESTAS</span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#EDEDED]">
            {isSessionCompliant
              ? 'Directivas HttpOnly & Secure activas'
              : 'Faltan flags de seguridad en cookies'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Impide que scripts maliciosos roben la sesión o identidad de tus usuarios registrados.
          </p>
        </div>

        {/* Control 3: Aislamiento de Bases de Datos */}
        <div className={`p-3.5 border space-y-1.5 ${
          isDataStorageCompliant 
            ? 'bg-white/[0.03] border-white/10' 
            : 'bg-white/[0.03] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">3. Puertos de BD (Art. 43)</span>
            {!portsScanned ? (
              <span className="text-[9px] font-bold text-neutral-400 font-mono">NO EVALUADO</span>
            ) : isDataStorageCompliant ? (
              <span className="text-[9px] font-bold text-[#EDEDED] font-mono">✓ BLINDADOS</span>
            ) : (
              <span className="text-[9px] font-bold text-[#ff4d4d] font-mono">🔴 CRÍTICO</span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#EDEDED]">
            {!portsScanned
              ? 'Puertos de bases de datos sin revisar'
              : isDataStorageCompliant
              ? 'Puertos MySQL/PostgreSQL cerrados'
              : 'Puertos de bases de datos abiertos'}
          </p>
          <p className="text-[11px] text-neutral-300 leading-tight">
            Las bases de datos con información privada no deben aceptar conexiones desde internet público.
          </p>
        </div>
      </div>

      {/* Alerta de Multas ANPDP */}
      <div className="p-3.5 bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="space-y-0.5">
          <span className="text-white font-bold block">
            ⚖️ Escala de Sanciones ANPDP (Perú):
          </span>
          <p className="text-[11px] text-neutral-400 leading-tight">
            Infracciones graves por falta de medidas de seguridad técnicas conllevan multas de <strong>5 a 50 UIT</strong> (S/ 26,750 a S/ 267,500 PEN).
          </p>
        </div>

        <a
          href={DEFENSATI_WHATSAPP_MESSAGES.upsellLegalAnpdp(cleanDomain, 'basico')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.03] border border-white/10 text-[#EDEDED] text-xs font-bold shrink-0 transition-all cursor-pointer"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
          <span>Adecuar a Ley 29733 (desde {P.legalBasica})</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
