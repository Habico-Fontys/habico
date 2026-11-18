import { ArrowUpRight, Trash2 } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { Pijl } from "../Pijl";
import type { SensorData } from "../../afval/sensor";

export type AfvalKaartProps = {
  href: string;
  sensor: SensorData;
  beschikbaar: number;
};

export function AfvalKaart({
  href,
  sensor,
  beschikbaar,
}: AfvalKaartProps) {
  // Jouw bak gebruikt dezelfde sensor als de afvalpagina.
  return (
    <DashboardKaart
      href={href}
      label="Bekijk jouw bak en de afvalkalender"
      className="min-h-[265px] border border-dashboard-border bg-dashboard-surface xl:col-start-2 xl:row-start-2"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Jouw bak</h2>
        <Pijl />
      </div>
      <div className="mt-5 flex flex-1 items-center gap-4">
        <div
          role="img"
          aria-label={`${sensor.naam}, ${sensor.soort}, ${sensor.vulgraad}% gevuld`}
          className="size-24 shrink-0 rounded-full p-[9px]"
          style={{
            background: `conic-gradient(var(--color-tangy-blue) ${sensor.vulgraad}%, var(--color-dashboard-pale-blue) ${sensor.vulgraad}% 100%)`,
          }}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-dashboard-surface">
            <strong className="text-lg font-bold tabular-nums">
              {sensor.vulgraad}%
            </strong>
            <span className="text-[9px] text-dashboard-muted">gevuld</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Trash2 size={15} aria-hidden="true" />
            {sensor.soort}
          </p>
          <p className="mt-1 text-xs leading-5 text-dashboard-muted">
            {sensor.naam}
          </p>
          <p className="mt-2 text-xs font-medium text-tangy-blue">
            {beschikbaar}% beschikbaar
          </p>
        </div>
      </div>
      <span className="mt-5 flex items-center justify-between text-xs font-semibold text-tangy-blue">
        Bekijk de afvalkalender <ArrowUpRight size={16} />
      </span>
    </DashboardKaart>
  );
}
