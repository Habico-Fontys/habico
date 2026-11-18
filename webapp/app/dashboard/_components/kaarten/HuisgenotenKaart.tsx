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
      className="border border-[#e3e2e0] bg-[#fcfaf7] text-[#032747] md:col-span-2 xl:col-span-3"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <div aria-hidden="true" className="flex shrink-0 -space-x-2">
            {HUISGENOTEN.slice(0, 5).map((huisgenoot, index) => (
              <span
                key={huisgenoot.id}
                className={`flex size-11 items-center justify-center rounded-full border-[3px] border-[#fcfaf7] text-xs font-bold ${index === 1 ? "bg-[#ffe3ca] text-[#a44700]" : "bg-[#e0e5ff] text-[#1D38FF]"}`}
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
            <p className="mt-1 text-xs leading-5 text-[#6687b0]">
              Een huis maken we samen.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-2xl font-semibold leading-tight">
              <OplopendGetal waarde={HUISGENOTEN.length} />
              <span className="ml-2 text-sm font-normal text-[#6687b0]">
                huisgenoten
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-[#6687b0]">
              Wie doet wat? <UsersRound size={15} />
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#f0f1f6] text-[#1D38FF] px-4 py-2.5 text-xs font-semibold">
            Bekijk huisgenoten <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </DashboardKaart>
  );
}
