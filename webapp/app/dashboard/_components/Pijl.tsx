import { ArrowUpRight } from "lucide-react";

// Het pijltje beweegt mee wanneer je over de kaart gaat.
export function Pijl({ donker = false }: { donker?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 motion-reduce:transition-none ${
        donker ? "bg-white/10 text-white" : "bg-dashboard-arrow-surface text-dashboard-ink"
      }`}
    >
      <ArrowUpRight size={18} />
    </span>
  );
}
