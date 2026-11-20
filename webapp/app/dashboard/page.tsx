"use client";

import { AgendaKaart } from "./_components/kaarten/AgendaKaart";
import { AfvalKaart } from "./_components/kaarten/AfvalKaart";
import { BoodschappenKaart } from "./_components/kaarten/BoodschappenKaart";
import { BudgetKaart } from "./_components/kaarten/BudgetKaart";
import { HuisgenotenKaart } from "./_components/kaarten/HuisgenotenKaart";
import { MinutenKaart } from "./_components/kaarten/MinutenKaart";
import { useDashboardData } from "./_hooks/useDashboardData";
import { HUISNAAM } from "./huisgenoten/data";


// ---------- 1. Installatie ----------
// Plaats dit bestand in app/dashboard/page.tsx (of src/app/dashboard/page.tsx).
// Je bestaande layout verzorgt het logo, de sidebar en de bovenbalk.
// Vereist dezelfde Tailwind CSS en lucide-react als de Takenlijst.

// ---------- 2. Links naar jullie pagina’s ----------
// Pas alleen deze paden aan wanneer een map in jouw project anders heet.
const PAGINAS = {
  taken: "/dashboard/takenlijst",
  boodschappen: "/dashboard/boodschappenlijst",
  agenda: "/dashboard/kalender",
  huisgenoten: "/dashboard/huisgenoten",
  afval: "/dashboard/afval",
};

// ---------- 3. Huisinstellingen ----------
const HUIS = {
  gebruiker: "Marvin",
};

export default function DashboardPage() {
  const data = useDashboardData();

  // ---------- 7. Dashboard ----------
  return (
    <main className="mx-auto w-full max-w-[1500px] p-4 font-poppins text-dashboard-ink sm:p-6 lg:p-10">
      {/* De begroeting blijft boven het kaartenoverzicht staan. */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-fire-orange">
            {HUISNAAM} · Samen thuis
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {data.begroeting}, {HUIS.gebruiker}
            <span className="text-fire-orange">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-dashboard-muted">
            Een fijn huis begint bij jullie. Wat pak jij vandaag op?
          </p>
        </div>
        <span className="rounded-full border border-dashboard-border bg-dashboard-surface px-4 py-2 text-xs">
          <span className="mr-2 inline-block size-2 rounded-full bg-fire-orange" />
          Jouw huis, in één overzicht
        </span>
      </header>

      {/* Desktop: drie kolommen. Agenda loopt over twee rijen.
          Mobiel: één kolom, zodat bedragen en teksten goed leesbaar blijven. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BudgetKaart
          href={PAGINAS.boodschappen}
          beschikbaar={data.beschikbaar}
          uitgegeven={data.uitgegeven}
        />
        <MinutenKaart
          href={PAGINAS.taken}
          minuten={data.minuten}
          percentage={data.percentage}
          weekdoel={data.weekdoel}
          grafiekDagen={data.grafiekDagen}
        />
        <AgendaKaart
          href={PAGINAS.agenda}
          agendaItems={data.agendaItems}
        />
        <BoodschappenKaart
          href={PAGINAS.boodschappen}
          productenNodig={data.productenNodig}
        />
        <AfvalKaart
          href={PAGINAS.afval}
          sensor={data.sensor}
          beschikbaar={data.afvalBeschikbaar}
        />
        <HuisgenotenKaart
          href={PAGINAS.huisgenoten}
        />
      </div>
    </main>
  );
}
