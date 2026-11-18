"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  ShoppingBasket,
  Trash2,
  UsersRound,
  Wallet,
} from "lucide-react";
import {
  DashboardKaart,
  GrafiekBalk,
  OplopendGetal,
  Pijl,
} from "./_components/DashboardElements";
import { euro } from "./_lib/euro";
import { datumSleutel, startVanWeek } from "./_lib/datum";
import {
  bepaalBegroeting,
  bepaalHoogsteDag,
  berekenBudget,
  berekenDagen,
  berekenWeekTotalen,
  filterBijdragen,
  selecteerAgendaItems,
  type Bijdrage,
} from "./_lib/dashboard";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
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
import { HUISGENOTEN, HUISNAAM } from "./huisgenoten/data";
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

export default function DashboardPage() {
  const [vandaag, setVandaag] = useState<Date | null>(null);
  const [bijdragen, setBijdragen] = useState<Bijdrage[]>([]);
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

  useEffect(() => {
    function laden() {
      const nu = new Date();
      setVandaag(nu);

      // De week begint op maandag, gelijk aan de Takenlijst.
      const maandag = startVanWeek(nu);
      const zondag = new Date(maandag);
      zondag.setDate(maandag.getDate() + 6);

      try {
        const opgeslagen: unknown = JSON.parse(
          localStorage.getItem(REGISTRATIES_OPSLAG) ?? "[]",
        );
        const geldigeBijdragen = filterBijdragen(
          opgeslagen,
          datumSleutel(maandag),
          datumSleutel(zondag),
        );
        if (geldigeBijdragen === null) return;
        setBijdragen(geldigeBijdragen);
      } catch {
        setBijdragen([]);
      }
    }

    laden();
    window.addEventListener("storage", laden);
    window.addEventListener("focus", laden);
    return () => {
      window.removeEventListener("storage", laden);
      window.removeEventListener("focus", laden);
    };
  }, []);

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
        {/* Blauwe hoofdkaart: direct naar de gezamenlijke boodschappen. */}
        <DashboardKaart
          href={PAGINAS.boodschappen}
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

        {/* Donkere kaart met de echte geregistreerde minuten per weekdag. */}
        <DashboardKaart
          href={PAGINAS.taken}
          label="Open de takenlijst en registreer minuten"
          className="min-h-[265px] bg-[#182234] text-white"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Samen een schoon huis</h2>
            <Pijl donker />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <strong className="text-3xl font-semibold text-white">
              <OplopendGetal waarde={minuten} /> min
            </strong>
            <span className="text-xs text-white">van {WEEKDOEL_MINUTEN}</span>
            <span className="ml-auto text-sm text-white">
              <OplopendGetal waarde={percentage} />%
            </span>
          </div>
          <div
            className="mt-auto flex h-28 items-end gap-2 pt-4"
            aria-label="Geregistreerde minuten per dag"
          >
            {dagen.map((dag, index) => (
              <div
                key={index}
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                title={`${["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"][index]}: ${dag.minuten} min`}
              >
                <GrafiekBalk hoogte={Math.max(5, (dag.minuten / hoogsteDag) * 100)} />
                <span className="text-center text-[10px] text-white">
                  {dag.naam}
                  <span className="sr-only">: {dag.minuten} minuten</span>
                </span>
              </div>
            ))}
          </div>
        </DashboardKaart>

        {/* Hoge witte agendakaart: gestapelde kaarten als in de referentie. */}
        <DashboardKaart
          href={PAGINAS.agenda}
          label="Open de gezamenlijke agenda"
          className="border border-[#e3e2e0] bg-[#fcfaf7] xl:col-start-3 xl:row-span-2 xl:row-start-1"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Samen vooruit</h2>
            <Pijl />
          </div>
          <p className="mt-3 text-xs text-[#6687b0]">Maak ruimte voor elkaar.</p>
          {/* Gestapelde kaarten met een effen primaire blauwe voorkant. */}
          <div aria-hidden="true" className="relative mb-6 mt-8 h-40">
            <div className="absolute inset-x-6 top-0 h-28 -rotate-6 rounded-2xl bg-[#dce2ff]" />
            <div className="absolute inset-x-3 top-4 h-28 rotate-3 rounded-2xl bg-[#FD7702]" />
            <div className="absolute inset-x-0 top-8 flex h-32 flex-col justify-between rounded-2xl bg-[#1D38FF] p-5 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                {HUISNAAM}
              </span>
              <div className="flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold leading-tight text-white">
                  Meer samen.
                  <br />
                  Meer thuis.
                </span>
                <CalendarDays
                  size={30}
                  strokeWidth={1.5}
                  className="shrink-0 text-white"
                />
              </div>
            </div>
          </div>
          <h3 className="mb-3 text-xs font-semibold text-[#6687b0]">
            Uit de huisagenda
          </h3>
          <div className="space-y-2">
            {agendaItems.length > 0 ? agendaItems.map((activiteit) => {
              const datum = new Date(`${activiteit.date}T12:00:00`);
              return (
                <div
                  key={activiteit.id}
                  className="flex items-center gap-3 rounded-2xl bg-[#f0f1f6] p-3"
                >
                  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-sm font-bold">
                    {datum.getDate()}
                    <span className="text-[8px] font-medium uppercase text-[#6687b0]">
                      {datum.toLocaleDateString("nl-NL", { month: "short" })}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{activiteit.title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#6687b0]">
                      {activiteit.time} · {activiteit.location}
                    </p>
                  </div>
                  <ChevronRight size={14} className="ml-auto shrink-0 text-[#6687b0]" />
                </div>
              );
            }) : (
              <p className="rounded-2xl bg-[#f0f1f6] p-4 text-xs text-[#6687b0]">
                Er staan nog geen activiteiten in de agenda.
              </p>
            )}
          </div>
          <span className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#1D38FF]">
            Bekijk de agenda <ArrowUpRight size={14} />
          </span>
        </DashboardKaart>

        {/* Korte lijst: één klik brengt je naar de volledige boodschappenpagina. */}
        <DashboardKaart
          href={PAGINAS.boodschappen}
          label="Open de gezamenlijke boodschappenlijst"
          className="border border-[#e3e2e0] bg-[#fcfaf7]"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nog op het lijstje</h2>
            <Pijl />
          </div>
          <p className="mt-2 text-xs text-[#6687b0]">
            Kleine dingen. Fijn voor iedereen.
          </p>
          <div className="my-5 divide-y divide-[#e3e2e0]">
            {productenNodig.length > 0 ? (
              productenNodig.slice(0, 2).map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e9eaff] text-[#1D38FF]">
                    <ShoppingBasket size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{product.naam}</p>
                    <p className="mt-1 text-xs text-[#6687b0]">
                      {product.omschrijving || "Nog nodig"}
                    </p>
                  </div>
                  <span className="ml-auto whitespace-nowrap text-xs font-semibold">
                    {euro(product.prijs)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-[#6687b0]">
                Alles op het lijstje is al gekocht.
              </p>
            )}
          </div>
          <span className="mt-auto flex items-center justify-between text-xs font-semibold text-[#1D38FF]">
            {productenNodig.length} producten nodig <ArrowUpRight size={16} />
          </span>
        </DashboardKaart>

        {/* Jouw bak gebruikt dezelfde sensor als de afvalpagina. */}
        <DashboardKaart
          href={PAGINAS.afval}
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
                {100 - sensor.vulgraad}% beschikbaar
              </p>
            </div>
          </div>
          <span className="mt-5 flex items-center justify-between text-xs font-semibold text-[#1D38FF]">
            Bekijk de afvalkalender <ArrowUpRight size={16} />
          </span>
        </DashboardKaart>

        {/* Jouw mensen: de huisgenoteninformatie staat nu op de plek van de afvalkaart. */}
        <DashboardKaart
          href={PAGINAS.huisgenoten}
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
      </div>
    </main>
  );
}
