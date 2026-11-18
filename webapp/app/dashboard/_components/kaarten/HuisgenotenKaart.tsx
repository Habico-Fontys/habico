import { ArrowUpRight, UsersRound } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { OplopendGetal } from "../OplopendGetal";
import { Pijl } from "../Pijl";
import { HUISGENOTEN } from "../../huisgenoten/data";

export type HuisgenotenKaartProps = {
  href: string;
};

export function HuisgenotenKaart({ href }: HuisgenotenKaartProps) {
  // Jouw mensen: de huisgenoteninformatie staat nu op de plek van de afvalkaart.
  return (
    <DashboardKaart
      href={href}
      label="Bekijk alle huisgenoten"
      className="border border-dashboard-border bg-dashboard-surface text-dashboard-ink md:col-span-2 xl:col-span-3"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <div aria-hidden="true" className="flex shrink-0 -space-x-2">
            {HUISGENOTEN.slice(0, 5).map((huisgenoot, index) => (
              <span
                key={huisgenoot.id}
                className={`flex size-11 items-center justify-center rounded-full border-[3px] border-dashboard-surface text-xs font-bold ${index === 1 ? "bg-dashboard-avatar-peach text-dashboard-avatar-brown" : "bg-dashboard-avatar-blue text-tangy-blue"}`}
              >
                {huisgenoot.naam.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Jouw mensen</h2>
              <Pijl />
            </div>
            <p className="mt-1 text-xs leading-5 text-dashboard-muted">
              Een huis maken we samen.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-2xl font-semibold leading-tight">
              <OplopendGetal waarde={HUISGENOTEN.length} />
              <span className="ml-2 text-sm font-normal text-dashboard-muted">
                huisgenoten
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-dashboard-muted">
              Wie doet wat? <UsersRound size={15} />
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-dashboard-soft-surface text-tangy-blue px-4 py-2.5 text-xs font-semibold">
            Bekijk huisgenoten <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </DashboardKaart>
  );
}
