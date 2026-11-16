"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

// Plaats deze code in app/dashboard/takenlijst/page.tsx (of src/app/...).
// Vereist: Tailwind CSS en lucide-react, net als je boodschappenpagina.
// Registraties worden lokaal bewaard. Vervang dit door jullie API voor gedeelde data.

// ---------- 1. Types: welke gegevens we gebruiken ----------
type Categorie = "schoonmaak" | "huishoudelijk";
type Filter = "Alles" | "Mijn taken" | "Afgerond";
type Taak = {
  id: number;
  naam: string;
  ruimte: string;
  minuten: number;
  dag: number;
  bewoner: string;
  categorie: Categorie;
};
type Registratie = {
  id: string;
  taakId: number;
  naam: string;
  categorie: Categorie;
  bewoner: string;
  minuten: number;
  datum: string;
};
type Formulier = {
  taakId: number;
  naam: string;
  categorie: Categorie;
  bewoner: string;
  minuten: number;
  datum: string;
};

// ---------- 2. Bewoners en voorbeeldtaken ----------
// Pas hier de namen aan. De dag loopt van 0 (maandag) tot 6 (zondag).
const BEWONERS = ["Marvin", "Mila", "Jonas", "Sophie", "Emma", "Daan"];
const IK = "Marvin"; // Later vervangen door de ingelogde gebruiker.
const OPSLAG = "habico-takenregistraties-v1";
const TAKEN: Taak[] = [
  {
    id: 1,
    naam: "Keuken schoonmaken",
    ruimte: "Keuken · 18 m²",
    minuten: 30,
    dag: 0,
    bewoner: "Mila",
    categorie: "schoonmaak",
  },
  {
    id: 2,
    naam: "Woonkamer stofzuigen",
    ruimte: "Woonkamer · 32 m²",
    minuten: 40,
    dag: 2,
    bewoner: "Marvin",
    categorie: "schoonmaak",
  },
  {
    id: 3,
    naam: "Badkamer schoonmaken",
    ruimte: "Badkamer · 8 m²",
    minuten: 25,
    dag: 1,
    bewoner: "Sophie",
    categorie: "schoonmaak",
  },
  {
    id: 4,
    naam: "Gang dweilen",
    ruimte: "Gang · 12 m²",
    minuten: 20,
    dag: 4,
    bewoner: "Emma",
    categorie: "schoonmaak",
  },
  {
    id: 5,
    naam: "Hal poetsen",
    ruimte: "Hal · 10 m²",
    minuten: 20,
    dag: 5,
    bewoner: "Daan",
    categorie: "schoonmaak",
  },
  {
    id: 6,
    naam: "Vaatwasser uitruimen",
    ruimte: "Keuken",
    minuten: 10,
    dag: 0,
    bewoner: "Marvin",
    categorie: "huishoudelijk",
  },
  {
    id: 7,
    naam: "Gezamenlijke was ophangen",
    ruimte: "Wasruimte",
    minuten: 15,
    dag: 2,
    bewoner: "Mila",
    categorie: "huishoudelijk",
  },
  {
    id: 8,
    naam: "Planten water geven",
    ruimte: "Woonkamer",
    minuten: 5,
    dag: 4,
    bewoner: "Sophie",
    categorie: "huishoudelijk",
  },
  {
    id: 9,
    naam: "Voorraad controleren",
    ruimte: "Keuken",
    minuten: 10,
    dag: 6,
    bewoner: "Jonas",
    categorie: "huishoudelijk",
  },
];
// De twee submenu’s boven de agenda.
const CATEGORIEEN = [
  { id: "schoonmaak" as const, naam: "Schoonmaaktaken", Icon: Sparkles },
  { id: "huishoudelijk" as const, naam: "Huishoudelijke taken", Icon: Utensils },
];
// ---------- 3. Gedeelde opmaak voor knoppen en invoervelden ----------
const knop =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D38FF] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
const invoer =
  "mt-2 min-h-12 w-full rounded-xl border border-[#e3e2e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1D38FF] focus:ring-2 focus:ring-[#1D38FF]/15";

