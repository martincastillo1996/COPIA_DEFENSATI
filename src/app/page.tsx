'use client';

import React from 'react';
import Link from 'next/link';
import FounderProfileCard from '@/components/FounderProfileCard';
import NeuronalGravityBrandLogo from '@/components/NeuronalGravityBrandLogo';
import { siteConfig } from '@/config/site';

const LINE = 'border-[rgba(255,255,255,0.08)]';
const MONO = 'font-mono text-[11px] uppercase tracking-[0.2em]';

const INDEX = [
  { n: '01', t: 'Auditoría perimetral', tel: 'TLS 1.3 · HSTS · CSP · puertos verificados', href: '/defensati' },
  { n: '02', t: 'Blindaje WordPress', tel: 'WP-CORE · PLUGINS · XML-RPC · WAF', href: '/defensati/servicios/limpieza-malware-wordpress' },
  { n: '03', t: 'Correo SPF / DKIM / DMARC', tel: 'DNS TXT · p=reject · rua', href: '/defensati/servicios/blindaje-correo-spf-dkim-dmarc' },
  { n: '04', t: 'Pasarelas de pago', tel: 'PCI-DSS · CHECKOUT · WEBHOOKS', href: '/defensati/servicios/auditoria-pasarelas-de-pago' },
  { n: '05', t: 'Ley 29733 · Datos', tel: 'ANPDP · COOKIES · CONSENTIMIENTO', href: '/defensati/servicios/adecuacion-ley-29733-proteccion-datos' },
];

