import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, Clock, FileText, MessageCircle, ScanSearch } from 'lucide-react';
import HeaderWhatsAppButton from '@/components/HeaderWhatsAppButton';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { SERVICE_PAGES, getServicePage } from '@/config/servicePages';
import { siteConfig } from '@/config/site';
import { getWhatsAppUrl } from '@/lib/whatsapp';

const BASE_URL = 'https://neuronalgravity.com';

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) return {};
  const url = `${BASE_URL}/defensati/servicios/${service.slug}`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url,
      siteName: 'DEFENSA TI • Neuronal Gravity',
      locale: 'es_PE',
      type: 'website',
    },
  };
}

export default async function ServicePageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();

  const url = `${BASE_URL}/defensati/servicios/${service.slug}`;
  const whatsappUrl = getWhatsAppUrl(service.whatsappMessage);
  const others = SERVICE_PAGES.filter((s) => s.slug !== service.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: service.h1,
        description: service.metaDescription,
        url,
        areaServed: 'PE',
        provider: { '@id': `${BASE_URL}/#organization` },
        offers: service.prices.map((p) => ({
          '@type': 'Offer',
          name: p.label,
          price: p.price.replace(/[^0-9]/g, ''),
          priceCurrency: 'PEN',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'DEFENSA TI', item: `${BASE_URL}/defensati` },
          { '@type': 'ListItem', position: 2, name: service.shortName, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#0071e3] selection:text-white font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* Cabecera DEFENSA TI */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/defensati" className="flex items-center gap-2.5 group min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/40 flex items-center justify-center shrink-0 group-hover:border-[#38bdf8] transition-colors">
              <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
            </span>
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">
              DEFENSA TI
            </span>
          </Link>
          <HeaderWhatsAppButton message={service.whatsappMessage} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero */}
        <section className="space-y-5">
          <Link href="/defensati" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Todos los servicios de DEFENSA TI</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-balance">{service.h1}</h1>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-3xl">{service.intro}</p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>Solicitar por WhatsApp</span>
            </a>
            <Link
              href="/defensati"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-semibold transition-all active:scale-95"
            >
              <ScanSearch className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <span>Hacer el diagnóstico gratuito primero</span>
            </Link>
          </div>
        </section>

        {/* Precio */}
        <section aria-labelledby="precio" className="rounded-3xl bg-[#141416] border border-white/10 p-5 sm:p-7 space-y-5">
          <h2 id="precio" className="text-lg sm:text-xl font-bold tracking-tight">Precio transparente en Soles</h2>
          <ul className={`grid grid-cols-1 gap-3 ${service.prices.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {service.prices.map((p) => (
              <li key={p.label} className="rounded-2xl bg-[#0e1118] border border-white/10 p-4 sm:p-5 flex flex-col gap-1.5">
                <span className="text-sm text-neutral-300 leading-snug whitespace-normal">{p.label}</span>
                <span className="text-3xl font-extrabold text-[#38bdf8] tracking-tight">{p.price}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-2 text-xs text-neutral-300">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 leading-snug">
              <FileText className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>{service.paymentTerms}</span>
            </li>
            {service.deliveryTime && (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 leading-snug">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span>Entrega: {service.deliveryTime}</span>
              </li>
            )}
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 leading-snug">
              <FileText className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>Comprobante formal con RUC {siteConfig.business.ruc}</span>
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 leading-snug">
              <MessageCircle className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>Soporte directo por WhatsApp</span>
            </li>
          </ul>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Señales */}
          <section aria-labelledby="senales" className="rounded-3xl bg-[#141416] border border-white/10 p-5 sm:p-7 space-y-4">
            <h2 id="senales" className="text-lg font-bold tracking-tight">{service.signsTitle}</h2>
            <ul className="space-y-3">
              {service.signs.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-neutral-300 leading-snug">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Qué incluye */}
          <section aria-labelledby="incluye" className="rounded-3xl bg-[#141416] border border-white/10 p-5 sm:p-7 space-y-4">
            <h2 id="incluye" className="text-lg font-bold tracking-tight">Qué incluye</h2>
            <ul className="space-y-3">
              {service.includes.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-neutral-300 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Garantía */}
        {service.guarantee && (
          <section aria-labelledby="garantia" className="rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#141416] to-[#141416] border border-emerald-500/25 p-5 sm:p-7 space-y-2">
            <h2 id="garantia" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Garantía por escrito</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">{service.guarantee}</p>
          </section>
        )}

        {/* Preguntas frecuentes */}
        <section aria-labelledby="faq" className="space-y-3">
          <h2 id="faq" className="text-lg sm:text-xl font-bold tracking-tight">Preguntas frecuentes</h2>
          {service.faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-[#141416] border border-white/10 open:border-[#38bdf8]/40 transition-colors">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3 p-4 sm:p-5 text-sm sm:text-base font-semibold text-white leading-snug hover:text-[#38bdf8] transition-colors">
                <span>{f.q}</span>
                <span aria-hidden className="text-[#38bdf8] text-lg leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-neutral-300 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </section>

        {/* CTA final */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-900/25 via-[#141416] to-[#141416] border border-white/10 p-6 sm:p-8 space-y-4 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-balance">
            Primero te mostramos qué encontramos. Después decides.
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl mx-auto">
            El diagnóstico de tu web es gratuito y no te compromete a nada. Escríbeme y reviso tu caso personalmente.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Hablar con Martín por WhatsApp</span>
          </a>
          <p className="text-xs text-neutral-500">{siteConfig.contact.hours}</p>
        </section>

        {/* Otros servicios */}
        <nav aria-labelledby="otros" className="space-y-3">
          <h2 id="otros" className="text-sm font-bold uppercase tracking-wider text-neutral-400">Otros servicios de DEFENSA TI</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/defensati/servicios/${s.slug}`}
                  className="inline-block rounded-full bg-white/5 hover:bg-[#0071e3]/20 border border-white/10 hover:border-[#38bdf8]/50 px-3.5 py-2 text-xs font-medium text-neutral-200 hover:text-white transition-all leading-snug"
                >
                  {s.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-neutral-500 leading-relaxed pb-28 sm:pb-8">
        <p>
          © 2026 DEFENSA TI &bull; Neuronal Gravity &bull; RUC {siteConfig.business.ruc} &bull;{' '}
          <Link href="/terminos" className="hover:text-white transition-colors">Términos y Privacidad</Link> &bull;{' '}
          <Link href="/reclamaciones" className="hover:text-white transition-colors">Libro de Reclamaciones</Link>
        </p>
      </footer>
    </div>
  );
}
