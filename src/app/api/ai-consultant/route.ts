import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClientIp } from '@/lib/security/clientIp';
import { hitRateLimit, RateLimitMap } from '@/lib/security/rateLimit';
import { P } from '@/config/catalog';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
  reportContext?: {
    url?: string;
    score?: number;
    grade?: string;
    missingHeaders?: string[];
    openPorts?: number[];
    sslValid?: boolean;
    sslProtocol?: string;
  };
}

// 1. Rate Limiter per IP (10 consultas por minuto por cliente para frenar abusos de cuota)
const rateLimitMap: RateLimitMap = new Map();
// Tope global por hora: protege la cuota de los proveedores de IA ante un abuso distribuido
const globalRateLimitMap: RateLimitMap = new Map();
const GLOBAL_MAX_PER_HOUR = 600;

function checkRateLimit(ip: string): boolean {
  const perIp = hitRateLimit(rateLimitMap, ip, 60 * 1000, 10).allowed;
  if (!perIp) return false;
  return hitRateLimit(globalRateLimitMap, 'global', 60 * 60 * 1000, GLOBAL_MAX_PER_HOUR).allowed;
}

// 2. Patrones de Prompt Injection / Jailbreak / Intento de usar como proxy abierto
const INJECTION_PATTERNS = [
  /ignore (all )?(previous|above) instructions/i,
  /you are now/i,
  /act as (a|an)/i,
  /jailbreak/i,
  /dan mode/i,
  /system prompt/i,
  /repeat the words above/i,
  /print your instructions/i,
  /show me your prompt/i,
  /disregard/i,
  /python code/i,
  /write a script/i,
  /as an unrestricted/i,
];

