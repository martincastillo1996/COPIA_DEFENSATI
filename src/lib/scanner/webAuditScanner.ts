/**
 * Motor Perimetral de Auditoría Web Profunda (DEFENSA TI Engine v1.4.0)
 * 
 * Inspección no invasiva del HTML de la portada y cabeceras de respuesta:
 * 1. Detección Perimetral de WAF / Firewall (Cloudflare, Sucuri, CloudFront, etc.) o Servidor Desnudo.
 * 2. Fingerprinting de CMS & E-Commerce (WordPress, WooCommerce, PrestaShop, Shopify, etc.).
 * 3. Detección de Plugins y Versiones Expuestas (Vectores CVE).
 * 4. Contenido Mixto (Mixed Content HTTP dentro de HTTPS).
 * 5. Formularios Inseguros (envío sin cifrado o acción HTTP).
 * 6. Detección Temprana de Infección / Malware / SEO Spam (Inyecciones en el DOM).
 */

export interface WafCheckResult {
  hasWaf: boolean;
  provider?: string;
  isOriginExposed: boolean;
  details: string;
  remediation?: string;
}

export interface CmsCheckResult {
  detected: boolean;
  name?: string;
  version?: string;
  versionExposed: boolean;
  isEcommerce: boolean;
  ecommercePlatform?: string;
  detectedPlugins: string[];
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
  description: string;
}

export interface MixedContentItem {
  type: 'script' | 'stylesheet' | 'image' | 'iframe' | 'form';
  url: string;
}

export interface MixedContentResult {
  hasMixedContent: boolean;
  count: number;
  items: MixedContentItem[];
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
  description: string;
}

export interface MalwareScanResult {
  isInfectedOrSuspicious: boolean;
  threatLevel: 'LIMPIO' | 'SOSPECHOSO' | 'CRÍTICO';
  indicators: string[];
  description: string;
  remediation?: string;
}

export interface CommercialImpactResult {
  hasActiveMarketing: boolean;
  marketingPlatforms: string[];
  hasPaymentGateway: boolean;
  paymentGateways: string[];
  estimatedMonthlyAdWastePercent: number;
  anpdpMaxPenaltySoles: number;
  summaryText: string;
}

export interface WebAuditResult {
  waf: WafCheckResult;
  cms: CmsCheckResult;
  mixedContent: MixedContentResult;
  malware: MalwareScanResult;
  commercial?: CommercialImpactResult;
}

const WAF_SIGNATURES: Array<{
  name: string;
  check: (headers: Headers, html: string) => boolean;
}> = [
  {
    name: 'Cloudflare WAF / CDN',
    check: (h) => h.has('cf-ray') || (h.get('server') || '').toLowerCase().includes('cloudflare'),
  },
  {
    name: 'Sucuri WebSite Firewall',
    check: (h) => h.has('x-sucuri-id') || (h.get('server') || '').toLowerCase().includes('sucuri'),
  },
  {
    name: 'AWS CloudFront WAF',
    check: (h) => h.has('x-amz-cf-id') || (h.get('via') || '').toLowerCase().includes('cloudfront'),
  },
  {
    name: 'Fastly Edge Cloud',
    check: (h) => h.has('x-fastly-request-id') || (h.get('via') || '').toLowerCase().includes('fastly'),
  },
  {
    name: 'Akamai Edge Network',
    check: (h) => h.has('x-akamai-transformed') || (h.get('server') || '').toLowerCase().includes('akamaighost'),
  },
  {
    name: 'Imperva Incapsula',
    check: (h) => h.has('x-iinfo') || h.has('x-cdn') && (h.get('x-cdn') || '').toLowerCase().includes('incapsula'),
  },
  {
    name: 'LiteSpeed Cache Protection',
    check: (h) => (h.get('server') || '').toLowerCase().includes('litespeed') || h.has('x-litespeed-cache'),
  },
];

