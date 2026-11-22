import SectionHead from './SectionHead';

/** Cómo trabajo + garantía, en un solo bloque. */

const STEPS = [
  ['01', 'Escaneas o me escribes', 'Pasas tu URL por el escáner o me mandas el link por WhatsApp.'],
  ['02', 'Te muestro qué encontré, gratis', 'Diagnóstico claro antes de pagar: qué es riesgo real y qué no.'],
  ['03', 'Respaldo, corrijo y blindo', 'Copia completa de archivos y base de datos antes de tocar nada. Precio fijo.'],
  ['04', 'Informe por escrito', 'Qué encontré, qué corregí, qué queda pendiente y qué cubre la garantía.'],
];

export default function DefensatiProcess() {
  return (
    <section id="como-funciona" className="scroll-mt-24 space-y-12">
      <SectionHead index="08" label="Recuperación · Método" title={<>Sin sorpresas,<br /><span className="text-[#7d8891]">de principio a fin.</span></>} />
      <div className="grid grid-cols-12 gap-y-10 lg:gap-x-8">
        <ol className="col-span-12 lg:col-span-6 lg:col-start-4 border-t ed-line">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="grid grid-cols-12 gap-4 py-6 border-b ed-line">
              <span className="col-span-2 hud-label">{n}</span>
              <div className="col-span-10">
                <p className="text-lg font-light text-[#e8edf1] tracking-tight">{t}</p>
                <p className="mt-1 text-sm text-[#a3aeb6] leading-relaxed">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside id="garantia" className="col-span-12 lg:col-span-3 hud-frame p-6 self-start scroll-mt-24">
          <p className="hud-label">Garantía</p>
          <p className="mt-3 text-5xl font-light tracking-tight text-[#e8edf1]">30 días</p>
          <p className="mt-3 text-sm text-[#7d8891] leading-relaxed">Si se reinfecta por la misma causa, la limpio gratis.</p>
          <div className="mt-6 space-y-4 text-sm border-t ed-line pt-4">
            <div><p className="hud-label">Cubre</p><p className="mt-1 text-[#e8edf1]">La misma infección o puerta trasera remediada.</p></div>
            <div><p className="hud-label">No cubre</p><p className="mt-1 text-[#7d8891]">Plugins piratas instalados después, contraseñas débiles o cambios de terceros.</p></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
