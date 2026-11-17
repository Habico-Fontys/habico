"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Plus,
  Radio,
  UserRound,
  X,
} from "lucide-react";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { BEGIN_SENSOR, isSensorData, SENSOR_OPSLAG } from "./sensor";

// ---------- 1. Installatie ----------
// Plaats dit bestand in app/dashboard/afval/page.tsx.
// Je bestaande layout verzorgt het logo, de navigatie en de bovenbalk.
// Vereist: Tailwind CSS en lucide-react. Er is geen extra animatiepakket nodig.
// Kalender en meldingen worden alleen op dit apparaat bewaard.
// De gedeelde voorbeeldmeting wordt ook getoond op de dashboardkaart.

// ---------- 2. Types en vaste gegevens ----------
type Afvalsoort = "Restafval" | "GFT" | "PMD" | "Papier";
type Moment = {
  id: string;
  soort: Afvalsoort;
  datum: string;
  tijd: string;
  bewoner: string;
  buitengezet: boolean;
};
type Probleem = { id: string; onderwerp: string; tekst: string; datum: string };
type HuisAfval = { momenten: Moment[]; problemen: Probleem[] };
type Venster = "kalender" | "sensor" | "probleem" | null;

const BEWONERS = ["Marvin", "Mila", "Jonas", "Sophie", "Emma", "Daan"];
const SOORTEN: Afvalsoort[] = ["Restafval", "GFT", "PMD", "Papier"];
const OPSLAG = "habico-afval-v1";
const knop =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D38FF] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
const invoer =
  "mt-2 min-h-12 w-full min-w-0 rounded-xl border border-[#e3e2e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1D38FF] focus:ring-2 focus:ring-[#1D38FF]/15";

