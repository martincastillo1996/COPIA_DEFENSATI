/** Cabecera de sección estilo HUD: índice + título grande + bajada. */
export default function SectionHead({
  index,
  label,
  title,
  lead,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <header className="grid grid-cols-12 gap-y-6 lg:gap-x-8 border-t ed-line pt-6">
      <p className="col-span-12 lg:col-span-3 hud-label">
        [{index}] — {label}
      </p>
      <div className="col-span-12 lg:col-span-9 space-y-6">
        <h2 className="hud-display text-[clamp(2.2rem,5.5vw,5rem)]">{title}</h2>
        {lead && <p className="max-w-[56ch] text-base text-[#7d8891] leading-relaxed">{lead}</p>}
      </div>
    </header>
  );
}
