import { Wallet } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { OplopendGetal } from "../OplopendGetal";
import { Pijl } from "../Pijl";
import { euro } from "../../_lib/euro";

export type BudgetKaartProps = {
  href: string;
  beschikbaar: number;
  uitgegeven: number;
};

export function BudgetKaart({
  href,
  beschikbaar,
  uitgegeven,
}: BudgetKaartProps) {
  // Blauwe hoofdkaart: direct naar de gezamenlijke boodschappen.
  return (
    <DashboardKaart
      href={href}
      label="Bekijk het gezamenlijke boodschappenbudget"
      className="min-h-[265px] bg-[linear-gradient(100deg,_#1D38FF,_#003F7D)] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full border-[45px] border-white/5"
      />
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-white/80">
          <Wallet size={16} /> Ons huishoudpotje
        </span>
        <Pijl donker />
      </div>
      <p className="relative mt-5 text-5xl font-semibold tracking-tight">
        <OplopendGetal waarde={beschikbaar} bedrag />
      </p>
      <p className="mt-2 text-xs text-white/70">
        Beschikbaar voor gezamenlijke boodschappen
      </p>
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1D38FF]">
          Bekijk budget
        </span>
        <span className="text-xs text-white/75">{euro(uitgegeven)} uitgegeven</span>
      </div>
    </DashboardKaart>
  );
}
