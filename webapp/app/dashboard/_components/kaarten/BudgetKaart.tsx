"use client";

import { Wallet } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { OplopendGetal } from "../OplopendGetal";
import { Pijl } from "../Pijl";
import { euro } from "../../_lib/euro";
import { useLocalization } from "@/components/LocalizationProvider";

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
  const { locale } = useLocalization();
  // Blauwe hoofdkaart: direct naar de gezamenlijke boodschappen.
  return (
    <DashboardKaart
      href={href}
      label="Bekijk het gezamenlijke boodschappenbudget"
      className="min-h-[265px] bg-[linear-gradient(100deg,var(--color-tangy-blue),var(--color-habico-blue))] text-white"
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
      <p className="relative mt-5 text-5xl font-semibold tracking-tight text-white">
        <OplopendGetal waarde={beschikbaar} bedrag />
      </p>
      <p className="mt-2 text-xs text-white/70">
        Beschikbaar voor gezamenlijke boodschappen
      </p>
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-tangy-blue">
          Bekijk budget
        </span>
        <span className="text-xs text-white/75">{euro(uitgegeven, locale)} uitgegeven</span>
      </div>
    </DashboardKaart>
  );
}
