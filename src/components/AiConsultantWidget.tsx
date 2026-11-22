'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Search,
  MessageSquare,
  Send,
  CheckCheck,
  Bot
} from 'lucide-react';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import { P } from '@/config/catalog';

// Orbe Gravitacional Vivo - Estilo Apple Intelligence / Cosmos Neuronal
function AppleCosmicOrb({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Resplandor nebulosa exterior pulsante */}
      <span className="absolute -inset-2 blur-md animate-cosmic-pulse pointer-events-none" />
      
      {/* Ondas orbitales gravitacionales */}
      <div className="absolute inset-0 border border-white/20 animate-cosmic-rotate pointer-events-none" />
      <div className="absolute -inset-1 border border-dashed border-[#c084fc]/30 animate-spin pointer-events-none [animation-duration:15s]" />

      {/* Orbe iridiscente central Apple Intelligence */}
      <div className="relative w-full h-full p-[1.5px]">
        <div className="w-full h-full bg-[#07090e] flex items-center justify-center relative overflow-hidden">
          {/* Núcleo estelar interno con rotación fluida */}
          <div className="absolute inset-0 animate-cosmic-rotate" />
          
          {/* Constelación o punto de singularidad de gravedad */}
          <span className="relative z-10 w-2 h-2 bg-white" />
          <span className="absolute z-10 w-2 h-2 bg-white" />
        </div>
      </div>
    </div>
  );
}

function NeuronalityAiAvatar({ size = 'w-9 h-9', iconSize }: { size?: string; iconSize?: string }) {
  return <AppleCosmicOrb className={size} />;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ctaType?: 'whatsapp' | 'scan' | 'plans' | 'donate';
}

interface Props {
  report?: AuditReportRecord | null;
}

