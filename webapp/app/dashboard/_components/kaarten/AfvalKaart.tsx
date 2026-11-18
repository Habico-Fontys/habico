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
      className="min-h-[265px] border border-[#e3e2e0] bg-[#fcfaf7] xl:col-start-2 xl:row-start-2"
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
            background: `conic-gradient(#1D38FF ${sensor.vulgraad}%, #e9eaff ${sensor.vulgraad}% 100%)`,
          }}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#fcfaf7]">
            <strong className="text-lg font-bold tabular-nums">
              {sensor.vulgraad}%
            </strong>
            <span className="text-[9px] text-[#6687b0]">gevuld</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Trash2 size={15} aria-hidden="true" />
            {sensor.soort}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6687b0]">
            {sensor.naam}
          </p>
          <p className="mt-2 text-xs font-medium text-[#1D38FF]">
            {beschikbaar}% beschikbaar
          </p>
        </div>
      </div>
      <span className="mt-5 flex items-center justify-between text-xs font-semibold text-[#1D38FF]">
        Bekijk de afvalkalender <ArrowUpRight size={16} />
      </span>
    </DashboardKaart>
  );
}
