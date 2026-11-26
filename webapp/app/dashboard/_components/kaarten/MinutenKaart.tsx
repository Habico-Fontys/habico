import { DashboardKaart } from "../DashboardKaart";
import { GrafiekBalk } from "../GrafiekBalk";
import { OplopendGetal } from "../OplopendGetal";
import { Pijl } from "../Pijl";
import type { GrafiekDag } from "../../_lib/dashboard";

export type MinutenKaartProps = {
  href: string;
  minuten: number;
  percentage: number;
  weekdoel: number;
  grafiekDagen: GrafiekDag[];
};

export function MinutenKaart({
  href,
  minuten,
  percentage,
  weekdoel,
  grafiekDagen,
}: MinutenKaartProps) {
  // Donkere kaart met de echte geregistreerde minuten per weekdag.
  return (
    <DashboardKaart
      href={href}
      label="Open de takenlijst en registreer minuten"
      className="minuten-kaart min-h-[265px] bg-dashboard-dark text-white"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Samen een schoon huis</h2>
        <Pijl donker />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <strong className="text-3xl font-semibold text-white">
          <OplopendGetal waarde={minuten} /> min
        </strong>
        <span className="text-xs text-white">van {weekdoel}</span>
        <span className="ml-auto text-sm text-white">
          <OplopendGetal waarde={percentage} />%
        </span>
      </div>
      <div
        className="mt-auto flex h-28 items-end gap-2 pt-4"
        aria-label="Geregistreerde minuten per dag"
      >
        {grafiekDagen.map((dag, index) => (
          <div
            key={index}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
            title={dag.titel}
          >
            <GrafiekBalk hoogte={dag.hoogte} />
            <span className="text-center text-[10px] text-white">
              {dag.naam}
              <span className="sr-only">: {dag.minuten} minuten</span>
            </span>
          </div>
        ))}
      </div>
    </DashboardKaart>
  );
}
