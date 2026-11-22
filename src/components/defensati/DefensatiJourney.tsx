'use client';

import React, { useState } from 'react';
import { P } from '@/config/catalog';
import SectionHead from './SectionHead';

interface VectorDetail {
  id: string;
  name: string;
  tagline: string;
  rating: number; // 1-5
  status: 'OPTIMO' | 'RIESGO' | 'CRITICO';
  metric: string;
  metricLabel: string;
  codeSnippet: string;
  codeLang: string;
  whyItMatters: string;
  attackVector: string;
  solutionPrice: string;
}

const VECTORS: VectorDetail[] = [
  {
    id: 'anti-phishing',
    name: 'Vector 1: Anti-Phishing & Reputación de Dominio',
    tagline: 'Protege tu marca contra la suplantación de identidad en correos transaccionales.',
    rating: 4,
    status: 'OPTIMO',
    metric: 'DMARC p=reject',
    metricLabel: 'Política de rechazo estricto',
    codeLang: 'DNS (TXT)',
    codeSnippet: `v=DMARC1; p=reject; sp=reject; pct=100;
rua=mailto:dmarc-reports@tudominio.pe;
ruf=mailto:dmarc-forensics@tudominio.pe;
adkim=s; aspf=s;`,
    whyItMatters: 'Sin una política DMARC en modo reject o quarantine, cualquier ciberdelincuente puede enviar correos fraudulentos fingiendo ser tu empresa para estafar a tus clientes con falsas órdenes de pago.',
    attackVector: 'Suplantación directa de correos corporativos (CEO Fraud / Business Email Compromise).',
    solutionPrice: P.correoSpfDkimDmarc,
  },
  {
    id: 'web-encryption',
    name: 'Vector 2: Cifrado Web & Transporte Seguro',
    tagline: 'Cifrado de extremo a extremo con TLS 1.3 y precarga de cabeceras HSTS.',
    rating: 5,
    status: 'OPTIMO',
    metric: 'TLS 1.3 / HSTS',
    metricLabel: 'Canal criptográfico forzado',
    codeLang: 'HTTP Headers',
    codeSnippet: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin`,
    whyItMatters: 'La cabecera HSTS obliga a los navegadores a rechazar cualquier intento de degradación a HTTP plano (SSL Stripping), protegiendo contraseñas y tarjetas de crédito en redes Wi-Fi públicas.',
    attackVector: 'Man-in-the-Middle (MitM) e inyección de scripts espías tipo Magecart en pasarelas de pago.',
    solutionPrice: P.blindajeWaf,
  },
  {
    id: 'network-exposure',
    name: 'Vector 3: Exposición Perimetral & Defensa WAF',
    tagline: 'Aislamiento estricto de puertos internos y mitigación de ataques DDoS y bots.',
    rating: 4,
    status: 'OPTIMO',
    metric: 'Puertos 80/443',
    metricLabel: 'Servicios internos aislados',
    codeLang: 'Firewall / Nginx',
    codeSnippet: `# Bloqueo estricto Anti-SSRF (RFC 1918)
# Rechazo de rangos 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
# Bloqueo de metadatos de nube 169.254.169.254
iptables -A INPUT -p tcp --dport 3306 -j DROP # MySQL cerrado
iptables -A INPUT -p tcp --dport 6379 -j DROP # Redis cerrado
iptables -A INPUT -p tcp --dport 22 -s 190.235.0.0/16 -j ACCEPT`,
    whyItMatters: 'Si tu base de datos o consola de administración tiene puertos abiertos al internet público, los atacantes usarán ataques de fuerza bruta para vulnerar tus credenciales en cuestión de horas.',
    attackVector: 'Ataques de fuerza bruta, explotación de fallas 0-day en bases de datos y ataques SSRF.',
    solutionPrice: P.blindajeWaf,
  },
];

export default function DefensatiJourney() {
  const [activeVector, setActiveVector] = useState<string>('anti-phishing');
  const current = VECTORS.find((v) => v.id === activeVector) || VECTORS[0];

  return (
    <section id="vectores-resiliencia" className="scroll-mt-24 space-y-12">
      <SectionHead
        index="01"
        label="Vectores"
        title={<>Tres frentes.<br /><span className="text-[#7d8891]">Una superficie.</span></>}
        lead="Analizamos la cara exterior de tu infraestructura sin tocar bases de datos ni pedir contraseñas."
      />

      <div className="grid grid-cols-12 lg:gap-x-8">
        <div className="col-span-12 lg:col-span-3 flex lg:flex-col border-t ed-line">
          {VECTORS.map((vec, i) => {
            const isActive = vec.id === activeVector;
            return (
              <button
                key={vec.id}
                type="button"
                onClick={() => setActiveVector(vec.id)}
                className={`flex-1 lg:flex-none text-left py-4 pr-4 border-b ed-line transition-colors ${isActive ? 'text-[#e8edf1]' : 'text-[#4a535b] hover:text-[#7d8891]'}`}
              >
                <span className="font-mono text-[11px] tracking-[0.16em]">0{i + 1}</span>
                <span className="block mt-1 text-sm sm:text-base font-light">{vec.metric}</span>
              </button>
            );
          })}
        </div>

        <div className="col-span-12 lg:col-span-9 grid grid-cols-12 gap-y-8 lg:gap-x-8 border-t ed-line pt-6 mt-6 lg:mt-0">
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-[#e8edf1] leading-tight">
              {current.name.replace(/^Vector \d: /, '')}
            </h3>
            <p className="text-sm text-[#7d8891] leading-relaxed">{current.whyItMatters}</p>
            <div className="border-l border-[#cfe3ee]/40 pl-4">
              <p className="hud-label">Vector de ataque</p>
              <p className="mt-1.5 text-sm text-[#e8edf1] leading-relaxed">{current.attackVector}</p>
            </div>
            <p className="hud-label">
              Solución · <span className="text-[#e8edf1]">{current.solutionPrice}</span> pago único
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 hud-frame bg-[#0a0c0f]/70 self-start">
            <div className="flex justify-between px-4 py-2.5 border-b ed-line">
              <span className="hud-label">{current.codeLang}</span>
              <span className="hud-label !text-[#4a535b]">canónico</span>
            </div>
            <pre className="p-4 text-xs font-mono text-[#cfe3ee] overflow-x-auto leading-relaxed"><code>{current.codeSnippet}</code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}