// ---------- 3. Datumhelpers ----------
function datumSleutel(datum: Date) {
  return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, "0")}-${String(datum.getDate()).padStart(2, "0")}`;
}
function plusDagen(datum: string, aantal: number) {
  const dag = new Date(`${datum}T12:00:00`);
  dag.setDate(dag.getDate() + aantal);
  return datumSleutel(dag);
}
function langeDatum(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
function geldigeDatum(datum: unknown): datum is string {
  if (typeof datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return false;
  const waarde = new Date(`${datum}T12:00:00`);
  return !Number.isNaN(waarde.getTime()) && datumSleutel(waarde) === datum;
}
function geldigMoment(waarde: unknown): waarde is Moment {
  if (!waarde || typeof waarde !== "object") return false;
  const moment = waarde as Moment;
  return (
    typeof moment.id === "string" &&
    SOORTEN.includes(moment.soort) &&
    geldigeDatum(moment.datum) &&
    typeof moment.tijd === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(moment.tijd) &&
    BEWONERS.includes(moment.bewoner) &&
    typeof moment.buitengezet === "boolean"
  );
}
function geldigProbleem(waarde: unknown): waarde is Probleem {
  if (!waarde || typeof waarde !== "object") return false;
  const probleem = waarde as Probleem;
  return (
    typeof probleem.id === "string" &&
    typeof probleem.onderwerp === "string" &&
    typeof probleem.tekst === "string" &&
    typeof probleem.datum === "string"
  );
}

// Voorbeeldplanning wordt één keer aangemaakt; daarna blijft je eigen planning staan.
function startGegevens(vandaag: string): HuisAfval {
  return {
    momenten: Array.from({ length: 8 }, (_, index) => ({
      id: `ophaal-${index}`,
      soort: SOORTEN[index % SOORTEN.length],
      datum: plusDagen(vandaag, 1 + index * 3),
      tijd: "07:30",
      bewoner: BEWONERS[index % BEWONERS.length],
      buitengezet: false,
    })),
    problemen: [],
  };
}

// ---------- 4. Dezelfde kaarten en hover als de Takenlijst ----------
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-[#e3e2e0] bg-[#fcfaf7] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:translate-y-0 motion-reduce:transition-none sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

// Eén rij voor zowel de korte als de volledige ophaalkalender.
function KalenderRij({ moment }: { moment: Moment }) {
  const datum = new Date(`${moment.datum}T12:00:00`);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f0f1f6] p-3 sm:p-4">
      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
        <strong className="text-lg">{datum.getDate()}</strong>
        <span className="text-[9px] font-semibold uppercase text-[#6687b0]">
          {datum.toLocaleDateString("nl-NL", { month: "short" })}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{moment.soort}</p>
        <p className="mt-1 text-xs leading-5 text-[#6687b0]">
          {moment.bewoner} · vóór {moment.tijd}
        </p>
      </div>
      {moment.buitengezet ? (
        <span
          aria-label="Buitengezet"
          title="Buitengezet"
          className="rounded-full bg-[#e9eaff] p-2 text-[#1D38FF]"
        >
          <Check size={16} />
        </span>
      ) : (
        <Clock3 size={16} aria-hidden="true" className="shrink-0 text-[#6687b0]" />
      )}
    </div>
  );
}

// ---------- 5. Pagina, opslag en vensters ----------
export default function AfvalPage() {
  const [sensor] = useLocalStorageValue(
    SENSOR_OPSLAG,
    BEGIN_SENSOR,
    isSensorData,
  );
  const [vandaag, setVandaag] = useState("");
  const [gegevens, setGegevens] = useState<HuisAfval>({ momenten: [], problemen: [] });
  const [geladen, setGeladen] = useState(false);
  const [opslagFout, setOpslagFout] = useState("");
  const [melding, setMelding] = useState("");
  const [venster, setVenster] = useState<Venster>(null);
  const [vulling, setVulling] = useState(0);
  const [laatstActief, setLaatstActief] = useState(4);
  const dialoog = useRef<HTMLDialogElement>(null);

  // Formuliervelden voor een ophaalmoment.
  const [soort, setSoort] = useState<Afvalsoort>("Restafval");
  const [datum, setDatum] = useState("");
  const [tijd, setTijd] = useState("07:30");
  const [bewoner, setBewoner] = useState("Marvin");
  const [formulierFout, setFormulierFout] = useState("");

  // Formuliervelden voor een probleem met de buitencontainer.
  const [onderwerp, setOnderwerp] = useState("Container beschadigd");
  const [toelichting, setToelichting] = useState("");

  useEffect(() => {
    const nu = datumSleutel(new Date());
    setVandaag(nu);
    setDatum(plusDagen(nu, 1));
    try {
      const bewaard = localStorage.getItem(OPSLAG);
      if (bewaard) {
        const inhoud: unknown = JSON.parse(bewaard);
        if (!inhoud || typeof inhoud !== "object") throw new Error("Ongeldige opslag");
        const data = inhoud as Partial<HuisAfval>;
        if (!Array.isArray(data.momenten) || !Array.isArray(data.problemen))
          throw new Error("Ongeldige opslag");
        setGegevens({
          momenten: data.momenten.filter(geldigMoment),
          problemen: data.problemen.filter(geldigProbleem),
        });
      } else setGegevens(startGegevens(nu));
      setGeladen(true);
    } catch {
      setOpslagFout(
        "Je opgeslagen planning kon niet worden geladen. Herlaad de pagina voordat je wijzigingen maakt.",
      );
    }
  }, []);

  useEffect(() => {
    if (!geladen) return;
    try {
      localStorage.setItem(OPSLAG, JSON.stringify(gegevens));
      setOpslagFout("");
    } catch {
      setOpslagFout(
        "Opslaan op dit apparaat lukt niet. Je wijzigingen blijven alleen bewaard zolang deze pagina openstaat.",
      );
    }
  }, [gegevens, geladen]);

  useEffect(() => {
    if (venster) dialoog.current?.showModal();
    else dialoog.current?.close();
  }, [venster]);

  // Oplopend percentage en cirkel, met ondersteuning voor minder beweging.
  useEffect(() => {
    const voorkeur = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const start = performance.now();
    function stap(nu: number) {
      const voortgang = Math.min((nu - start) / 1100, 1);
      setVulling(sensor.vulgraad * (1 - Math.pow(1 - voortgang, 3)));
      if (voortgang < 1) frame = requestAnimationFrame(stap);
    }
    function directTonen() {
      if (voorkeur.matches) {
        cancelAnimationFrame(frame);
        setVulling(sensor.vulgraad);
      }
    }
    if (voorkeur.matches) directTonen();
    else frame = requestAnimationFrame(stap);
    voorkeur.addEventListener("change", directTonen);
    return () => {
      cancelAnimationFrame(frame);
      voorkeur.removeEventListener("change", directTonen);
    };
  }, [sensor.vulgraad]);

  // Voorbeeldsensor: de meting wordt niet kunstmatig vernieuwd.
  useEffect(() => {
    const start = Date.now() - 4 * 60000;
    const timer = window.setInterval(() => {
      setLaatstActief(Math.floor((Date.now() - start) / 60000));
      setVandaag(datumSleutel(new Date()));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  // ---------- 6. Planning en acties ----------
  const gesorteerd = [...gegevens.momenten].sort((a, b) =>
    `${a.datum}T${a.tijd}`.localeCompare(`${b.datum}T${b.tijd}`),
  );
  const komende = gesorteerd.filter((moment) => moment.datum >= vandaag);
  const volgende = komende[0];
  const omtrek = 2 * Math.PI * 78;

  function momentToevoegen(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormulierFout("");
    if (!geladen || !geldigeDatum(datum) || datum < vandaag) {
      setFormulierFout("Kies vandaag of een toekomstige datum.");
      return;
    }
    if (
      gegevens.momenten.some((moment) => moment.datum === datum && moment.soort === soort)
    ) {
      setFormulierFout("Deze afvalsoort staat op deze datum al in de kalender.");
      return;
    }
    setGegevens((vorige) => ({
      ...vorige,
      momenten: [
        ...vorige.momenten,
        { id: crypto.randomUUID(), soort, datum, tijd, bewoner, buitengezet: false },
      ],
    }));
    setMelding(
      `${soort} toegevoegd voor ${langeDatum(datum)}. ${bewoner} zet de bak buiten.`,
    );
  }

  function buitenzetten() {
    if (!volgende) return;
    setGegevens((vorige) => ({
      ...vorige,
      momenten: vorige.momenten.map((moment) =>
        moment.id === volgende.id
          ? { ...moment, buitengezet: !moment.buitengezet }
          : moment,
      ),
    }));
    setMelding(
      volgende.buitengezet
        ? "Buitenzetten weer als open gemarkeerd."
        : "Buitenzetten geregistreerd. Bedankt!",
    );
  }

  function probleemOpslaan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!geladen || !toelichting.trim()) return;
    setGegevens((vorige) => ({
      ...vorige,
      problemen: [
        ...vorige.problemen,
        {
          id: crypto.randomUUID(),
          onderwerp,
          tekst: toelichting.trim(),
          datum: new Date().toISOString(),
        },
      ],
    }));
    setToelichting("");
    setMelding(
      "Je probleem is op dit apparaat opgeslagen. Er is nog geen bericht naar de beheerder verstuurd.",
    );
    setVenster(null);
  }

  // ---------- 7. De zichtbare pagina ----------
  return (
    <main className="mx-auto w-full max-w-[1500px] p-4 font-poppins text-[#032747] sm:p-6 lg:p-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Afval<span className="text-[#FD7702]">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6687b0]">
            De juiste bak. Op het juiste moment.
          </p>
        </div>
        <span className="rounded-full border border-[#e3e2e0] bg-[#fcfaf7] px-4 py-2 text-xs">
          <span className="mr-2 inline-block size-2 rounded-full bg-[#FD7702]" />
          Samen houden we het netjes
        </span>
      </header>

      <p role="status" className="mb-3 text-sm leading-6 text-[#6687b0]">
        {melding}
      </p>
      {opslagFout && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-[#fff0df] p-4 text-sm text-[#853b00]"
        >
          {opslagFout}
        </p>
      )}

      {/* Bovenste rij: eerstvolgende moment links, één sensor rechts. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="relative flex min-h-[310px] flex-col overflow-hidden rounded-3xl bg-[#1D38FF] p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:translate-y-0 motion-reduce:transition-none sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border-[35px] border-white/5"
          />
          <div className="relative flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
              Eerstvolgende ophaalmoment
            </p>
            <CalendarDays size={22} />
          </div>
          {volgende ? (
            <>
              <h2 className="relative mt-6 text-3xl font-bold text-white sm:text-4xl">
                {volgende.soort}
              </h2>
              <p className="relative mt-3 text-lg font-medium text-white">
                {langeDatum(volgende.datum)}
              </p>
              <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/85">
                <span className="flex items-center gap-2">
                  <Clock3 size={16} />
                  Vóór {volgende.tijd}
                </span>
                <span className="flex items-center gap-2">
                  <UserRound size={16} />
                  {volgende.bewoner} zet de bak buiten
                </span>
              </div>
              <button
                onClick={buitenzetten}
                className={`${knop} relative mt-auto self-start bg-white text-[#1D38FF] hover:bg-[#e9eaff]`}
              >
                <Check size={17} />
                {volgende.buitengezet
                  ? "Buitengezet · ongedaan maken"
                  : "Bak staat buiten"}
              </button>
            </>
          ) : (
            <div className="my-auto py-8">
              <h2 className="text-2xl font-bold text-white">
                {geladen ? "Nog niets gepland" : "Planning laden…"}
              </h2>
              <p className="mt-3 text-sm text-white/80">
                Voeg hieronder een ophaalmoment toe.
              </p>
            </div>
          )}
        </section>

        <Card className="flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6687b0]">
                {sensor.soort}
              </p>
              <h2 className="mt-1 text-xl font-semibold">Jullie buitencontainer</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVenster("probleem")}
                aria-label="Probleem met container melden"
                title="Probleem melden"
                className={`${knop} !px-3 bg-[#fff0df] text-[#FD7702] hover:bg-[#ffe1be]`}
              >
                <Bell size={18} />
              </button>
              <button
                onClick={() => setVenster("sensor")}
                aria-label={`Sensorstatus: laatst actief ${laatstActief} minuten geleden`}
                title="Sensorstatus"
                className={`${knop} !px-3 bg-[#e9eaff] text-[#1D38FF] hover:bg-[#dce2ff]`}
              >
                <Radio size={18} />
              </button>
            </div>
          </div>
          <div className="my-auto flex flex-wrap items-center justify-center gap-5 py-2">
            <div className="relative w-52 shrink-0">
              <svg
                viewBox="0 0 200 200"
                className="w-full -rotate-90"
                role="img"
                aria-label={`Container voor ${sensor.vulgraad} procent gevuld`}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#eeeff1"
                  strokeWidth="17"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  fill="none"
                  stroke="#1D38FF"
                  strokeWidth="17"
                  strokeLinecap="round"
                  strokeDasharray={omtrek}
                  strokeDashoffset={omtrek * (1 - vulling / 100)}
                />
              </svg>
              <div
                aria-hidden="true"
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <strong className="text-4xl font-bold tabular-nums">
                  {Math.round(vulling)}%
                </strong>
                <span className="mt-1 text-xs text-[#6687b0]">gevuld</span>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e9eaff] px-3 py-2 text-xs font-semibold text-[#1D38FF]">
                <span className="size-1.5 rounded-full bg-[#1D38FF]" />
                Nog ruimte
              </span>
              <p className="mt-3 text-xs text-[#6687b0]">
                {100 - sensor.vulgraad}% beschikbaar
              </p>
            </div>
          </div>
          <button
            onClick={() => setVenster("sensor")}
            className="flex min-h-8 items-center justify-center gap-2 text-xs text-[#6687b0] transition hover:text-[#1D38FF]"
          >
            <Radio size={13} />
            Laatst actief {laatstActief} min geleden
            <ChevronRight size={13} />
          </button>
        </Card>

        {/* Onderste rij: beide kaarten lopen tot dezelfde onderrand. */}
        <Card className="flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6687b0]">
            Samen vooruitplannen
          </p>
          <h2 className="mt-2 text-xl font-semibold">Ophaalmoment toevoegen</h2>
          <p className="mt-2 text-sm leading-6 text-[#6687b0]">
            Spreek af welke bak naar buiten gaat en wie dat regelt.
          </p>
          <form onSubmit={momentToevoegen} className="mt-6 flex flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Welke bak?
                <select
                  value={soort}
                  onChange={(e) => setSoort(e.target.value as Afvalsoort)}
                  className={invoer}
                >
                  {SOORTEN.map((naam) => (
                    <option key={naam}>{naam}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Wie zet hem buiten?
                <select
                  value={bewoner}
                  onChange={(e) => setBewoner(e.target.value)}
                  className={invoer}
                >
                  {BEWONERS.map((naam) => (
                    <option key={naam}>{naam}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Ophaaldatum
                <input
                  type="date"
                  required
                  min={vandaag}
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className={invoer}
                />
              </label>
              <label className="text-sm font-medium">
                Buiten vóór
                <input
                  type="time"
                  required
                  value={tijd}
                  onChange={(e) => setTijd(e.target.value)}
                  className={invoer}
                />
              </label>
            </div>
            {formulierFout && (
              <p role="alert" className="text-sm text-[#a94700]">
                {formulierFout}
              </p>
            )}
            <button
              type="submit"
              disabled={!geladen}
              className={`${knop} mt-auto w-full bg-[#1D38FF] text-white hover:bg-[#1429ce]`}
            >
              <Plus size={18} />
              Ophaalmoment toevoegen
            </button>
          </form>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6687b0]">
                Goed geregeld
              </p>
              <h2 className="mt-2 text-xl font-semibold">Ophaalkalender</h2>
            </div>
            <CalendarDays size={22} className="text-[#1D38FF]" />
          </div>
          <div className="space-y-2">
            {komende.slice(0, 4).map((moment) => (
              <KalenderRij key={moment.id} moment={moment} />
            ))}
          </div>
          {geladen && komende.length === 0 && (
            <p className="py-8 text-sm text-[#6687b0]">
              Er staan nog geen ophaalmomenten gepland.
            </p>
          )}
          <button
            onClick={() => setVenster("kalender")}
            className={`${knop} mt-auto w-full justify-between !px-0 pt-5 text-[#1D38FF] hover:text-[#1429ce]`}
          >
            Volledige ophaalkalender
            <ArrowUpRight size={18} />
          </button>
        </Card>
      </div>

      {/* Eén toegankelijk venster: Escape sluit en focus blijft binnen het venster. */}
      <dialog
        ref={dialoog}
        onCancel={() => setVenster(null)}
        onClose={() => setVenster(null)}
        aria-labelledby="afval-venster-titel"
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-[#e3e2e0] bg-[#fcfaf7] p-6 text-[#032747] shadow-xl backdrop:bg-[#032747]/35 backdrop:backdrop-blur-sm sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="afval-venster-titel" className="text-xl font-bold">
            {venster === "kalender"
              ? "Volledige ophaalkalender"
              : venster === "sensor"
                ? "Jullie sensor"
                : "Probleem met de container"}
          </h2>
          <button
            onClick={() => setVenster(null)}
            aria-label="Sluiten"
            className={`${knop} !px-3 hover:bg-[#e9eaff]`}
          >
            <X size={20} />
          </button>
        </div>

        {venster === "kalender" && (
          <div>
            <p className="mb-5 text-sm leading-6 text-[#6687b0]">
              Alle ophaalmomenten en wie de bak buitenzet.
            </p>
            {gesorteerd.length === 0 && (
              <p className="text-sm text-[#6687b0]">Nog geen ophaalmomenten.</p>
            )}
            <div className="space-y-4">
              {gesorteerd.map((moment) => (
                <div key={moment.id}>
                  <p className="mb-2 text-xs text-[#6687b0]">
                    {langeDatum(moment.datum)} {moment.datum.slice(0, 4)}
                    {moment.datum < vandaag && " · Afgelopen"}
                  </p>
                  <KalenderRij moment={moment} />
                </div>
              ))}
            </div>
          </div>
        )}

        {venster === "sensor" && (
          <div>
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#e9eaff] p-4 text-[#1D38FF]">
              <Radio size={24} />
              <div>
                <p className="font-semibold">Sensor aangesloten</p>
                <p className="mt-1 text-xs">Laatst actief {laatstActief} min geleden</p>
              </div>
            </div>
            <dl className="space-y-4 text-sm">
              {[
                ["Container", sensor.naam],
                ["Afvalsoort", sensor.soort],
                ["Vulgraad", `${sensor.vulgraad}%`],
                ["Batterij", `${sensor.batterij}%`],
              ].map(([naam, waarde]) => (
                <div
                  key={naam}
                  className="flex justify-between gap-4 border-b border-[#e3e2e0] pb-3"
                >
                  <dt className="text-[#6687b0]">{naam}</dt>
                  <dd className="font-semibold">{waarde}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {venster === "probleem" && (
          <form onSubmit={probleemOpslaan} className="space-y-4">
            <label className="block text-sm font-medium">
              Wat is er aan de hand?
              <select
                className={invoer}
                value={onderwerp}
                onChange={(e) => setOnderwerp(e.target.value)}
              >
                {[
                  "Container beschadigd",
                  "Container niet geleegd",
                  "Sensor geeft een verkeerde waarde",
                  "Ander probleem",
                ].map((naam) => (
                  <option key={naam}>{naam}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Toelichting
              <textarea
                required
                maxLength={1000}
                rows={4}
                value={toelichting}
                onChange={(e) => setToelichting(e.target.value)}
                placeholder="Vertel kort wat er misgaat…"
                className={invoer}
              />
            </label>
            <button
              disabled={!geladen || !toelichting.trim()}
              type="submit"
              className={`${knop} w-full bg-[#1D38FF] text-white hover:bg-[#1429ce]`}
            >
              Probleem opslaan
              <ArrowUpRight size={17} />
            </button>
            {gegevens.problemen.length > 0 && (
              <div className="border-t border-[#e3e2e0] pt-4">
                <h3 className="mb-3 text-sm font-semibold">Eerder opgeslagen</h3>
                {[...gegevens.problemen]
                  .reverse()
                  .slice(0, 3)
                  .map((probleem) => (
                    <div key={probleem.id} className="mb-2 rounded-xl bg-[#f0f1f6] p-3">
                      <p className="text-xs font-semibold">{probleem.onderwerp}</p>
                      <p className="mt-1 break-words text-xs leading-5 text-[#6687b0]">
                        {probleem.tekst}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </form>
        )}
      </dialog>
    </main>
  );
}