export default function AiConsultantWidget({ report }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'scan' | 'plans'>('chat');
  const [scanUrl, setScanUrl] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensaje inicial contextual DEFENSA TI
  const initialGreeting = report?.url 
    ? `¡Hola! 👋 Soy el asesor de inteligencia artificial de DEFENSA TI. Veo que estás analizando ${report.url} con puntaje ${report.score ?? 0}/100 (Grado ${report.grade || 'F'}). ¿Tienes alguna duda sobre cómo desinfectarla o blindarla con WAF Cloudflare? ¡Pregúntame o coordinemos por WhatsApp!`
    : `¡Hola! 👋 Soy el asesor de inteligencia artificial de DEFENSA TI. Te ayudo a resolver dudas sobre la seguridad de tu página web (WordPress, WooCommerce, Shopify o Wix), desinfección de malware y blindaje con WAF Cloudflare. ¿En qué puedo orientarte hoy?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialGreeting,
    }
  ]);

  const exampleQuestions = [
    {
      label: '🛡️ ¿Por qué mi web sale "No segura"?',
      prompt: '¿Por qué mi página web sale como No segura o con advertencias de navegador?'
    },
    {
      label: `🚨 ¿Cómo funciona el Rescate de malware (${P.rescateCorporativo} - ${P.rescateTienda})?`,
      prompt: 'Mi web fue hackeada o suspendida por el hosting. ¿Cómo funciona el rescate forense y en cuánto tiempo lo entregan?'
    },
    {
      label: `🔒 ¿Qué incluye Blindaje + WAF (${P.blindajeWaf})?`,
      prompt: `¿Qué incluye exactamente el paquete unificado de Blindaje + WAF Cloudflare de ${P.blindajeWaf} y qué garantía tiene?`
    },
    {
      label: '🛍️ ¿Atienden tiendas Shopify, WooCommerce o Wix?',
      prompt: 'Tengo una tienda en Shopify / WooCommerce / Wix. ¿Cómo protegen mi pasarela y qué servicio aplica?'
    },
    {
      label: '📱 Hablar directo con Martín por WhatsApp',
      prompt: 'Deseo hablar directamente con Martín por WhatsApp para coordinar mi proyecto.'
    }
  ];

  const plans = [
    {
      name: 'Diagnóstico Gratuito',
      price: 'GRATIS',
      original: '',
      time: 'Inmediato (< 2h)',
      desc: 'Diagnóstico perimetral determinista sin credenciales, membrete formal con RUC y dictamen descargable.',
      link: 'https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20deseo%20consultar%20sobre%20el%20Diagn%C3%B3stico%20Gratuito%20de%20DEFENSA%20TI.'
    },
    {
      name: 'Rescate (Sitio Corporativo)',
      price: P.rescateCorporativo,
      original: '',
      time: '24 a 48h',
      desc: 'Desinfección forense completa de archivos y base de datos, desbloqueo de hosting y garantía formal de 30 días.',
      link: 'https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20deseo%20contratar%20el%20Rescate%20para%20Sitio%20Corporativo%20(S/%20380).'
    },
    {
      name: 'Rescate (WooCommerce / Tienda)',
      price: P.rescateTienda,
      original: '',
      time: '24 a 48h',
      desc: 'Desinfección forense integral para tiendas online con saneamiento de checkout y pasarelas de pago.',
      link: 'https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20deseo%20contratar%20el%20Rescate%20para%20WooCommerce%20(S/%20550).'
    },
    {
      name: 'Blindaje + WAF Cloudflare',
      price: P.blindajeWaf,
      original: '',
      time: '3 a 5 días',
      desc: 'Cabeceras estrictas canónicas más Cloudflare WAF perimetral activo anti-bots y mitigación DDoS.',
      link: 'https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20deseo%20contratar%20el%20Blindaje%20+%20WAF%20Cloudflare%20(S/%20450).'
    },
    {
      name: 'Mantenimiento Mensual',
      price: `Desde ${P.mantenimientoBasico} / mes`,
      original: '',
      time: 'Continuo 24/7',
      desc: `Vigilancia 24/7 sin permanencia forzosa: Básico (${P.mantenimientoBasico}/mes) o Tiendas Online con soporte prioritario (${P.mantenimientoTiendas}/mes).`,
      link: 'https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20deseo%20consultar%20sobre%20el%20Mantenimiento%20Mensual%20de%20DEFENSA%20TI.'
    }
  ];

  useEffect(() => {
    if (isOpen && view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, view]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    setInputMessage('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    // Detección de intención rápida de WhatsApp (Derivación con Martín)
    if (/whatsapp|hablar directo|martin/i.test(text)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '¡Con gusto! Te conecto directamente con Martín por WhatsApp al **+51 987 010 380** para coordinar tu requerimiento técnico o blindaje perimetral de inmediato.',
            ctaType: 'whatsapp'
          }
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // Detección de apoyo / contacto
    if (/donaci[oó]n|apoyar|caf[eé]/i.test(text)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `DEFENSA TI ofrece su **diagnóstico perimetral 100% gratuito**. Si deseas contratar nuestros servicios de **Rescate / Desinfección** (desde ${P.rescateCorporativo}) o **Blindaje + WAF Cloudflare** (${P.blindajeWaf}), puedes escribirnos directamente a nuestro WhatsApp oficial: **+51 987 010 380**.`,
          }
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-5),
          reportContext: report ? {
            url: report.url,
            score: report.score,
            grade: report.grade,
            missingHeaders: report.headers?.filter(h => !h.status).map(h => h.name) || [],
            sslValid: report.ssl?.valid,
            sslProtocol: report.ssl?.protocol
          } : undefined
        }),
      });

      const data = await response.json();
      const assistantReply = data.reply || 'Estoy a tu servicio para resolver cualquier duda sobre seguridad web o cotizar tu blindaje.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReply,
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Soy Neuronality AI. En DEFENSA TI auditamos y blindamos tu web contra ataques y bloqueos de pasarela. Puedes tocar el botón para coordinar directamente con Martín por WhatsApp al +51 987 010 380.',
          ctaType: 'whatsapp'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLaunchScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = scanUrl.trim();
    const clean = raw ? raw.replace(/^https?:\/\//i, '') : '';
    const finalTarget = clean ? (clean.startsWith('http') ? clean : `https://${clean}`) : '';

    setIsOpen(false);

    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('/defensati')) {
        if (finalTarget) {
          window.dispatchEvent(new CustomEvent('set-target-url', { detail: finalTarget }));
        }
        const inputEl = document.getElementById('url-scan-input');
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => inputEl.focus(), 350);
        }
        return;
      }
    }

    const targetQuery = finalTarget ? `?target=${encodeURIComponent(finalTarget)}` : '';
    router.push(`/defensati${targetQuery}#url-scan-input`);
  };

  return (
    <div className="fixed bottom-22 right-5 sm:bottom-24 sm:right-6 z-50 select-none font-sans">
      
      {/* 2. BOTÓN LAUNCHER FLOTANTE (ORBE CÓSMICO APPLE INTELLIGENCE + PUNTO VERDE EN ÓRBITA 360°) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setView('chat');
          }}
          className="relative group w-14 h-14 p-2 border border-white/20 hover:border-white/20 text-[#EDEDED] transition-all cursor-pointer flex items-center justify-center"
          aria-label={isOpen ? "Cerrar asistente" : "Abrir chat con Neuronality AI"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-neutral-300 relative z-10" />
          ) : (
            <AppleCosmicOrb className="w-8 h-8" />
          )}

          {/* Anillo de trayectoria orbital y punto verde orbitando 360 grados */}
          {!isOpen && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[60px] h-[60px] border border-white/10 pointer-events-none" />
              <span className="absolute w-2.5 h-2.5 bg-white/[0.03] border border-black z-20 animate-orbit-dot" />
            </div>
          )}
        </button>
      </div>

      {/* 3. MODAL DE CHAT & ASISTENTE COMPLETO */}
      {isOpen && (
        <div className="fixed sm:absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[420px] bg-[#0d111a]/98 border border-white/15 overflow-hidden flex flex-col transition-all z-50">
          
          {/* Cabecera del Chat */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <NeuronalityAiAvatar size="w-10 h-10" iconSize="w-5 h-5" />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#EDEDED] tracking-tight flex items-center gap-1.5 truncate">
                  <span>Neuronality AI</span>
                  <span className="px-1.5 py-0.2 bg-white/[0.03] text-[#bdbdbd] text-[9px] font-mono font-bold">
                    IA Oficial
                  </span>
                </h3>
                <p className="text-[10px] text-[#EDEDED] font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-white/[0.03]" />
                  <span>En línea • Asistente DEFENSA TI</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20estoy%20en%20DEFENSA%20TI%20y%20deseo%20hacerte%20una%20consulta%20directa."
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                title="Coordinar con Martín por WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-[#EDEDED] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegador de Pestañas Rápidas */}
          <div className="flex items-center gap-1 p-1.5 bg-[#080808] border-b border-white/5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setView('chat')}
              className={`flex-1 py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                view === 'chat'
                  ? 'bg-[#EDEDED] text-[#080808] '
                  : 'text-neutral-400 hover:text-[#EDEDED] hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Inteligente</span>
            </button>

            <button
              type="button"
              onClick={() => setView('plans')}
              className={`flex-1 py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                view === 'plans'
                  ? 'bg-[#EDEDED] text-[#080808] '
                  : 'text-neutral-400 hover:text-[#EDEDED] hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Planes & Blindaje</span>
            </button>

            <button
              type="button"
              onClick={() => setView('scan')}
              className={`flex-1 py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                view === 'scan'
                  ? 'bg-[#EDEDED] text-[#080808] '
                  : 'text-neutral-400 hover:text-[#EDEDED] hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Auditar Web</span>
            </button>
          </div>

          {/* CUERPO DEL CHAT / VISTAS */}
          <div className="p-4 space-y-3.5 max-h-[60vh] sm:max-h-[460px] overflow-y-auto">
            
            {/* VISTA 1: CHAT INTERACTIVO CON PREGUNTAS DE EJEMPLO */}
            {view === 'chat' && (
              <div className="space-y-3">
                
                {/* Mensajes */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <NeuronalityAiAvatar size="w-7 h-7" iconSize="w-3.5 h-3.5" />
                    )}

                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#EDEDED] text-[#080808] font-medium -none '
                          : 'bg-white/10 text-neutral-200 border border-white/10 -none '
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Botones de acción contextuales integrados */}
                      {msg.ctaType === 'whatsapp' && (
                        <div className="mt-2.5 pt-2 border-t border-white/10">
                          <a
                            href="https://wa.me/51987010380?text=Hola%20Mart%C3%ADn,%20estuve%20chateando%20con%20el%20asistente%20de%20DEFENSA%20TI%20y%20deseo%20hacerte%20una%20consulta."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-[#EDEDED] text-[11px] font-bold transition-all"
                          >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>Abrir WhatsApp (+51 987 010 380)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-center">
                    <NeuronalityAiAvatar size="w-7 h-7" iconSize="w-3.5 h-3.5" />
                    <div className="px-3.5 py-2.5 bg-white/5 border border-white/10 text-xs text-neutral-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#EDEDED]" />
                      <span className="w-1.5 h-1.5 bg-[#EDEDED] [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#EDEDED] [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                {/* Preguntas de ejemplo sugeridas (Estilo Chips interactivos) */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Preguntas frecuentes:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {exampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q.prompt)}
                        className="w-full text-left p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-neutral-300 hover:text-[#EDEDED] text-[11px] font-medium transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate pr-2">{q.label}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-[#bdbdbd] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* VISTA 2: ESCÁNER DIRECTO */}
            {view === 'scan' && (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed">
                  Ingresa tu dominio para transferirlo al escáner perimetral oficial (con declaración jurada bajo la Ley N° 30096):
                </div>

                <form onSubmit={handleLaunchScan} className="space-y-3">
                  <input
                    type="text"
                    placeholder="ej: mitienda.pe o miweb.com"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    className="w-full bg-[#080808] border border-white/15 px-4 py-2.5 text-xs text-[#EDEDED] placeholder-neutral-500 focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 text-[#EDEDED] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Auditar Web Ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[10.5px] text-neutral-400 text-center leading-relaxed font-sans">
                  🔒 Te dirigirá al escáner principal con tu dominio listo para marcar la declaración jurada conforme a ley.
                </p>
              </div>
            )}

            {/* VISTA 3: PLANES DE BLINDAJE */}
            {view === 'plans' && (
              <div className="space-y-3 py-1">
                <div className="text-xs text-neutral-300">
                  Precios transparentes para Perú (pagos únicos sin suscripciones):
                </div>

                <div className="space-y-2">
                  {plans.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/[0.03] border border-white/10 space-y-1.5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#EDEDED]">{p.name}</span>
                        <div className="flex items-baseline gap-1.5">
                          {p.original && (
                            <span className="text-[10px] text-neutral-500 line-through">
                              {p.original}
                            </span>
                          )}
                          <span className="text-xs font-mono font-black text-[#EDEDED]">
                            {p.price}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        {p.desc}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-neutral-400 font-mono">Plazo: {p.time}</span>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#bdbdbd] hover:underline flex items-center gap-1"
                        >
                          <span>Consultar &rarr;</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* INPUT BARRA DE ESCRITURA (EN VISTA CHAT) */}
          {view === 'chat' && (
            <div className="p-3 bg-[#080808] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Pregúntale a Neuronality AI..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-[#EDEDED] placeholder-neutral-500 focus:outline-none focus:border-white/20"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-[#EDEDED] text-[#080808] hover:bg-[#EDEDED] hover:text-[#080808] disabled:opacity-40 transition-all cursor-pointer shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Pie del Widget */}
          <div className="py-2 px-4 bg-[#080808] border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Neuronal Gravity &bull; RUC 10704877850</span>
            <span className="text-emerald-400 font-sans">🟢 En vivo</span>
          </div>

        </div>
      )}

    </div>
  );
}
