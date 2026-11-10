'use client';

import React from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Code2, 
  Cpu,
  FileCheck2
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';
import NeuronalGravityBrandLogo from '@/components/NeuronalGravityBrandLogo';

export default function NeuronalGravityHub() {
  const { language } = useI18n();

  const labels = {
    es: {
      badge: 'Atención Directa y Personalizada',
      title: '¿Quién atiende tu caso en DEFENSA TI?',
      desc: 'En DEFENSA TI no hay intermediarios ni juniors: yo mismo reviso tu web personalmente (Martín Castillo, RUC 10704877850). Diagnosticamos y blindamos tu tienda online o web de negocio con total reserva, garantía técnica y soporte directo en el Perú.',
      mainCta: 'Ver servicios de Neuronal Gravity',
      servicesTitle: 'Capacidades y Servicios Especializados:',
      service1: 'Ciberseguridad Web (DEFENSA TI)',
      service1Badge: 'Servicio Activo',
      service1Desc: 'Auditoría perimetral no intrusiva, desinfección forense y blindaje de pasarelas de pago.',
      service2: 'Desarrollo de Software a Medida',
      service2Badge: 'Especialidad Central',
      service2Desc: 'Tiendas online, aplicaciones web transaccionales, integración de pagos bancarios y arquitecturas en la nube.',
      service3: 'Automatización & Inteligencia Artificial',
      service3Badge: 'Optimización Operativa',
      service3Desc: 'Flujos automatizados, agentes de atención comercial y optimización de procesos para reducir costos manuales.',
      trustNote: 'RUC 10704877850 • Trato directo de fundador: yo mismo reviso tu web.',
    },
    en: {
      badge: 'Direct Founder Attention',
      title: 'Who is handling your site at DEFENSA TI?',
      desc: 'No junior staff or intermediaries: I personally review your website myself (Martin Castillo, Tax ID: 10704877850). We diagnose and harden your e-commerce store with full privacy and direct support in Peru.',
      mainCta: 'Explore Neuronal Gravity',
      servicesTitle: 'Core Capabilities & Engineering Services:',
      service1: 'Web Perimeter Security (DEFENSA TI)',
      service1Badge: 'Active Solution',
      service1Desc: 'Non-intrusive perimeter diagnostics, forensic remediation, and transactional payment hardening.',
      service2: 'Custom Software Engineering',
      service2Badge: 'Core Practice',
      service2Desc: 'E-commerce platforms, custom web applications, bank checkout integrations, and cloud infrastructure.',
      service3: 'Workflow Automation & AI',
      service3Badge: 'Operational Efficiency',
      service3Desc: 'Autonomous workflow automations, customer service agents, and operational cost reduction.',
      trustNote: 'Tax ID 10704877850 • Direct founder attention: I personally review your site.',
    },
    pt: {
      badge: 'Atendimento Direto e Personalizado',
      title: 'Quem atende o seu site no DEFENSA TI?',
      desc: 'Sem intermediários ou estagiários: eu mesmo reviso o seu site pessoalmente (Martín Castillo, RUC 10704877850). Diagnosticamos e blindamos a sua loja virtual com total privacidade e suporte direto.',
      mainCta: 'Ver serviços da Neuronal Gravity',
      servicesTitle: 'Capacidades e Serviços Empresariais:',
      service1: 'Cibersegurança Web (DEFENSA TI)',
      service1Badge: 'Serviço Ativo',
      service1Desc: 'Auditoria perimetral não intrusiva, remediação forense e proteção de pagamentos online.',
      service2: 'Desenvolvimento de Software sob Medida',
      service2Badge: 'Especialidade Central',
      service2Desc: 'Lojas virtuais, sistemas web transacionais e infraestrutura em nuvem.',
      service3: 'Automação & Inteligência Artificial',
      service3Badge: 'Otimização Operacional',
      service3Desc: 'Automação de processos empresariais e agentes inteligentes para redução de custos.',
      trustNote: 'RUC 10704877850 • Atendimento direto: eu mesmo reviso o seu site.',
    },
  }[language] || {
    badge: 'Atención Directa y Personalizada',
    title: '¿Quién atiende tu caso en DEFENSA TI?',
    desc: 'Sin intermediarios ni juniors: yo mismo reviso tu web personalmente (Martín Castillo, RUC 10704877850). Diagnosticamos y blindamos tu sitio web con total reserva y garantía técnica en el Perú.',
    mainCta: 'Ver servicios de Neuronal Gravity',
    servicesTitle: 'Capacidades y Servicios Especializados:',
    service1: 'Ciberseguridad Web (DEFENSA TI)',
    service1Badge: 'Servicio Activo',
    service1Desc: 'Auditoría perimetral y blindaje para sitios web en el Perú.',
    service2: 'Desarrollo de Software a Medida',
    service2Badge: 'Especialidad Central',
    service2Desc: 'Tiendas online, aplicaciones web y arquitecturas en la nube.',
    service3: 'Automatización & Inteligencia Artificial',
    service3Badge: 'Optimización Operativa',
    service3Desc: 'Flujos automatizados y optimización de procesos para empresas.',
    trustNote: 'RUC 10704877850 • Trato directo de fundador: yo mismo reviso tu web.',
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <div className="relative rounded-[32px] p-7 sm:p-9 bg-gradient-to-b from-[#0e131f] via-[#090b10] to-[#050608] border border-[#2997ff]/30 shadow-[0_25px_60px_rgba(0,113,227,0.18)] overflow-hidden space-y-7 text-left">
        
        {/* Glow de fondo neuronal */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2997ff]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-sky-500/20 border border-blue-400/40 text-[#38bdf8] text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{labels.badge}</span>
            </div>

            {/* Identidad de Marca Neuronal Gravity Oficial */}
            <div className="pt-1">
              <NeuronalGravityBrandLogo showSubtitle={true} />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {labels.title}
            </h3>
            
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              {labels.desc}
            </p>
          </div>

          <a
            href="https://neuronalgravity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#0077ed] hover:to-[#38bdf8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all cursor-pointer active:scale-95 shrink-0 self-start sm:self-center"
          >
            <span>{labels.mainCta}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* 3 Líneas de Especialidad Empresarial */}
        <div className="space-y-3 relative z-10">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block font-mono">
            {labels.servicesTitle}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Servicio 1: Ciberseguridad Web (DEFENSA TI) */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-2.5 shadow-md group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  {labels.service1Badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {labels.service1}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {labels.service1Desc}
              </p>
            </div>

            {/* Servicio 2: Desarrollo de Software a Medida */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-sky-500/30 hover:border-sky-500/60 transition-all space-y-2.5 shadow-md group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Code2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30 font-bold">
                  {labels.service2Badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                {labels.service2}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {labels.service2Desc}
              </p>
            </div>

            {/* Servicio 3: Automatización & Inteligencia Artificial */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-purple-500/30 hover:border-purple-500/60 transition-all space-y-2.5 shadow-md group">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  {labels.service3Badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {labels.service3}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {labels.service3Desc}
              </p>
            </div>

          </div>
        </div>

        {/* Cintillo de Confianza y Formalidad Legal */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-400">
          <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{labels.trustNote}</span>
        </div>

      </div>
    </div>
  );
}
