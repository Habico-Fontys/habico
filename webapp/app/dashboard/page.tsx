"use client";

import { useMemo } from "react";
import { AgendaKaart } from "./_components/kaarten/AgendaKaart";
import { AfvalKaart } from "./_components/kaarten/AfvalKaart";
import { BoodschappenKaart } from "./_components/kaarten/BoodschappenKaart";
import { BudgetKaart } from "./_components/kaarten/BudgetKaart";
import { HuisgenotenKaart } from "./_components/kaarten/HuisgenotenKaart";
import { MinutenKaart } from "./_components/kaarten/MinutenKaart";
import { datumSleutel, startVanWeek } from "./_lib/datum";
import {
  bepaalBegroeting,
  bepaalHoogsteDag,
  berekenBudget,
  berekenDagen,
  berekenGrafiekDagen,
  berekenWeekTotalen,
  filterBijdragen,
  selecteerAgendaItems,
} from "./_lib/dashboard";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { useVandaag } from "./_hooks/useVandaag";
import {
  ACTIVITEITEN_OPSLAG,
  BEGIN_ACTIVITEITEN,
  isAgendaActiviteiten,
} from "./activiteiten/data";
import {
  BOODSCHAPPEN_OPSLAG,
  BEGIN_BOODSCHAPPEN_DATA,
  isBoodschappenData,
} from "./boodschappenlijst/data";
import { HUISNAAM } from "./huisgenoten/data";
import {
  REGISTRATIES_OPSLAG,
  WEEKDOEL_MINUTEN,
} from "./takenlijst/data";
import {
  BEGIN_SENSOR,
  isSensorData,
  SENSOR_OPSLAG,
} from "./afval/sensor";

// ---------- 1. Installatie ----------
// Plaats dit bestand in app/dashboard/page.tsx (of src/app/dashboard/page.tsx).
// Je bestaande layout verzorgt het logo, de sidebar en de bovenbalk.
// Vereist dezelfde Tailwind CSS en lucide-react als de Takenlijst.

// ---------- 2. Links naar jullie pagina’s ----------
// Pas alleen deze paden aan wanneer een map in jouw project anders heet.
const PAGINAS = {
  taken: "/dashboard/takenlijst",
  boodschappen: "/dashboard/boodschappenlijst",
  agenda: "/dashboard/activiteiten",
  huisgenoten: "/dashboard/huisgenoten",
  afval: "/dashboard/afval",
};

// ---------- 3. Huisinstellingen ----------
const HUIS = {
  gebruiker: "Marvin",
};

const GEEN_REGISTRATIES: unknown[] = [];
const isLijst = (waarde: unknown): waarde is unknown[] =>
  Array.isArray(waarde);

export default function DashboardPage() {
  const vandaag = useVandaag();
  const [registraties] = useLocalStorageValue(
    REGISTRATIES_OPSLAG,
    GEEN_REGISTRATIES,
    isLijst,
    { onInvalid: "fallback" },
  );
  const [boodschappen] = useLocalStorageValue(
    BOODSCHAPPEN_OPSLAG,
    BEGIN_BOODSCHAPPEN_DATA,
    isBoodschappenData,
  );
  const [activiteiten] = useLocalStorageValue(
    ACTIVITEITEN_OPSLAG,
    BEGIN_ACTIVITEITEN,
    isAgendaActiviteiten,
  );
  const [sensor] = useLocalStorageValue(
    SENSOR_OPSLAG,
    BEGIN_SENSOR,
    isSensorData,
  );

  const bijdragen = useMemo(() => {
    if (!vandaag) return [];

    const maandag = startVanWeek(vandaag);
    const zondag = new Date(maandag);
    zondag.setDate(maandag.getDate() + 6);
    return (
      filterBijdragen(
        registraties,
        datumSleutel(maandag),
        datumSleutel(zondag),
      ) ?? []
    );
  }, [registraties, vandaag]);

  // ---------- 6. Totalen voor de kaarten ----------
  const { minuten, percentage } = berekenWeekTotalen(
    bijdragen,
    WEEKDOEL_MINUTEN,
  );
  const { uitgegeven, beschikbaar, productenNodig } = berekenBudget(boodschappen);
  const agendaItems = selecteerAgendaItems(activiteiten);
  const begroeting = bepaalBegroeting(vandaag);
  const dagen = berekenDagen(vandaag, bijdragen);
  const hoogsteDag = bepaalHoogsteDag(dagen);

  const grafiekDagen = berekenGrafiekDagen(dagen, hoogsteDag);
  const afvalBeschikbaar = 100 - sensor.vulgraad;
  // ---------- 7. Dashboard ----------
  return (
    <main className="mx-auto w-full max-w-[1500px] p-4 font-poppins text-[#032747] sm:p-6 lg:p-10">
      {/* De begroeting blijft boven het kaartenoverzicht staan. */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FD7702]">
            {HUISNAAM} · Samen thuis
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {begroeting}, {HUIS.gebruiker}
            <span className="text-[#FD7702]">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6687b0]">
            Een fijn huis begint bij jullie. Wat pak jij vandaag op?
          </p>
        </div>
        <span className="rounded-full border border-[#e3e2e0] bg-[#fcfaf7] px-4 py-2 text-xs">
          <span className="mr-2 inline-block size-2 rounded-full bg-[#FD7702]" />
          Jouw huis, in één overzicht
        </span>
      </header>

      {/* Desktop: drie kolommen. Agenda loopt over twee rijen.
          Mobiel: één kolom, zodat bedragen en teksten goed leesbaar blijven. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BudgetKaart
          href={PAGINAS.boodschappen}
          beschikbaar={beschikbaar}
          uitgegeven={uitgegeven}
        />
        <MinutenKaart
          href={PAGINAS.taken}
          minuten={minuten}
          percentage={percentage}
          weekdoel={WEEKDOEL_MINUTEN}
          grafiekDagen={grafiekDagen}
        />
        <AgendaKaart
          href={PAGINAS.agenda}
          agendaItems={agendaItems}
        />
        <BoodschappenKaart
          href={PAGINAS.boodschappen}
          productenNodig={productenNodig}
        />
        <AfvalKaart
          href={PAGINAS.afval}
          sensor={sensor}
          beschikbaar={afvalBeschikbaar}
        />
        <HuisgenotenKaart
          href={PAGINAS.huisgenoten}
        />
      </div>
    </main>
  );
}
