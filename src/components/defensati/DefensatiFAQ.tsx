'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert, ShieldCheck, Lock, RotateCcw, Server, FileText, CheckCircle2, Clock } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQS: FAQItem[] = [
  {
    id: 'tiempo-entrega',
    question: '¿Cuáles son los plazos de entrega y el horario de atención técnica?',
    answer: 'Atendemos consultas y soporte de Lunes a Sábado de 9:00 a 20:00 (Hora Perú, UTC-5). Los plazos de ejecución técnica son:\n\n• Diagnóstico gratuito preliminar: menos de 2 horas tras indicar tu dominio.\n• Pack Todo Incluido (Rescate + Blindaje WAF + 3 Meses Monitoreo): desinfección forense en 24 a 48 horas hábiles, y despliegue de blindaje perimetral y WAF en 3 a 5 días hábiles.\n• Rescate de Emergencia Puntual: habitual de 24 a 48 horas hábiles tras recibir los accesos (hasta 2 a 4 días hábiles en desinfecciones complejas de múltiples bases de datos).\n• Monitoreo mensual: activación en menos de 24 horas con vigilancia automatizada 24/7 y aviso inmediato a WhatsApp.',
    icon: Clock,
  },
  {
    id: 'shopify-wix-compatibilidad',
    question: '¿Atienden tiendas en Shopify o sitios en Wix? ¿Cómo funciona la seguridad y qué precios tienen?',
    answer: '¡Sí, con total cobertura técnica! Atendemos tiendas en Shopify, sitios en Wix, WordPress/WooCommerce y webs a medida. La diferencia radica en su arquitectura:\n\n• En WordPress (servidor propio): Existen virus de archivos PHP y malware en base de datos; para ellos aplica la desinfección forense completa.\n• En Shopify y Wix (SaaS en la nube): La infraestructura la gestiona la plataforma, por lo que no existen virus de servidor. Sin embargo, enfrentan riesgos reales: scripts espías inyectados en temas Liquid o código Wix (robo de tarjetas / Magecart), aplicaciones rogue y phishing por correo sin SPF/DMARC.\n\nPara todas las plataformas aplicamos precios transparentes empaquetados:\n1. Diagnóstico gratuito: S/ 0 (audita certificados SSL, cabeceras HTTP y DNS).\n2. Pack Todo Incluido: Rescate + Blindaje WAF Cloudflare + 3 meses de monitoreo (S/ 600 para Web Corporativa | S/ 850 para E-commerce / Tienda Online con saneamiento de plantillas/checkout, SPF/DKIM/DMARC anti-suplantación y WAF anti-bots).\n3. Rescate de Emergencia Puntual: S/ 450 – S/ 650 por emergencia (cuando solo se requiere intervención urgente de saneamiento).\n4. Monitoreo mensual recurrente: S/ 49 o S/ 99 / mes tras concluir los 3 meses incluidos.',
    icon: ShieldCheck,
  },
  {
    id: 'privacidad-datos',
    question: '¿Tienen acceso a mis datos bancarios o información confidencial de mis clientes?',
    answer: 'Nunca. La intervención técnica se ejecuta estrictamente a nivel de archivos de servidor (cPanel, SSH, SFTP) y base de datos técnica del CMS. Jamás solicitamos ni manipulamos pasarelas de pago ni datos de tarjetas de tus clientes. Sin intermediarios ni juniors: yo mismo reviso tu web personalmente con total reserva y ética profesional.',
    icon: Lock,
  },
  {
    id: 'garantia-30-dias',
    question: '¿Cómo funciona la garantía de 30 días en el servicio de limpieza?',
    answer: 'Si dentro de los 30 días calendario posteriores a la desinfección tu web vuelve a presentar la misma infección o puerta trasera remediada, nos encargamos de revisarla y desinfectarla nuevamente sin costo adicional.',
    icon: RotateCcw,
  },
  {
    id: 'por-que-hosting-suspende',
    question: '¿Por qué mi proveedor de hosting suspendió mi web y no la repara por mí?',
    answer: 'Los proveedores de hosting brindan espacio en servidores compartidos o VPS, pero bajo el principio de responsabilidad compartida de sus contratos (ToS/AUP), el mantenimiento y la seguridad del CMS, plugins y código corresponden al cliente. Cuando un sitio envía spam o aloja malware, el hosting lo suspende de forma preventiva para proteger la reputación de la IP del servidor. Nosotros desinfectamos el código y gestionamos el desbloqueo para que el hosting reactive tu cuenta.',
    icon: Server,
  },
  {
    id: 'comprobante-fiscal',
    question: '¿Emites comprobante de pago legal para mi empresa o negocio?',
    answer: 'Sí. Emitimos Factura o Boleta electrónica formal conforme a ley peruana bajo RUC 10704877850 a nombre de Martín Castillo, facilitando la deducción contable para personas naturales con negocio o empresas.',
    icon: FileText,
  },
  {
    id: 'permanencia-monitoreo',
    question: '¿Existe algún contrato de permanencia forzosa en los planes de monitoreo?',
    answer: 'Cero permanencia ni ataduras. El monitoreo preventivo opera bajo modalidad de suscripción mensual prepagada. Puedes solicitar la pausa o cancelación en cualquier momento con un mensaje directo a WhatsApp, sin penalizaciones.',
    icon: ShieldAlert,
  },
];

export default function DefensatiFAQ() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full max-w-5xl mx-auto space-y-8 scroll-mt-24 text-left">
      {/* Cabecera Estilo Apple Pro */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/12 text-[#2997ff] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>DUDAS RESUELTAS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight">
          Preguntas frecuentes
        </h2>
        <p className="text-sm sm:text-base text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed">
          Todo lo que necesitas saber sobre nuestros procesos de desinfección, tiempos, garantías y facturación formal.
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;
          return (
            <div
              key={faq.id}
              className={`rounded-[20px] sm:rounded-[24px] transition-all border ${
                isOpen
                  ? 'bg-[#161618]/90 border-[#0071e3]/50 shadow-[0_10px_30px_rgba(0,113,227,0.15)]'
                  : 'bg-[#161618]/60 border-white/10 hover:border-white/20 hover:bg-[#161618]/80'
              } backdrop-blur-2xl overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      isOpen
                        ? 'bg-[#0071e3]/20 border-[#0071e3]/40 text-[#38bdf8]'
                        : 'bg-white/[0.04] border-white/10 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#0071e3]/20 text-[#38bdf8]' : 'text-neutral-400 bg-white/[0.03]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 animate-in fade-in duration-200">
                  <div className="pl-12 border-l border-white/10 ml-4">
                    <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