// ---------- 4. Kleine hulpfuncties ----------
// Zet een datum om naar YYYY-MM-DD voor het datumveld en de opslag.
function datumTekst(datum: Date) {
  return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, "0")}-${String(datum.getDate()).padStart(2, "0")}`;
}
// Verplaats een datum een aantal dagen vooruit of achteruit.
function plusDagen(datum: string, aantal: number) {
  const d = new Date(`${datum}T12:00:00`);
  d.setDate(d.getDate() + aantal);
  return datumTekst(d);
}
// Zoek de maandag van de week waarin deze datum valt.
function maandag(datum: string) {
  const d = new Date(`${datum}T12:00:00`);
  return plusDagen(datum, -((d.getDay() + 6) % 7));
}
// Maak een korte datum voor de agenda, bijvoorbeeld 9 nov.
function kortDatum(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}
// Controleer opgeslagen gegevens voordat we ze gebruiken.
function geldigeRegistratie(waarde: unknown): waarde is Registratie {
  if (!waarde || typeof waarde !== "object") return false;
  const r = waarde as Registratie;
  return (
    typeof r.id === "string" &&
    Number.isInteger(r.taakId) &&
    typeof r.naam === "string" &&
    (r.categorie === "schoonmaak" || r.categorie === "huishoudelijk") &&
    BEWONERS.includes(r.bewoner) &&
    Number.isInteger(r.minuten) &&
    r.minuten > 0 &&
    r.minuten <= 600 &&
    typeof r.datum === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.datum) &&
    !Number.isNaN(new Date(`${r.datum}T12:00:00`).getTime())
  );
}
// Herbruikbare kaart met dezelfde rand, achtergrond en ronde hoeken.
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-[#e3e2e0] bg-[#fcfaf7] p-5 sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

// ---------- 5. De pagina en haar instellingen ----------
export default function TakenlijstPage() {
  // De geselecteerde week, categorie en filter.
  const [vandaag, setVandaag] = useState("");
  const [week, setWeek] = useState("");
  const [categorie, setCategorie] = useState<Categorie>("schoonmaak");
  const [filter, setFilter] = useState<Filter>("Alles");

  // De opgeslagen minuten en eventuele melding voor de gebruiker.
  const [registraties, setRegistraties] = useState<Registratie[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [melding, setMelding] = useState("");

  // Welk venster openstaat: nieuwe registratie of bestaande bijdrage.
  const [formulier, setFormulier] = useState<Formulier | null>(null);
  const [detail, setDetail] = useState<Registratie | null>(null);
  const dialoog = useRef<HTMLDialogElement>(null);

  // ---------- 6. Gegevens laden en bewaren ----------
  // Lees de browseropslag pas nadat de pagina in de browser is geopend.
  useEffect(() => {
    const datum = datumTekst(new Date());
    setVandaag(datum);
    setWeek(maandag(datum));
    try {
      const opgeslagen: unknown = JSON.parse(localStorage.getItem(OPSLAG) ?? "[]");
      if (Array.isArray(opgeslagen))
        setRegistraties(opgeslagen.filter(geldigeRegistratie));
    } catch {
      setMelding("Eerdere registraties konden niet worden geladen.");
    }
    setGeladen(true);
  }, []);

  // Bewaar wijzigingen. Wacht totdat de eerdere gegevens zijn geladen.
  useEffect(() => {
    if (!geladen) return;
    try {
      localStorage.setItem(OPSLAG, JSON.stringify(registraties));
    } catch {
      setMelding(
        "Opslaan op dit apparaat lukt niet. Houd deze pagina open om je invoer te behouden.",
      );
    }
  }, [registraties, geladen]);

  // Open of sluit het venster wanneer de selectie verandert.
  useEffect(() => {
    if (formulier || detail) dialoog.current?.showModal();
    else dialoog.current?.close();
  }, [formulier, detail]);

  // ---------- 7. Minuten en voortgang berekenen ----------
  // Alleen registraties uit de geselecteerde week tellen mee.
  const dagen = week ? Array.from({ length: 7 }, (_, i) => plusDagen(week, i)) : [];
  const weekLogs = registraties.filter((r) => dagen.includes(r.datum));

  // Tel de geplande en geregistreerde minuten per categorie op.
  const doel = (soort: Categorie) =>
    TAKEN.filter((t) => t.categorie === soort).reduce((som, t) => som + t.minuten, 0);
  const gedaan = (soort: Categorie) =>
    weekLogs.filter((r) => r.categorie === soort).reduce((som, r) => som + r.minuten, 0);

  // Totalen voor het overzicht bovenaan.
  const schoonmaak = gedaan("schoonmaak");
  const huishoudelijk = gedaan("huishoudelijk");
  const totaal = schoonmaak + huishoudelijk;
  const weekDoel = doel("schoonmaak") + doel("huishoudelijk");
  const resterend = Math.max(0, weekDoel - totaal);
  const percentage = Math.round((totaal / weekDoel) * 100);

  // Zet minuten om naar de lengte van de twee blauwe cirkelsegmenten.
  // Bij meer minuten dan het weekdoel blijft de cirkel maximaal gevuld.
  const omtrek = 2 * Math.PI * 84;
  const schaal = Math.max(weekDoel, totaal, 1);
  const segment1 = (schoonmaak / schaal) * omtrek;
  const segment2 = (huishoudelijk / schaal) * omtrek;

  // Bereken de bijdrage per bewoner voor “Eerlijk verdeeld”.
  const bewonersMinuten = BEWONERS.map((naam) => ({
    naam,
    minuten: weekLogs
      .filter((r) => r.bewoner === naam)
      .reduce((som, r) => som + r.minuten, 0),
  }));
  const hoogsteBijdrage = Math.max(1, ...bewonersMinuten.map((b) => b.minuten));

  // Bepaal welke taken nog openstaan en welke bij het filter passen.
  const openTaken = TAKEN.filter(
    (t) => t.categorie === categorie && !weekLogs.some((r) => r.taakId === t.id),
  );
  const onderhoud = openTaken.filter(
    (t) => plusDagen(week || vandaag || "2026-01-01", t.dag) <= vandaag,
  ).length;
  const zichtbareTaken = openTaken.filter(
    (t) => filter !== "Afgerond" && (filter !== "Mijn taken" || t.bewoner === IK),
  );
  const zichtbareLogs = weekLogs.filter(
    (r) => r.categorie === categorie && (filter !== "Mijn taken" || r.bewoner === IK),
  );

  // ---------- 8. Registraties toevoegen en vensters sluiten ----------
  // Vul bekende taakgegevens alvast in. Een toekomstige datum wordt vandaag.
  function openen(datum = vandaag, taak?: Taak) {
    setDetail(null);
    setFormulier({
      taakId: taak?.id ?? 0,
      naam: taak?.naam ?? "",
      categorie: taak?.categorie ?? categorie,
      bewoner: IK,
      minuten: taak?.minuten ?? 15,
      datum: datum > vandaag ? vandaag : datum,
    });
  }

  // Maak beide selecties leeg om het venster te sluiten.
  function sluiten() {
    setFormulier(null);
    setDetail(null);
  }

  // Controleer de invoer, voeg de bijdrage toe en toon de juiste week.
  function opslaan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !formulier ||
      !formulier.naam.trim() ||
      formulier.datum > vandaag ||
      !formulier.datum ||
      !Number.isInteger(formulier.minuten) ||
      formulier.minuten < 1 ||
      formulier.minuten > 600
    )
      return;
    setRegistraties((vorige) => [
      ...vorige,
      { ...formulier, naam: formulier.naam.trim(), id: crypto.randomUUID() },
    ]);
    setWeek(maandag(formulier.datum));
    setCategorie(formulier.categorie);
    setMelding(`${formulier.minuten} minuten geregistreerd voor ${formulier.bewoner}.`);
    sluiten();
  }

  // ---------- 9. De zichtbare onderdelen van de pagina ----------
  return (
    <main className="font-poppins mx-auto w-full max-w-[1600px] p-4 text-[#032747] sm:p-6 lg:p-10">
      {/* Paginatitel en knop om minuten toe te voegen. */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Takenlijst<span className="text-[#FD7702]">.</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6687b0]">
            Jullie inzet, overzichtelijk op één plek.
          </p>
        </div>
        <button
          disabled={!geladen}
          onClick={() => openen()}
          className={`${knop} bg-[#1D38FF] text-white hover:bg-[#1429ce]`}
        >
          <Plus size={18} /> Minuten registreren
        </button>
      </header>
      {/* Bevestigingen en meldingen over opslaan. */}
      <p role="status" className="mb-3 text-sm text-[#6687b0]">
        {melding}
      </p>

      {/* Weekoverzicht: totalen, cirkeldiagram en bijdragen per bewoner. */}
      <Card className="hidden items-center gap-8 sm:grid xl:grid-cols-[0.9fr_1.3fr_0.9fr]">
        <div>
          <h2 className="max-w-xs text-3xl leading-tight font-bold">
            Elke minuut maakt verschil<span className="text-[#FD7702]">.</span>
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-7 text-[#6687b0]">
            Samen zorgen we voor een fijn huis. Vul in wat je deze week hebt gedaan.
          </p>
          <p className="mt-6">
            <strong className="text-4xl tracking-tight">{totaal}</strong>
            <span className="ml-2 text-sm text-[#6687b0]">van {weekDoel} min</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-[#FD7702]">
            {resterend > 0 ? `${resterend} minuten samen te gaan` : 'Weekdoel behaald!'}
          </p>
        </div>
        {/* Legenda links van het cirkeldiagram. */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
          <div className="flex shrink-0 flex-col gap-5 text-xs">
            {[
              { naam: 'Schoonmaak', min: schoonmaak, kleur: '#1D38FF' },
              { naam: 'Huishoudelijk', min: huishoudelijk, kleur: '#7f91ff' },
              { naam: 'Resterend', min: resterend, kleur: '#dedfe3' },
            ].map((item) => (
              <div key={item.naam}>
                <span className="flex items-center gap-2 text-[#6687b0]">
                  <span className="size-2 rounded-full" style={{ background: item.kleur }} />
                  {item.naam}
                </span>
                <strong className="mt-1 ml-4 block text-base">{item.min} min</strong>
              </div>
            ))}
          </div>
          {/* Grijze basisring met twee blauwe segmenten voor de minuten. */}
          <div className="relative w-full max-w-[290px] min-w-0">
            <svg
              viewBox="0 0 240 240"
              className="w-full -rotate-90"
              role="img"
              aria-label={`${percentage} procent van het weekdoel: ${totaal} van ${weekDoel} minuten`}
            >
              <circle cx="120" cy="120" r="84" fill="none" stroke="#eeeff1" strokeWidth="24" />
              <circle
                cx="120"
                cy="120"
                r="84"
                fill="none"
                stroke="#1D38FF"
                strokeWidth="24"
                strokeDasharray={`${segment1} ${omtrek}`}
                className="transition-all duration-700 motion-reduce:transition-none"
              />
              <circle
                cx="120"
                cy="120"
                r="84"
                fill="none"
                stroke="#7f91ff"
                strokeWidth="24"
                strokeDasharray={`${segment2} ${omtrek}`}
                strokeDashoffset={-segment1}
                className="transition-all duration-700 motion-reduce:transition-none"
              />
            </svg>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            >
              <strong className="text-4xl font-bold">{percentage}%</strong>
              <span className="mt-2 text-xs text-[#6687b0]">van jullie weekdoel</span>
            </div>
          </div>
        </div>
        {/* Bij nul minuten verschijnt een oranje belletje. */}
        <div className="xl:border-l xl:border-[#e3e2e0] xl:pl-7">
          <p className="text-[10px] tracking-[0.18em] text-[#6687b0] uppercase">
            Iedereen draagt bij
          </p>
          <h2 className="mt-2 mb-5 text-xl font-semibold">Eerlijk verdeeld</h2>
          <div className="space-y-4">
            {bewonersMinuten.map((b) => (
              <div key={b.naam}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>
                    {b.naam}
                    {b.naam === IK && ' · jij'}
                  </span>
                  <span className="flex items-center gap-2 text-[#6687b0]">
                    {b.minuten === 0 && (
                      <span
                        title="Nog geen minuten geregistreerd"
                        aria-label="Nog geen minuten geregistreerd"
                      >
                        <Bell size={14} className="text-[#FD7702]" />
                      </span>
                    )}
                    {b.minuten} min
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e9eaff]">
                  <div
                    className="h-full rounded-full bg-[#1D38FF] transition-all duration-700 motion-reduce:transition-none"
                    style={{ width: `${(b.minuten / hoogsteBijdrage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Submenu’s: schoonmaaktaken en huishoudelijke taken. */}
      <div aria-label="Taakcategorie" className="my-5 hidden gap-3 sm:grid sm:grid-cols-2">
        {CATEGORIEEN.map(({ id, naam, Icon }) => (
          <button
            key={id}
            onClick={() => setCategorie(id)}
            aria-pressed={categorie === id}
            className={`flex min-h-24 items-center gap-4 rounded-2xl border p-5 text-left transition duration-300 motion-reduce:transition-none ${categorie === id ? 'border-[#1D38FF] bg-[#1D38FF] text-white shadow-lg shadow-[#1D38FF]/10' : 'border-[#e3e2e0] bg-[#fcfaf7] hover:border-[#1D38FF]/40'}`}
          >
            <Icon size={23} className="shrink-0" />
            <span className="flex-1">
              <strong className="block text-sm sm:text-base">{naam}</strong>
              <span
                className={`mt-1 block text-xs ${categorie === id ? 'text-white/75' : 'text-[#6687b0]'}`}
              >
                {gedaan(id)} van {doel(id)} min
              </span>
            </span>
            <strong className="text-lg">{Math.round((gedaan(id) / doel(id)) * 100)}%</strong>
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {/* Agenda over de volledige breedte van de pagina. */}
        <Card className="order-2 mt-4 sm:order-none sm:mt-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Jullie weekagenda</h2>
              <p className="mt-2 text-xs text-[#6687b0]">
                <span className="font-semibold text-[#FD7702]">{onderhoud}</span>{' '}
                {onderhoud === 1 ? 'taak heeft' : 'taken hebben'} onderhoud nodig
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <button
                disabled={!geladen}
                aria-label="Vorige week"
                className={`${knop} border border-[#e3e2e0] !px-3 hover:bg-[#e9eaff]`}
                onClick={() => setWeek(plusDagen(week, -7))}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-0 flex-1 text-center text-xs font-semibold sm:min-w-40 sm:text-sm">
                {week
                  ? `${kortDatum(week)} – ${kortDatum(plusDagen(week, 6))} ${new Date(`${plusDagen(week, 6)}T12:00:00`).getFullYear()}`
                  : 'Laden…'}
              </span>
              <button
                disabled={!geladen}
                aria-label="Volgende week"
                className={`${knop} border border-[#e3e2e0] !px-3 hover:bg-[#e9eaff]`}
                onClick={() => setWeek(plusDagen(week, 7))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {/* Filter de agenda op alle, eigen of afgeronde taken. */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e2e0] pt-5">
            <h3 className="text-base font-semibold">
              {CATEGORIEEN.find((c) => c.id === categorie)?.naam}
            </h3>
            <div className="flex rounded-xl bg-[#eeeff5] p-1" aria-label="Takenfilter">
              {(['Alles', 'Mijn taken', 'Afgerond'] as Filter[]).map((optie) => (
                <button
                  key={optie}
                  aria-pressed={filter === optie}
                  onClick={() => setFilter(optie)}
                  className={`${knop} !min-h-9 !px-3 !text-xs ${filter === optie ? 'bg-white text-[#1D38FF] shadow-sm' : 'text-[#6687b0] hover:text-[#032747]'}`}
                >
                  {optie}
                </button>
              ))}
            </div>
          </div>
          {/* Op kleine schermen kan de agenda horizontaal scrollen. */}
          <div
            className="overflow-x-auto overscroll-x-contain rounded-2xl border border-[#e3e2e0]"
            tabIndex={0}
            aria-label="Weekagenda, horizontaal scrollbaar"
          >
            <div className="grid min-w-[1015px] grid-cols-[62px_repeat(7,minmax(136px,1fr))]">
              {/* Bovenste rij: de zeven dagen van de week. */}
              <div className="border-b border-[#e3e2e0] bg-white/60" />
              {dagen.map((dag, i) => (
                <div
                  key={dag}
                  className={`border-b border-l border-[#e3e2e0] p-3 text-center ${dag === vandaag ? 'bg-[#e9eaff] text-[#1D38FF]' : 'bg-white/60'}`}
                >
                  <span className="block text-[11px] text-[#6687b0]">
                    {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'][i]}
                  </span>
                  <strong className="mt-1 block text-lg">{Number(dag.slice(-2))}</strong>
                </div>
              ))}
              {/* Oranje kaarten: taken die deze week nog openstaan. */}
              <div className="border-b border-[#e3e2e0] px-2 py-4 text-[10px] font-semibold text-[#6687b0]">
                Te doen
              </div>
              {dagen.map((dag, i) => (
                <div
                  key={`open-${dag}`}
                  className="min-h-[120px] space-y-2 border-b border-l border-[#e3e2e0] p-2 sm:min-h-[170px]"
                >
                  {zichtbareTaken
                    .filter((t) => t.dag === i)
                    .map((taak) => (
                      <button
                        key={taak.id}
                        onClick={() => openen(dag, taak)}
                        title="Uitgevoerde taak registreren"
                        className="w-full rounded-xl border border-[#FD7702]/15 bg-[#fff0df] p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-[#1D38FF] motion-reduce:transform-none"
                      >
                        <strong className="block text-xs leading-5">{taak.naam}</strong>
                        <span className="mt-2 flex items-center gap-1 text-[11px] text-[#a46a2d]">
                          <Clock3 size={12} />
                          {taak.minuten} min
                        </span>
                        <span className="mt-3 block text-[10px] text-[#6687b0]">
                          {taak.bewoner}
                          {taak.bewoner === IK && ' · jij'}
                        </span>
                      </button>
                    ))}
                </div>
              ))}
              {/* Blauwe kaarten: geregistreerde bijdragen per dag. */}
              <div className="px-2 py-4 text-[10px] font-semibold text-[#6687b0]">Gedaan</div>
              {dagen.map((dag) => (
                <div
                  key={`klaar-${dag}`}
                  className="flex min-h-[120px] flex-col gap-2 border-l border-[#e3e2e0] p-2 sm:min-h-[160px]"
                >
                  {zichtbareLogs
                    .filter((r) => r.datum === dag)
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setFormulier(null);
                          setDetail(r);
                        }}
                        className="w-full rounded-xl bg-[#e9eaff] p-3 text-left transition hover:bg-[#dfe2ff] focus-visible:outline-[#1D38FF]"
                      >
                        <Check size={14} className="mb-2 text-[#1D38FF]" />
                        <strong className="block text-xs leading-5">{r.naam}</strong>
                        <span className="mt-2 block text-[11px] text-[#1D38FF]">
                          {r.minuten} min · {r.bewoner}
                        </span>
                      </button>
                    ))}
                  <button
                    disabled={dag > vandaag}
                    aria-label={`Minuten registreren op ${kortDatum(dag)}`}
                    onClick={() => openen(dag)}
                    className="mt-auto flex min-h-9 items-center justify-center rounded-lg text-[#6687b0] transition hover:bg-[#e9eaff] hover:text-[#1D38FF] disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#6687b0]">
            Klik op een taak of op + om je minuten te registreren. Iedere bijdrage telt mee.
          </p>
        </Card>

        {/* Alleen mobiel: vier even grote kaarten boven de agenda, in twee kolommen.
          Vanaf 640 px blijft de bestaande desktopindeling zichtbaar.
          Logo en navigatie komen uit jullie bestaande layout. */}
        <section
          aria-label="Jullie week in het kort"
          className="order-1 mt-4 grid auto-rows-fr grid-cols-2 items-stretch gap-3 pb-6 sm:hidden"
        >
          {/* Linksboven: het gezamenlijke weekdoel in minuten. */}
          <div className="min-w-0 rounded-[28px] bg-[#fcfaf7] p-4">
            <h2 className="text-sm leading-5 font-semibold">Jullie weekdoel</h2>
            <div className="relative mx-auto mt-2 w-full max-w-28">
              <svg
                viewBox="0 0 240 240"
                className="w-full -rotate-90"
                role="img"
                aria-label={`${totaal} van ${weekDoel} minuten, ${percentage} procent`}
              >
                <circle cx="120" cy="120" r="84" fill="none" stroke="#eeeff1" strokeWidth="22" />
                <circle
                  cx="120"
                  cy="120"
                  r="84"
                  fill="none"
                  stroke="#1D38FF"
                  strokeWidth="22"
                  strokeDasharray={`${segment1} ${omtrek}`}
                  className="transition-all duration-700 motion-reduce:transition-none"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="84"
                  fill="none"
                  stroke="#7f91ff"
                  strokeWidth="22"
                  strokeDasharray={`${segment2} ${omtrek}`}
                  strokeDashoffset={-segment1}
                  className="transition-all duration-700 motion-reduce:transition-none"
                />
              </svg>
              <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <strong className="text-2xl">{percentage}%</strong>
              </div>
            </div>
            <p className="text-center text-xs leading-5 text-[#6687b0]">
              <strong className="text-[#032747]">{totaal}</strong> van {weekDoel} min
            </p>
          </div>

          {/* Rechtsboven: blauwe schoonmaakkaart. Linksonder: huishoudelijke kaart.
            Beide knoppen wisselen de categorie van dezelfde agenda. */}
          {CATEGORIEEN.map(({ id, naam, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={categorie === id}
              onClick={() => setCategorie(id)}
              className={`relative flex min-h-52 min-w-0 flex-col items-start rounded-[28px] p-4 text-left text-white transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#032747] motion-reduce:transition-none ${
                id === 'schoonmaak' ? 'bg-[#1D38FF]' : 'bg-[#FD7702]'
              }`}
            >
              <span className="max-w-full pr-4 text-sm leading-5 font-semibold [overflow-wrap:anywhere]">
                {naam}
              </span>
              {categorie === id && (
                <Check size={15} aria-hidden="true" className="absolute top-4 right-3" />
              )}
              <Icon size={52} strokeWidth={1.5} aria-hidden="true" className="my-5 self-center" />
              <span className="mt-auto text-xs leading-5 text-white/90">
                {gedaan(id)} van {doel(id)} min
              </span>
              <span className="text-xs font-semibold">
                {Math.max(0, doel(id) - gedaan(id))} min te gaan
              </span>
            </button>
          ))}

          {/* Rechtsonder: compacte bijdragen met een belletje bij nul minuten. */}
          <div className="min-w-0 rounded-[28px] bg-[#fcfaf7] p-3">
            <h2 className="mb-2 text-sm leading-5 font-semibold">Eerlijk verdeeld</h2>
            <div className="space-y-1">
              {bewonersMinuten.map((bewoner) => (
                <div key={bewoner.naam}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-[10px] leading-3">
                    <span>
                      {bewoner.naam}
                      {bewoner.naam === IK && ' · jij'}
                    </span>
                    <span className="flex items-center gap-1 text-[#6687b0]">
                      {bewoner.minuten === 0 && (
                        <span aria-label="Nog geen minuten geregistreerd">
                          <Bell size={11} className="text-[#FD7702]" />
                        </span>
                      )}
                      {bewoner.minuten} min
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[#e9eaff]">
                    <div
                      className="h-full rounded-full bg-[#1D38FF] transition-all duration-700 motion-reduce:transition-none"
                      style={{ width: `${(bewoner.minuten / hoogsteBijdrage) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Native dialog: focus blijft in het venster; Escape sluit het. */}
      <dialog
        ref={dialoog}
        onCancel={sluiten}
        onClose={sluiten}
        aria-labelledby="registratie-titel"
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[#e3e2e0] bg-[#fcfaf7] p-6 text-[#032747] shadow-2xl backdrop:bg-[#032747]/35 backdrop:backdrop-blur-sm sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id="registratie-titel" className="text-xl font-bold">
            {detail ? 'Geregistreerde bijdrage' : 'Wat heb je gedaan?'}
          </h2>
          <button
            onClick={sluiten}
            aria-label="Sluiten"
            className={`${knop} !px-3 hover:bg-[#e9eaff]`}
          >
            <X size={20} />
          </button>
        </div>
        {/* Formulier voor een bekende taak of een eigen bijdrage. */}
        {formulier && (
          <form onSubmit={opslaan} className="space-y-4">
            <label className="block text-sm font-medium">
              Taak kiezen
              <select
                className={invoer}
                value={formulier.taakId}
                onChange={(e) => {
                  const taak = TAKEN.find((t) => t.id === Number(e.target.value));
                  setFormulier({
                    ...formulier,
                    taakId: taak?.id ?? 0,
                    naam: taak?.naam ?? '',
                    minuten: taak?.minuten ?? 15,
                    categorie: taak?.categorie ?? categorie,
                  });
                }}
              >
                <option value={0}>Andere bijdrage</option>
                {CATEGORIEEN.map((c) => (
                  <optgroup key={c.id} label={c.naam}>
                    {TAKEN.filter((t) => t.categorie === c.id).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.naam}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {formulier.taakId === 0 && (
              <>
                <label className="block text-sm font-medium">
                  Wat heb je gedaan?
                  <input
                    required
                    maxLength={80}
                    className={invoer}
                    placeholder="Bijvoorbeeld: oven schoongemaakt"
                    value={formulier.naam}
                    onChange={(e) => setFormulier({ ...formulier, naam: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Categorie
                  <select
                    className={invoer}
                    value={formulier.categorie}
                    onChange={(e) =>
                      setFormulier({
                        ...formulier,
                        categorie: e.target.value as Categorie,
                      })
                    }
                  >
                    {CATEGORIEEN.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.naam}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Uitgevoerd op
                <input
                  type="date"
                  required
                  max={vandaag}
                  className={invoer}
                  value={formulier.datum}
                  onChange={(e) => setFormulier({ ...formulier, datum: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Minuten
                <input
                  type="number"
                  required
                  min={1}
                  max={600}
                  step={1}
                  className={invoer}
                  value={formulier.minuten || ''}
                  onChange={(e) => setFormulier({ ...formulier, minuten: Number(e.target.value) })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Uitgevoerd door
              <select
                className={invoer}
                value={formulier.bewoner}
                onChange={(e) => setFormulier({ ...formulier, bewoner: e.target.value })}
              >
                {BEWONERS.map((naam) => (
                  <option key={naam}>{naam}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className={`${knop} mt-2 w-full bg-[#1D38FF] text-white hover:bg-[#1429ce]`}
            >
              <Check size={17} /> Uitgevoerde taak opslaan
            </button>
          </form>
        )}
        {/* Details bekijken of één registratie ongedaan maken. */}
        {detail && (
          <div>
            <h3 className="text-lg font-semibold">{detail.naam}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6687b0]">
              {detail.bewoner} · {detail.minuten} minuten
              <br />
              {kortDatum(detail.datum)} {detail.datum.slice(0, 4)}
            </p>
            <button
              className={`${knop} mt-6 w-full border border-[#FD7702]/25 text-[#bc5500] hover:bg-[#fff0df]`}
              onClick={() => {
                setRegistraties((vorige) => vorige.filter((r) => r.id !== detail.id));
                setMelding('Registratie ongedaan gemaakt.');
                sluiten();
              }}
            >
              Registratie ongedaan maken
            </button>
          </div>
        )}
      </dialog>
    </main>
  );
}