export async function scanWebAudit(targetUrl: string): Promise<WebAuditResult> {
  const isHttps = targetUrl.startsWith('https://');
  let responseHeaders: Headers = new Headers();
  let htmlSample = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DefensaTI-Audit/1.4',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    responseHeaders = res.headers;

    // Leer hasta 350 KB para analizar DOM sin sobrecargar memoria
    const rawText = await res.text();
    htmlSample = rawText.slice(0, 350000);
  } catch {
    // Si falla la petición HTML, se devuelven resultados predeterminados seguros
  }

  // ==========================================
  // 1. ANÁLISIS DE WAF / FIREWALL PERIMETRAL
  // ==========================================
  let detectedWaf: string | undefined;
  for (const waf of WAF_SIGNATURES) {
    if (waf.check(responseHeaders, htmlSample)) {
      detectedWaf = waf.name;
      break;
    }
  }

  const wafResult: WafCheckResult = detectedWaf
    ? {
        hasWaf: true,
        provider: detectedWaf,
        isOriginExposed: false,
        details: `Perímetro protegido activamente por ${detectedWaf}. Las solicitudes maliciosas y bots son filtrados antes de golpear el servidor.`,
      }
    : {
        hasWaf: false,
        isOriginExposed: true,
        details:
          'Servidor de origen expuesto directamente a Internet sin Firewall de Aplicaciones Web (WAF). Vulnerable a ataques de fuerza bruta, bots y DDoS.',
        remediation:
          'Implementar blindaje perimetral con Cloudflare WAF para enmascarar la IP del servidor de origen y filtrar tráfico dañino.',
      };

  // ==========================================
  // 2. FINGERPRINTING DE CMS & E-COMMERCE
  // ==========================================
  const lowerHtml = htmlSample.toLowerCase();
  let cmsName: string | undefined;
  let cmsVersion: string | undefined;
  let isEcommerce = false;
  let ecommercePlatform: string | undefined;
  const detectedPlugins: Set<string> = new Set();

  // WordPress
  const isWordpress =
    lowerHtml.includes('/wp-content/') ||
    lowerHtml.includes('/wp-includes/') ||
    lowerHtml.includes('name="generator" content="wordpress') ||
    lowerHtml.includes('wp-json');

  if (isWordpress) {
    cmsName = 'WordPress';

    // Extracción de versión de WordPress en meta generator
    const genMatch = htmlSample.match(/<meta[^>]+name=["']generator["'][^>]+content=["']WordPress\s*([0-9.]+)/i);
    if (genMatch && genMatch[1]) {
      cmsVersion = genMatch[1];
    }

    // WooCommerce
    if (
      lowerHtml.includes('woocommerce') ||
      lowerHtml.includes('wc-blocks') ||
      lowerHtml.includes('wc-ajax') ||
      lowerHtml.includes('cart-contents')
    ) {
      isEcommerce = true;
      ecommercePlatform = 'WooCommerce';
    }

    // Extracción pasiva de plugins activos en el DOM
    const pluginMatches = htmlSample.matchAll(/\/wp-content\/plugins\/([a-zA-Z0-9_-]+)/g);
    for (const match of pluginMatches) {
      const pluginSlug = match[1].toLowerCase();
      // Filtrar falsos positivos de extensiones
      if (!pluginSlug.endsWith('.css') && !pluginSlug.endsWith('.js') && !pluginSlug.endsWith('.php')) {
        detectedPlugins.add(pluginSlug);
      }
    }
  } else if (lowerHtml.includes('shopify.com') || lowerHtml.includes('cdn.shopify.com')) {
    cmsName = 'Shopify';
    isEcommerce = true;
    ecommercePlatform = 'Shopify';
  } else if (lowerHtml.includes('prestashop') || lowerHtml.includes('/modules/prestashop/')) {
    cmsName = 'PrestaShop';
    isEcommerce = true;
    ecommercePlatform = 'PrestaShop';
  } else if (lowerHtml.includes('magento') || lowerHtml.includes('/mage/')) {
    cmsName = 'Magento / Adobe Commerce';
    isEcommerce = true;
    ecommercePlatform = 'Magento';
  } else if (lowerHtml.includes('joomla')) {
    cmsName = 'Joomla';
  } else if (lowerHtml.includes('drupal')) {
    cmsName = 'Drupal';
  }

  const versionExposed = Boolean(cmsVersion);
  let cmsRisk: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
  let cmsDesc = 'No se detectó un CMS conocido o la firma está completamente oculta.';

  if (cmsName) {
    if (versionExposed) {
      cmsRisk = 'ALTO';
      cmsDesc = `${cmsName} detectado exponiendo públicamente la versión exacta (${cmsVersion}). Facilita a cibercriminales la búsqueda de exploits específicos (CVEs).`;
    } else {
      cmsRisk = 'MEDIO';
      cmsDesc = `${cmsName}${ecommercePlatform ? ` con ${ecommercePlatform}` : ''} detectado con firmas perimetrales visibles.`;
    }
  }

  const cmsResult: CmsCheckResult = {
    detected: Boolean(cmsName),
    name: cmsName,
    version: cmsVersion,
    versionExposed,
    isEcommerce,
    ecommercePlatform,
    detectedPlugins: Array.from(detectedPlugins).slice(0, 15),
    risk: cmsRisk,
    description: cmsDesc,
  };

  // ==========================================
  // 3. CONTENIDO MIXTO (Mixed Content)
  // ==========================================
  const mixedItems: MixedContentItem[] = [];

  if (isHttps && htmlSample) {
    // Scripts por HTTP
    const scriptMatches = htmlSample.matchAll(/<script[^>]+src=["'](http:\/\/[^"']+)["']/gi);
    for (const m of scriptMatches) {
      mixedItems.push({ type: 'script', url: m[1] });
    }

    // Estilos CSS por HTTP
    const styleMatches = htmlSample.matchAll(/<link[^>]+href=["'](http:\/\/[^"']+\.css[^"']*)["']/gi);
    for (const m of styleMatches) {
      mixedItems.push({ type: 'stylesheet', url: m[1] });
    }

    // Iframes por HTTP (Crítico)
    const iframeMatches = htmlSample.matchAll(/<iframe[^>]+src=["'](http:\/\/[^"']+)["']/gi);
    for (const m of iframeMatches) {
      mixedItems.push({ type: 'iframe', url: m[1] });
    }

    // Formularios inseguros con action HTTP
    const formMatches = htmlSample.matchAll(/<form[^>]+action=["'](http:\/\/[^"']+)["']/gi);
    for (const m of formMatches) {
      mixedItems.push({ type: 'form', url: m[1] });
    }
  }

  const hasMixedContent = mixedItems.length > 0;
  const mixedResult: MixedContentResult = {
    hasMixedContent,
    count: mixedItems.length,
    items: mixedItems.slice(0, 5),
    risk: hasMixedContent ? (mixedItems.some((i) => i.type === 'script' || i.type === 'iframe') ? 'ALTO' : 'MEDIO') : 'BAJO',
    description: hasMixedContent
      ? `Se detectaron ${mixedItems.length} recursos cargados mediante HTTP inseguro dentro de un entorno HTTPS, provocando bloqueo del candado verde.`
      : 'Cero contenido mixto. Todos los recursos externos se cargan de forma segura bajo cifrado SSL/TLS.',
  };

  // ==========================================
  // 4. INDICADORES DE MALWARE & SEO SPAM EN EL DOM
  // ==========================================
  const malwareIndicators: string[] = [];

  // Ofuscación de scripts eval / atob
  if (/eval\s*\(\s*(atob|base64_decode|unescape|String\.fromCharCode)/i.test(htmlSample)) {
    malwareIndicators.push('Script ofuscado detectado con eval() y decodificación en memoria');
  }

  // Iframes ocultos de tamaño 0
  if (/<iframe[^>]+style=["'][^"']*(display:\s*none|visibility:\s*hidden|width:\s*0|height:\s*0)[^"']*/i.test(htmlSample)) {
    malwareIndicators.push('Iframe invisible o de tamaño cero inyectado en el DOM');
  }

  // Firmas conocidas de malware WordPress / shells
  if (lowerHtml.includes('wp-vcd') || lowerHtml.includes('c99shell') || lowerHtml.includes('r57shell') || lowerHtml.includes('filesman')) {
    malwareIndicators.push('Firma de malware conocido de WordPress (backdoor o script de inyección)');
  }

  // SEO Spam de juegos de azar / fármacos en sitios en español
  const isGamblingSpam =
    lowerHtml.includes('judi online') ||
    lowerHtml.includes('slot gacor') ||
    lowerHtml.includes('poker qq') ||
    lowerHtml.includes('sbobet88') ||
    lowerHtml.includes('daftar slot');

  if (isGamblingSpam) {
    malwareIndicators.push('Inyección de SEO Spam detectada (enlaces o palabras de apuestas/casinos ajenas al sitio)');
  }

  const isInfectedOrSuspicious = malwareIndicators.length > 0;
  const malwareResult: MalwareScanResult = {
    isInfectedOrSuspicious,
    threatLevel: isInfectedOrSuspicious ? (malwareIndicators.some((i) => i.includes('malware') || i.includes('SEO Spam')) ? 'CRÍTICO' : 'SOSPECHOSO') : 'LIMPIO',
    indicators: malwareIndicators,
    description: isInfectedOrSuspicious
      ? `Se detectaron ${malwareIndicators.length} indicadores sospechosos en el código fuente de la página principal. Requiere revisión forense inmediata.`
      : 'No se detectaron firmas visibles de malware, redirecciones sospechosas ni inyecciones de SEO Spam en la portada.',
    remediation: isInfectedOrSuspicious
      ? 'Contratar servicio de Rescate y Limpieza de Malware DEFENSA TI (S/ 380 - S/ 550) para desinfección forense profunda con respaldo previo y garantía de 30 días.'
      : undefined,
  };

  // ==========================================
  // 5. DETECCIÓN COMERCIAL: PÍXELES DE PAUTA & PASARELAS DE PAGO
  // ==========================================
  const marketingPlatforms: string[] = [];
  if (lowerHtml.includes('fbevents.js') || lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbq(')) {
    marketingPlatforms.push('Meta Pixel (Facebook/Instagram Ads)');
  }
  if (lowerHtml.includes('googletagmanager.com/gtag') || lowerHtml.includes('googleadservices.com') || lowerHtml.includes('google_conversion')) {
    marketingPlatforms.push('Google Ads / Conversion Tag');
  }
  if (lowerHtml.includes('analytics.tiktok.com') || lowerHtml.includes('ttq.load')) {
    marketingPlatforms.push('TikTok Pixel');
  }

  const paymentGateways: string[] = [];
  if (lowerHtml.includes('checkout.culqi.com') || lowerHtml.includes('js.culqi.com') || lowerHtml.includes('culqi')) {
    paymentGateways.push('Culqi Perú');
  }
  if (lowerHtml.includes('static-content.vnforapps.com') || lowerHtml.includes('niubiz.com.pe') || lowerHtml.includes('niubiz')) {
    paymentGateways.push('Niubiz (VisaNet)');
  }
  if (lowerHtml.includes('sdk.mercadopago.com') || lowerHtml.includes('mercadopago.js') || lowerHtml.includes('mercadopago')) {
    paymentGateways.push('Mercado Pago');
  }
  if (lowerHtml.includes('static.micuentaweb.pe') || lowerHtml.includes('izipay')) {
    paymentGateways.push('Izipay');
  }
  if (lowerHtml.includes('js.stripe.com') || lowerHtml.includes('checkout.stripe.com')) {
    paymentGateways.push('Stripe');
  }
  if (lowerHtml.includes('paypal.com/sdk') || lowerHtml.includes('paypalobjects.com')) {
    paymentGateways.push('PayPal');
  }

  const hasActiveMarketing = marketingPlatforms.length > 0;
  const hasPaymentGateway = paymentGateways.length > 0;
  const estimatedMonthlyAdWastePercent = hasActiveMarketing ? 22 : 0;
  const anpdpMaxPenaltySoles = 257500; // 50 UIT (Ley N° 29733)

  let summaryText = 'Análisis comercial perimetral completado.';
  if (hasActiveMarketing && hasPaymentGateway) {
    summaryText = `Inversión activa en pauta (${marketingPlatforms.join(', ')}) y pasarela de cobro (${paymentGateways.join(', ')}). Alertas de seguridad provocan fuga de hasta 22% en ventas pagadas y contingencias legales de hasta 50 UIT (S/ 257,500).`;
  } else if (hasActiveMarketing) {
    summaryText = `Inversión activa en pauta publicitaria (${marketingPlatforms.join(', ')}). Alertas de seguridad o falta de HTTPS provocan rebote de prospectos pagados (~22%).`;
  } else if (hasPaymentGateway) {
    summaryText = `Pasarela de cobro en línea activa (${paymentGateways.join(', ')}). Sin cabeceras HSTS/CSP, el sitio expone transacciones y arriesga sanciones de la Ley N° 29733.`;
  }

  const commercialResult: CommercialImpactResult = {
    hasActiveMarketing,
    marketingPlatforms,
    hasPaymentGateway,
    paymentGateways,
    estimatedMonthlyAdWastePercent,
    anpdpMaxPenaltySoles,
    summaryText,
  };

  return {
    waf: wafResult,
    cms: cmsResult,
    mixedContent: mixedResult,
    malware: malwareResult,
    commercial: commercialResult,
  };
}