export default function NeuronalGravityHubHome() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#080808] text-[#EDEDED] font-sans antialiased selection:bg-[#EDEDED] selection:text-[#080808]">
      {/* Navegación editorial: esquinas ancladas */}
      <div className="fixed top-4 left-4 sm:left-6 z-50">
        <NeuronalGravityBrandLogo />
      </div>
      <div className={`${MONO} fixed top-5 right-4 sm:right-6 z-50 mix-blend-difference flex gap-6`}>
        <Link href="/defensati" className="hover:underline underline-offset-4">Defensa TI</Link>
        <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">Contacto</a>
      </div>
      <div className={`${MONO} fixed bottom-5 left-4 sm:left-6 z-50 mix-blend-difference text-[#8a8a8a] hidden sm:block`}>
        12°02′S — 77°02′W
      </div>
      <div className={`${MONO} fixed bottom-5 right-4 sm:right-6 z-50 mix-blend-difference text-[#8a8a8a] hidden sm:block`}>
        Ed. {year} / Lima
      </div>

      <main>
        {/* ESCENA 01 */}
        <section className={`relative h-screen min-h-[640px] overflow-hidden border-b ${LINE}`}>
          {/* Escultura obsidiana */}
          <div aria-hidden className="absolute right-[-18vw] sm:right-[-6vw] top-1/2 -translate-y-1/2 w-[110vw] sm:w-[75vw] max-w-[1100px] aspect-square">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 32% 28%, #3a3a3a 0%, #161616 18%, #0b0b0b 42%, #030303 70%), #000',
                boxShadow: 'inset -60px -80px 140px rgba(0,0,0,0.9), inset 30px 40px 80px rgba(255,255,255,0.05)',
              }}
            />
            <div
              className="absolute inset-[8%] rounded-full opacity-60"
              style={{
                background:
                  'conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(237,237,237,0.10) 40deg, transparent 90deg, transparent 260deg, rgba(237,237,237,0.06) 300deg, transparent 340deg)',
                filter: 'blur(18px)',
              }}
            />
            <div className="absolute left-[24%] top-[20%] w-[14%] h-[7%] rounded-full bg-[#EDEDED]/25 blur-2xl rotate-[-30deg]" />
          </div>

          <div className="relative z-10 h-full grid grid-cols-12 px-4 sm:px-6">
            <div className="col-span-12 md:col-span-8 self-end pb-20 sm:pb-24">
              <p className={`${MONO} text-[#8a8a8a] mb-6`}>Ingeniería · Ciberdefensa</p>
              <h1 className="font-semibold text-[clamp(3.5rem,8vw,9rem)] leading-[0.88] tracking-[-0.05em]">
                Software que<br />no cede.
              </h1>
              <Link
                href="/defensati"
                className={`${MONO} mt-10 inline-block rounded-none border border-[#EDEDED] px-8 py-4 hover:bg-[#EDEDED] hover:text-[#080808] transition-colors duration-75`}
              >
                Escanear mi sitio →
              </Link>
            </div>
          </div>
        </section>

        {/* ESCENA 02: Índice técnico */}
        <section className={`border-b ${LINE}`}>
          <div className={`grid grid-cols-12 px-4 sm:px-6 py-6 border-b ${LINE} ${MONO} text-[#8a8a8a]`}>
            <span className="col-span-6 md:col-span-2">Índice</span>
            <span className="col-span-6 md:col-span-10 text-right md:text-left">Defensa TI / Capacidades</span>
          </div>
          <ul>
            {INDEX.map((row) => (
              <li key={row.n} className={`border-b ${LINE} last:border-b-0`}>
                <Link
                  href={row.href}
                  className="group grid grid-cols-12 items-baseline gap-x-4 px-4 sm:px-6 py-6 sm:py-8 hover:bg-[#EDEDED] hover:text-[#080808] transition-colors duration-75"
                >
                  <span className={`${MONO} col-span-2 md:col-span-1`}>{row.n} /</span>
                  <span className="col-span-10 md:col-span-7 font-semibold uppercase text-[clamp(1.75rem,4.5vw,4.5rem)] leading-[0.9] tracking-[-0.04em]">
                    {row.t}
                  </span>
                  <span className={`${MONO} col-span-12 md:col-span-4 mt-3 md:mt-0 md:text-right text-[#8a8a8a] group-hover:text-[#080808]`}>
                    {row.tel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ESCENA 03: Manifiesto */}
        <section className={`grid grid-cols-12 border-b ${LINE}`}>
          <div className={`col-span-12 md:col-span-4 px-4 sm:px-6 py-10 md:border-r ${LINE} ${MONO} text-[#8a8a8a]`}>
            03 / Proyecto activo
          </div>
          <div className="col-span-12 md:col-span-8 px-4 sm:px-6 py-10 md:py-16">
            <p className="text-[clamp(1.5rem,3vw,2.75rem)] leading-[1.05] tracking-[-0.03em] max-w-[22ch]">
              Defensa TI audita el perímetro externo de tu web y corrige lo que encuentra. Sin contraseñas. Diagnóstico en 48 h.
            </p>
            <Link href="/defensati/informe-ejemplo" className={`${MONO} mt-8 inline-block underline underline-offset-4 hover:no-underline`}>
              Ver informe de ejemplo
            </Link>
          </div>
        </section>

        {/* ESCENA 04: Fundador */}
        <section className={`border-b ${LINE} px-4 sm:px-6 py-16`}>
          <p className={`${MONO} text-[#8a8a8a] mb-8`}>04 / Fundador</p>
          <FounderProfileCard />
        </section>

        {/* ESCENA 05: Laboratorio */}
        <section className={`grid grid-cols-12 border-b ${LINE}`}>
          <div className={`col-span-12 md:col-span-4 px-4 sm:px-6 py-10 md:border-r ${LINE} ${MONO} text-[#8a8a8a]`}>
            05 / Laboratorio
          </div>
          <div className="col-span-12 md:col-span-8 px-4 sm:px-6 py-10 md:py-16">
            <h2 className="font-semibold text-[clamp(2.5rem,6vw,6rem)] leading-[0.88] tracking-[-0.05em]">
              En prueba.<br /><span className="text-[#5a5a5a]">No en venta.</span>
            </h2>
            <p className="mt-8 max-w-[52ch] text-[#a0a0a0]">
              Nuevas herramientas de software y automatización con modelos de lenguaje para distintos rubros. Ninguna sale a producción sin pasar el laboratorio.
            </p>
          </div>
        </section>
      </main>

      {/* Pie legal */}
      <footer className={`${MONO} grid grid-cols-12 gap-y-4 px-4 sm:px-6 pt-10 pb-20 text-[#8a8a8a]`}>
        <div className="col-span-12 md:col-span-4 normal-case tracking-normal font-sans text-xs">
          <span className="text-[#EDEDED] font-mono uppercase tracking-[0.2em]">Neuronal Gravity</span>
          <p className="mt-2">RUC {siteConfig.business.ruc} · {siteConfig.business.receiptNotice}</p>
          <p>© {year} {siteConfig.name}</p>
        </div>
        <nav className="col-span-12 md:col-span-8 flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
          <Link href="/terminos" className="hover:text-[#EDEDED]">Términos · Ley 29733</Link>
          <Link href="/reclamaciones" className="hover:text-[#EDEDED]">Libro de Reclamaciones</Link>
          <Link href="/defensati/informe-ejemplo" className="hover:text-[#EDEDED]">Informe ejemplo</Link>
          <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#EDEDED]">
            WhatsApp {siteConfig.contact.whatsappFormatted}
          </a>
        </nav>
      </footer>
    </div>
  );
}
