/**
 * Qué está en riesgo y qué no: dos columnas simples, una frase clara por ítem
 * y el detalle técnico como nota pequeña para el desarrollador.
 */

type Item = { title: string; says: string; tech: string };

const RISK: Item[] = [
  { title: 'Tu web tiene virus o te manda a otra página', says: 'Google te marca en rojo y pierdes clientes.', tech: 'Código inyectado en PHP/JS o en la base de datos.' },
  { title: 'Tu base de datos se ve desde internet', says: 'Pueden robar los datos de tus clientes.', tech: 'Puertos 3306, 5432 o 27017 abiertos.' },
  { title: 'Tu candado SSL venció o está por vencer', says: 'El navegador avisa "No seguro" y nadie compra.', tech: 'Certificado expirado o mal instalado.' },
  { title: 'WordPress o plugins desactualizados', says: 'Es por donde entran la mayoría de hackeos.', tech: 'Versiones con fallas públicas conocidas.' },
  { title: 'Tu página de pago no está protegida', says: 'Pueden copiar las tarjetas de tus clientes.', tech: 'Scripts externos sin CSP en el checkout.' },
];

const SAFE: Item[] = [
  { title: 'Puertos 80 y 443 abiertos', says: 'Es normal: así entran tus visitantes.', tech: 'Solo importa que 80 redirija a 443.' },
  { title: 'Aparece "Cloudflare" como servidor', says: 'Buena señal: ya tienes una capa de protección.', tech: 'El proxy oculta tu servidor real.' },
  { title: 'Tu nota es B y no A', says: 'No estás en peligro, es un detalle de mejora.', tech: 'Faltan cabeceras opcionales.' },
  { title: 'Falta "Permissions-Policy"', says: 'No afecta tus ventas ni tus datos.', tech: 'Mejora menor de configuración.' },
];

function Column({ items, risk }: { items: Item[]; risk: boolean }) {
  return (
    <div className="col-span-12 lg:col-span-6 border ed-line bg-[#080808]/70">
      <div className={`flex items-center gap-3 px-5 sm:px-6 py-4 border-b ed-line ${risk ? 'text-[#ff4d4d]' : 'text-[#EDEDED]'}`}>
        <span className={`w-7 h-7 flex items-center justify-center border text-sm font-bold ${risk ? 'border-[#ff4d4d]' : 'border-[#EDEDED]'}`}>
          {risk ? '!' : '✓'}
        </span>
        <h3 className="text-lg font-semibold leading-snug">
          {risk ? 'Sí es riesgo: hay que actuar' : 'No es riesgo: no pagues por esto'}
        </h3>
      </div>
      <ul>
        {items.map((i) => (
          <li key={i.title} className="px-5 sm:px-6 py-5 border-b ed-line last:border-b-0">
            <p className="font-semibold text-[#EDEDED] leading-snug">{i.title}</p>
            <p className="mt-1 text-[#bdbdbd] leading-snug">{i.says}</p>
            <p className="mt-2 text-xs text-[#8a8a8a] leading-snug break-words">
              <span className="text-[#666]">Técnico:</span> {i.tech}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DefensatiRiskMap() {
  return (
    <section id="riesgos" className="scroll-mt-24 grid grid-cols-12 gap-6 text-left">
      <header className="col-span-12 lg:col-span-8 mb-4">
        <p className="text-xs text-[#8a8a8a]">Qué está en riesgo y qué no</p>
        <h2 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDED] leading-tight">
          No todo hallazgo es una emergencia.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[#bdbdbd] leading-snug">
          Te digo con claridad qué pone en peligro tu negocio y qué no, para que solo pagues por lo que importa.
        </p>
      </header>

      <Column items={RISK} risk />
      <Column items={SAFE} risk={false} />

      <p className="col-span-12 text-sm text-[#8a8a8a] leading-snug">
        <span className="text-[#EDEDED]">Ojo:</span> el escáner gratis revisa lo que se ve desde fuera (SSL, cabeceras,
        puertos, firewall). Los virus escondidos dentro de archivos o base de datos se detectan con una revisión interna.
      </p>
    </section>
  );
}
