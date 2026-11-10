'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert, Lock, RotateCcw, Server, FileText, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQS: FAQItem[] = [
  {
    id: 'tiempo-entrega',
    question: '¿En cuánto tiempo queda limpia y funcionando mi web?',
    answer: 'El diagnóstico inicial se entrega en menos de 2 horas tras recibir los accesos. Las limpiezas de malware y desinfección de WordPress se completan habitualmente entre 24 y 48 horas hábiles, dependiendo del volumen de archivos infectados y la complejidad de la intrusión.',
    icon: CheckCircle2,
  },
  {
    id: 'privacidad-datos',
    question: '¿Tienen acceso a mis datos bancarios o información confidencial de mis clientes?',
    answer: 'Nunca. La intervención técnica se ejecuta estrictamente a nivel de archivos de servidor (cPanel, SSH, SFTP) y base de datos técnica del CMS. Jamás solicitamos ni manipulamos pasarelas de pago ni datos sensibles de tarjetas. Si tu empresa lo requiere, firmamos un Acuerdo de Confidencialidad (NDA) previo.',
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
    answer: 'Los proveedores de hosting brindan espacio en servidores compartidos o VPS, pero sus contratos estipulan que el mantenimiento del CMS y código es 100% responsabilidad del cliente. Cuando un sitio envía spam o aloja malware, el hosting lo suspende para evitar que infecte a otros clientes del servidor. Nosotros desinfectamos el código para que el hosting reactive tu cuenta de inmediato.',
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>DUDAS RESUELTAS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Preguntas frecuentes
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
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
              className={`rounded-2xl transition-all border ${
                isOpen
                  ? 'bg-[#101622]/90 border-[#38bdf8]/40 shadow-[0_10px_30px_rgba(0,113,227,0.12)]'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
              } backdrop-blur-xl overflow-hidden`}
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
                    <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
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