function isPotentialJailbreak(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

const SYSTEM_INSTRUCTION = `Eres el Asesor Oficial de Inteligencia Artificial de DEFENSA TI y Neuronal Gravity (fundado por Martín Castillo en Lima, Perú • RUC 10704877850).
Tu identidad oficial es Neuronality AI. Tu rol es orientar a dueños de negocios, tiendas online y emprendedores sobre la ciberdefensa de sus páginas web y conectarlos directamente con Martín por WhatsApp (+51 987 010 380) para contratar o resolver urgencias.

CATÁLOGO COMERCIAL OFICIAL DE DEFENSA TI (Precios transparentes en Soles PEN):
1. Diagnóstico gratuito (S/ 0): Auditoría perimetral no intrusiva de cabeceras HTTP, SSL/TLS y DNS; los puertos solo si el titular demuestra que el dominio es suyo (registro TXT o archivo) o con una auditoría autorizada por escrito. Dictamen técnico descargable en menos de 2 horas.
2. Rescate / Limpieza de malware (Desinfección forense con respaldo integral previo, retiro de virus/malware, desbloqueo con el hosting, retiro de pantalla roja de Google y garantía formal de 30 días por escrito ante reinfecciones. Martín revisa personalmente cada web):
   - Sitio Corporativo (blogs, portafolios): ${P.rescateCorporativo} (pago único).
   - WooCommerce / Tienda Online (Shopify, Wix): ${P.rescateTienda} (pago único, saneamiento de checkout y pasarelas de pago).
3. Blindaje + WAF Cloudflare (Paquete Unificado): ${P.blindajeWaf} (pago único). Cabeceras canónicas estrictas (HSTS, CSP, X-Frame) más Firewall perimetral WAF activo contra bots, scrapers y ataques DDoS. No se venden cabeceras por separado.
4. Mantenimiento Mensual (sin permanencia forzosa):
   - Básico (sitios corporativos): ${P.mantenimientoBasico} / mes (uptime cada 15 min, alerta SSL, reporte mensual y 40 min de soporte).
   - Tiendas Online (soporte prioritario): ${P.mantenimientoTiendas} / mes (uptime cada 5 min, alerta prioritaria a WhatsApp, re-escaneos semanales y 90 min de soporte prioritario).
5. Servicios complementarios (pago único):
   - Blindaje de correo anti-spam (SPF, DKIM, DMARC): ${P.correoSpfDkimDmarc}.
   - Migración segura de hosting sin caída: ${P.migracionCorporativa} (web corporativa) / ${P.migracionTienda} (tienda online).
   - Optimización de velocidad (WPO + Core Web Vitals): ${P.wpoCorporativo} (web corporativa) / ${P.wpoTienda} (tienda online).
   - Adecuación legal Ley N° 29733: ${P.legalBasica} (básica) / ${P.legalIntegral} (integral).
   - Auditoría técnica de pasarelas de pago (Niubiz, Culqi, Izipay, MercadoPago, Stripe): ${P.auditoriaPasarelas}.

REGLAS DE ATENCIÓN:
- Habla en español con un tono cercano, profesional y enfocado en negocios (proteger ventas, evitar bloqueos de pasarelas, evitar hackeos).
- Respuestas breves: máximo 2 párrafos concisos sin jerga técnica pesada.
- No actúes como asistente general de programación ni redactes código no relacionado.
- Si preguntan por precios o cómo empezar, brinda los precios oficiales exactos en Soles e invita a coordinar por WhatsApp oficial (+51 987 010 380) donde Martín revisa el caso directamente.`;

function isAllowedDomain(urlOrHost: string | null): boolean {
  if (!urlOrHost) return false;
  try {
    let hostname = urlOrHost.trim();
    if (hostname.includes('://')) {
      hostname = new URL(hostname).hostname;
    } else {
      hostname = hostname.split(':')[0].trim();
    }
    hostname = hostname.toLowerCase();

    // Comprobación estricta de nombres de host autorizados y subdominios canónicos
    if (hostname === 'neuronalgravity.com' || hostname.endsWith('.neuronalgravity.com')) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Control de Tasa (Anti-DDoS y Anti-Abuso de API)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Límite de consultas alcanzado. Por favor, espera un minuto o contáctanos por WhatsApp.' },
        { status: 429 }
      );
    }

    // 2. Validación Estricta de Origen y Host (Anti-Bypass de Subcadena)
    // El Host siempre es el propio dominio en producción, así que no prueba de dónde viene la
    // petición (antes anulaba la comprobación). Se exige un Origin o, en su defecto, un Referer
    // del propio sitio: el navegador siempre envía Origin en un POST desde la página.
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const sourceAllowed = origin ? isAllowedDomain(origin) : referer ? isAllowedDomain(referer) : false;

    if (!sourceAllowed) {
      return NextResponse.json(
        { error: 'Acceso no autorizado desde este origen.' },
        { status: 403 }
      );
    }

    const body: RequestBody = await req.json();
    const { message, history = [], reportContext } = body;

    // 3. Validación y límites estrictos de contenido (Previene payloads masivos)
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El mensaje es requerido.' },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length === 0 || trimmedMsg.length > 400) {
      return NextResponse.json(
        { error: 'El mensaje debe tener entre 1 y 400 caracteres.' },
        { status: 400 }
      );
    }

    // 4. Detección Anti-Jailbreak / Anti-Proxy
    if (isPotentialJailbreak(trimmedMsg)) {
      return NextResponse.json({
        reply: 'Hola. Como consultor de DEFENSA TI y Neuronal Gravity, solo puedo asesorarte sobre la seguridad de tu página web o el desarrollo de soluciones empresariales. Si deseas una consulta personalizada, con gusto te conecto directamente con Martín por WhatsApp.',
        shouldSuggestWhatsApp: true,
        leadSummary: {
          domain: reportContext?.url || 'Consulta General',
          score: reportContext?.score ?? 0,
          grade: reportContext?.grade || 'F',
          userQuery: 'Consulta de seguridad',
        },
      });
    }

    // 5. Historial sanitizado (Máximo 4 mensajes, truncados a 200 caracteres)
    const sanitizedHistory = Array.isArray(history)
      ? history.slice(-4).map((h) => ({
          role: h.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: String(h.content || '').slice(0, 200) }],
        }))
      : [];

    const apiKey = process.env.GEMINI_API_KEY;

    let contextPrompt = '';
    if (reportContext) {
      contextPrompt = `
[CONTEXTO DEL REPORTE AUDITADO]
- Dominio: ${String(reportContext.url || 'No especificado').slice(0, 80)}
- Calificación: ${reportContext.score ?? 'N/A'}/100 (Grado: ${reportContext.grade || 'N/A'})
- Cabeceras ausentes: ${reportContext.missingHeaders?.slice(0, 5).join(', ') || 'Ninguna crítica'}
`;
    }

    let reply = '';
    const lowerMsg = trimmedMsg.toLowerCase();
    const isLeadIntent =
      lowerMsg.includes('precio') ||
      lowerMsg.includes('costo') ||
      lowerMsg.includes('plan') ||
      lowerMsg.includes('cuanto') ||
      lowerMsg.includes('cuánto') ||
      lowerMsg.includes('contratar') ||
      lowerMsg.includes('ayuda') ||
      lowerMsg.includes('wsp') ||
      lowerMsg.includes('whatsapp') ||
      lowerMsg.includes('cotizar') ||
      lowerMsg.includes('martin') ||
      lowerMsg.includes('martín');

    let shouldSuggestWhatsApp = isLeadIntent;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const contents = [
          { role: 'user', parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${contextPrompt}` }] },
          { role: 'model', parts: [{ text: 'Entendido. Asesoraré únicamente sobre ciberdefensa web y soluciones tecnológicas de Neuronal Gravity.' }] },
          ...sanitizedHistory,
          { role: 'user', parts: [{ text: trimmedMsg }] },
        ];

        const response = await ai.models.generateContent({
          // Configurable: Google retira modelos con frecuencia (gemini-1.5-flash ya devuelve 404).
          // El alias "-latest" apunta siempre al modelo vigente de esa familia.
          model: process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest',
          contents,
          config: {
            temperature: 0.4,
            maxOutputTokens: 250, // Límite estricto para evitar uso como generador masivo
          },
        });

        // Si Gemini devuelve texto vacío, se deja vacío para que conmute al respaldo (Groq)
        reply = (response.text || '').trim();
      } catch (geminiError: unknown) {
        console.warn('Error en Gemini, conmutando a Groq (IA gratuita de respaldo):', geminiError);
      }
    }

    // Respaldo con Groq Cloud AI ($0 costo, ultra-rápido) si Gemini falló o no tiene cuota
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!reply && groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              { role: 'system', content: `${SYSTEM_INSTRUCTION}\n\n${contextPrompt}` },
              ...sanitizedHistory.map((h) => ({
                role: h.role === 'model' ? 'assistant' : 'user',
                content: h.parts[0]?.text || '',
              })),
              { role: 'user', content: trimmedMsg },
            ],
            temperature: 0.4,
            max_tokens: 250,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          reply = groqData.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (groqErr) {
        console.warn('Error en Groq AI:', groqErr);
      }
    }

    if (!reply) {
      reply = `Hola, soy Neuronality AI. En DEFENSA TI auditamos y blindamos tu sitio web para prevenir alertas de "Sitio no seguro" y bloqueos de pasarelas por contenido mixto. Puedes escanear tu web gratis o tocar el botón de WhatsApp para coordinar directamente con Martín.`;
      shouldSuggestWhatsApp = true;
    }

    return NextResponse.json({
      reply,
      shouldSuggestWhatsApp,
      leadSummary: {
        domain: reportContext?.url || 'Sin especificar',
        score: reportContext?.score ?? 0,
        grade: reportContext?.grade || 'F',
        userQuery: trimmedMsg,
      },
    });
  } catch (err: unknown) {
    console.error('[ai-consultant] Error interno:', err);
    return NextResponse.json(
      { error: 'No se pudo procesar la consulta. Intenta de nuevo o escríbenos por WhatsApp.' },
      { status: 500 }
    );
  }
}
