'use client';

import React, { useState } from 'react';
import SectionHead from './SectionHead';
import { P } from '@/config/catalog';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'tiempo-entrega',
    question: '¿Cuáles son los plazos de entrega y el horario de atención técnica?',
    answer: 'Atendemos consultas y soporte de Lunes a Sábado de 9:00 a 20:00 (Hora Perú, UTC-5). Los plazos de ejecución técnica son:\n\n• Diagnóstico gratuito preliminar: menos de 2 horas tras indicar tu dominio.\n• Rescate / Limpieza de malware: habitual de 24 a 48 horas hábiles tras recibir los accesos (casos críticos < 24h).\n• Blindaje + WAF Cloudflare (Paquete Unificado): de 3 a 5 días hábiles (incluye calibración fina y meta Grado A).\n• Mantenimiento mensual: activación en menos de 24 horas con vigilancia ininterrumpida 24/7 y aviso inmediato a WhatsApp.',
  },
  {
    id: 'shopify-wix-compatibilidad',
    question: '¿Atienden tiendas en Shopify o sitios en Wix? ¿Cómo funciona la seguridad y qué precios tienen?',
    answer: `¡Sí, con total cobertura técnica! Atendemos tiendas en Shopify, sitios en Wix, WordPress/WooCommerce y webs a medida. La diferencia radica en su arquitectura:\n\n• En WordPress (servidor propio): Existen virus de archivos PHP y malware en base de datos; para ellos aplica la desinfección forense completa.\n• En Shopify y Wix (SaaS en la nube): La infraestructura la gestiona la plataforma, por lo que no existen virus de servidor. Sin embargo, enfrentan riesgos reales: scripts espías inyectados en temas Liquid o código Wix (robo de tarjetas / Magecart), aplicaciones rogue y phishing por correo sin SPF/DMARC.\n\nPara todas las plataformas aplicamos precios transparentes y unificados:\n1. Diagnóstico gratuito: S/ 0 (audita certificados SSL, cabeceras HTTP y DNS).\n2. Rescate / Limpieza de malware: ${P.rescateCorporativo} (Sitio Corporativo) y ${P.rescateTienda} (WooCommerce / Tienda Online con saneamiento de plantillas y carritos).\n3. Blindaje + WAF Cloudflare (Paquete Unificado): ${P.blindajeWaf} (cabeceras canónicas, SPF/DKIM/DMARC anti-suplantación y Cloudflare WAF perimetral anti-bots).\n4. Mantenimiento mensual: ${P.mantenimientoBasico}/mes (Básico) y ${P.mantenimientoTiendas}/mes (Tiendas Online con soporte prioritario).`,
  },
  {
    id: 'privacidad-datos',
    question: '¿Tienen acceso a mis datos bancarios o información confidencial de mis clientes?',
    answer: 'Nunca. La intervención técnica se ejecuta estrictamente a nivel de archivos de servidor (cPanel, SSH, SFTP) y base de datos técnica del CMS. Jamás solicitamos ni manipulamos pasarelas de pago ni datos de tarjetas de tus clientes. Sin intermediarios ni juniors: yo mismo reviso tu web personalmente con total reserva y ética profesional.',
  },
  {
    id: 'garantia-30-dias',
    question: '¿Cómo funciona la garantía de 30 días en el servicio de limpieza?',
    answer: 'Si dentro de los 30 días calendario posteriores a la desinfección tu web vuelve a presentar la misma infección o puerta trasera remediada, nos encargamos de revisarla y desinfectarla nuevamente sin costo adicional.',
  },
  {
    id: 'por-que-hosting-suspende',
    question: '¿Por qué mi proveedor de hosting suspendió mi web y no la repara por mí?',
    answer: 'Los proveedores de hosting brindan espacio en servidores compartidos o VPS, pero bajo el principio de responsabilidad compartida de sus contratos (ToS/AUP), el mantenimiento y la seguridad del CMS, plugins y código corresponden al cliente. Cuando un sitio envía spam o aloja malware, el hosting lo suspende de forma preventiva para proteger la reputación de la IP del servidor. Nosotros desinfectamos el código y gestionamos el desbloqueo para que el hosting reactive tu cuenta.',
  },
  {
    id: 'comprobante-fiscal',
    question: '¿Emites comprobante de pago legal para mi empresa o negocio?',
    answer: 'Sí. Emitimos Factura o Boleta electrónica formal conforme a ley peruana bajo RUC 10704877850 a nombre de Martín Castillo, facilitando la deducción contable para personas naturales con negocio o empresas.',
  },
  {
    id: 'permanencia-monitoreo',
    question: '¿Existe algún contrato de permanencia forzosa en los planes de monitoreo?',
    answer: 'Cero permanencia ni ataduras. El monitoreo preventivo opera bajo modalidad de suscripción mensual prepagada. Puedes solicitar la pausa o cancelación en cualquier momento con un mensaje directo a WhatsApp, sin penalizaciones.',
  },
];

export default function DefensatiFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="scroll-mt-24 space-y-12">
      <SectionHead index="08" label="FAQ" title={<>Preguntas<br /><span className="text-[#8b97a2]">frecuentes.</span></>} />
      <div className="grid grid-cols-12">
        <div className="col-span-12 lg:col-span-9 lg:col-start-4 border-t ed-line">
          {FAQS.map((faq, i) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`border-b ed-line backdrop-blur-sm transition-colors duration-150 ${isOpen ? 'bg-[#0a0c0f]/85' : 'bg-[#0a0c0f]/40 hover:bg-[#0a0c0f]/70'}`}>
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-3 sm:px-5 grid grid-cols-12 items-center gap-4 text-left group cursor-pointer select-none touch-manipulation focus-visible:outline-none"
                >
                  <span className="col-span-2 sm:col-span-1 hud-label font-mono text-[#5d6872]">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`col-span-9 sm:col-span-10 text-lg sm:text-xl font-light tracking-tight leading-snug transition-colors duration-200 ${isOpen ? 'text-[#e8edf1]' : 'text-[#8b97a2] group-hover:text-[#e8edf1]'}`}>
                    {faq.question}
                  </span>
                  <span
                    aria-hidden
                    className={`col-span-1 justify-self-end w-9 h-9 grid place-items-center border font-mono text-lg transition-all duration-200 ${
                      isOpen ? 'border-[#cfe3ee] text-[#0a0c0f] bg-[#cfe3ee] rotate-45' : 'border-white/15 text-[#cfe3ee] group-hover:border-[#cfe3ee]'
                    }`}
                  >
                    +
                  </span>
                </button>
                {/* Expansión elástica sin saltos mediante CSS Grid (Emil Kowalski / animate) */}
                <div
                  className={`grid transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{ gridTemplateRows: isOpen ? 'minmax(0, 1fr)' : 'minmax(0, 0fr)' }}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 pb-8 pt-1 px-3 sm:px-5">
                      <p className="col-span-12 sm:col-span-10 sm:col-start-2 text-sm sm:text-base text-[#8b97a2] leading-relaxed whitespace-pre-line max-w-[70ch]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}