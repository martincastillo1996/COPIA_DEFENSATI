import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DEFENSA TI | Blindaje Web, Desinfección de WordPress y Ciberseguridad en Perú',
  description:
    'Protegemos y recuperamos tu página web de ataques, malware y caídas. Diagnóstico preliminar sin costo, desinfección forense con garantía de 30 días y comprobante formal con RUC 10704877850.',
  alternates: {
    canonical: 'https://neuronalgravity.com/defensati',
  },
  keywords: [
    'seguridad web peru',
    'desinfeccion wordpress lima',
    'blindaje web perimetral',
    'limpieza de malware wordpress',
    'quitar pantalla roja google',
    'proteccion waf cloudflare peru',
    'ciberseguridad pymes',
    'defensa ti',
    'neuronal gravity',
  ],
  openGraph: {
    title: 'DEFENSA TI | Blindaje Web y Desinfección de Sitios Hackeados',
    description:
      'Diagnóstico previo sin costo. Desinfección de WordPress desde S/ 250 con garantía de 30 días por escrito y comprobante formal con RUC 10704877850.',
    url: 'https://neuronalgravity.com/defensati',
    siteName: 'DEFENSA TI • Neuronal Gravity',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: 'https://neuronalgravity.com/martin-castillo-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'DEFENSA TI • Blindaje y Ciberseguridad Web',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEFENSA TI | Blindaje y Ciberseguridad Web',
    description:
      'Protegemos tu página web para reducir riesgos, prevenir ataques y mantener tu negocio operativo. Diagnóstico previo sin costo y garantía formal por escrito.',
    images: ['https://neuronalgravity.com/martin-castillo-preview.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ProfessionalService', 'SecurityService'],
      '@id': 'https://neuronalgravity.com/defensati/#service',
      name: 'DEFENSA TI - Blindaje y Ciberseguridad Web',
      url: 'https://neuronalgravity.com/defensati',
      telephone: '+51987010380',
      priceRange: 'S/ 49 - S/ 335',
      currenciesAccepted: 'PEN',
      paymentAccepted: 'Yape, Plin, Transferencia Bancaria Directa',
      taxID: '10704877850',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lima',
        addressCountry: 'PE',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Perú',
      },
      founder: {
        '@type': 'Person',
        name: 'Martín Castillo',
        jobTitle: 'Especialista en Seguridad Web & Fundador',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catálogo Oficial de Servicios de Ciberseguridad DEFENSA TI',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Diagnóstico Gratuito Perimetral',
            price: '0',
            priceCurrency: 'PEN',
            description: 'Escáner pasivo no intrusivo de SSL/TLS, cabeceras y puertos.',
          },
          {
            '@type': 'Offer',
            name: 'Limpieza de WordPress Infectados',
            price: '250',
            priceCurrency: 'PEN',
            description: 'Desinfección profunda de archivos y base de datos con garantía de 30 días.',
          },
          {
            '@type': 'Offer',
            name: 'Blindaje de Sitios Web',
            price: '165',
            priceCurrency: 'PEN',
            description: 'Fortalecimiento de cabeceras estrictas OWASP, ocultamiento de versiones y hardening.',
          },
          {
            '@type': 'Offer',
            name: 'Protección Mediante WAF',
            price: '335',
            priceCurrency: 'PEN',
            description: 'Implementación perimetral experta de Firewall Cloudflare contra bots y DDoS.',
          },
          {
            '@type': 'Offer',
            name: 'Monitoreo y Mantenimiento Mensual',
            price: '49',
            priceCurrency: 'PEN',
            description: 'Uptime check cada 15 min, alerta preventiva de SSL y re-escaneos mensuales a WhatsApp.',
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://neuronalgravity.com/defensati/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿En cuánto tiempo queda limpia y funcionando mi web?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El diagnóstico inicial se entrega en menos de 2 horas tras recibir los accesos. Las limpiezas de malware y desinfección de WordPress se completan habitualmente entre 24 y 48 horas hábiles.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Tienen acceso a mis datos bancarios o información confidencial de mis clientes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nunca. La intervención técnica se ejecuta estrictamente a nivel de archivos de servidor y base de datos técnica del CMS. Jamás solicitamos pasarelas de pago. Podemos firmar un Acuerdo de Confidencialidad (NDA) previo.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cómo funciona la garantía de 30 días en el servicio de limpieza?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Si dentro de los 30 días calendario posteriores a la desinfección tu web vuelve a presentar la misma infección o puerta trasera remediada, nos encargamos de revisarla y desinfectarla nuevamente sin costo adicional.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Por qué mi proveedor de hosting suspendió mi web y no la repara por mí?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los contratos de hosting estipulan que el mantenimiento del CMS y código es responsabilidad del cliente. Cuando un sitio aloja malware, el hosting lo suspende para proteger al resto del servidor. Nosotros desinfectamos el código para levantar la suspensión.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Emites comprobante de pago legal para mi empresa o negocio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Emitimos Factura o Boleta electrónica formal conforme a ley peruana bajo RUC 10704877850 a nombre de Martín Castillo.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Existe algún contrato de permanencia forzosa en los planes de monitoreo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cero permanencia. Los planes de monitoreo se pagan mes a mes de forma prepagada y puedes pausar o cancelar el servicio en cualquier momento con un simple mensaje a WhatsApp.',
          },
        },
      ],
    },
  ],
};

export default function DefensatiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {/* Datos estructurados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Script condicional Google Analytics 4 (solo se inyecta si NEXT_PUBLIC_GA_ID está definido) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {children}
    </>
  );
}
