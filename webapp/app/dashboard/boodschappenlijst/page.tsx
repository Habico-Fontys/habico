"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  ShoppingCart,
  Tag,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import AanbiedingenBanner from "../../../components/AanbiedingenBanner";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { useLocalization } from "@/components/LocalizationProvider";
import { euro } from "../_lib/euro";
import {
  BEGIN_BOODSCHAPPEN_DATA,
  BOODSCHAPPEN_OPSLAG,
  isBoodschappenData,
} from "./data";
import { HUISNAAM } from "../huisgenoten/data";

type Sectie = "lijst" | "budget" | "inleg" | "aanbiedingen";

// ---------- Hulpfuncties (buiten de component) ----------
const initialen = (naam: string) => naam.slice(0, 2).toUpperCase();

// ---------- Herbruikbare onderdelen ----------
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-[var(--line)] bg-habico-white p-4 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function Avatar({ naam }: { naam: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fire-orange/15 text-sm font-semibold text-fire-orange"
    >
      {initialen(naam)}
    </span>
  );
}

// ---------- De pagina ----------
export default function BoodschappenlijstPage() {
  const { locale } = useLocalization();
  const [boodschappen, setBoodschappen] = useLocalStorageValue(
    BOODSCHAPPEN_OPSLAG,
    BEGIN_BOODSCHAPPEN_DATA,
    isBoodschappenData,
  );
  const { producten, bewoners, inleg, voorstel } = boodschappen;
  const [huidigeGebruikerId, setHuidigeGebruikerId] = useState(1);

  // Formulier
  const [toonFormulier, setToonFormulier] = useState(false);
  const [naam, setNaam] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [prijsTekst, setPrijsTekst] = useState("");
  const [aanbieding, setAanbieding] = useState("");
  const [nieuwBedragTekst, setNieuwBedragTekst] = useState("");
  const [openSectie, setOpenSectie] = useState<Sectie | null>(null);

  // ---------- Berekende waarden ----------
  const ingelegd = bewoners.reduce((t, b) => t + b.betaaldBedrag, 0);
  const uitgegeven = producten
    .filter((p) => p.gekocht)
    .reduce((t, p) => t + p.prijs, 0);
  const over = ingelegd - uitgegeven;
  const budgetPercentage =
    ingelegd > 0 ? Math.min((uitgegeven / ingelegd) * 100, 100) : 0;

  const nogNodig = producten.filter((p) => !p.gekocht);
  const nogOpDeLijst = nogNodig.reduce((t, p) => t + p.prijs, 0);
  // Niet-gekochte bovenaan. Eerst kopiëren, want sort() past de lijst zelf aan.
  const gesorteerd = [...producten].sort(
    (a, b) => Number(a.gekocht) - Number(b.gekocht)
  );

  const aantalBetaald = bewoners.filter((b) => b.betaaldBedrag > 0).length;
  const ikHebGoedgekeurd =
    voorstel?.goedgekeurdDoor.includes(huidigeGebruikerId) ?? false;
  const huidigeNaam =
    bewoners.find((b) => b.id === huidigeGebruikerId)?.naam ?? "Onbekend";

  function sectieWisselen(sectie: Sectie) {
    setOpenSectie((huidig) => (huidig === sectie ? null : sectie));
  }

  // ---------- Functies: producten ----------
  function productToevoegen(e: React.FormEvent) {
    e.preventDefault();
    if (naam.trim() === "") return;

    const product = {
      id: Date.now(),
      naam: naam.trim(),
      omschrijving: omschrijving.trim(),
      prijs: Number(prijsTekst) || 0,
      aanbieding: aanbieding.trim(),
      gekocht: false,
      toegevoegdDoor: huidigeNaam,
    };
    setBoodschappen((current) => ({
      ...current,
      producten: [...current.producten, product],
    }));
    setNaam("");
    setOmschrijving("");
    setPrijsTekst("");
    setAanbieding("");
    setToonFormulier(false);
  }

  function gekochtWisselen(id: number) {
    setBoodschappen((current) => ({
      ...current,
      producten: current.producten.map((product) =>
        product.id === id ? { ...product, gekocht: !product.gekocht } : product,
      ),
    }));
  }

  function productVerwijderen(id: number) {
    setBoodschappen((current) => ({
      ...current,
      producten: current.producten.filter((product) => product.id !== id),
    }));
  }

  // ---------- Functies: inleg en voorstel (uit vorige stap) ----------
  function inlegBetalen(id: number) {
    setBoodschappen((current) => ({
      ...current,
      bewoners: current.bewoners.map((bewoner) =>
        bewoner.id === id
          ? { ...bewoner, betaaldBedrag: current.inleg }
          : bewoner,
      ),
    }));
  }

  function voorstelDoen(e: React.FormEvent) {
    e.preventDefault();
    const bedrag = Number(nieuwBedragTekst);
    if (!Number.isFinite(bedrag) || bedrag <= 0 || bedrag === inleg) return;
    setBoodschappen((current) => ({
      ...current,
      voorstel: { nieuwBedrag: bedrag, goedgekeurdDoor: [huidigeGebruikerId] },
    }));
    setNieuwBedragTekst("");
  }

  function goedkeuren() {
    if (!voorstel || ikHebGoedgekeurd) return;
    setBoodschappen((current) => {
      if (
        !current.voorstel ||
        current.voorstel.goedgekeurdDoor.includes(huidigeGebruikerId)
      ) {
        return current;
      }
      const goedgekeurdDoor = [
        ...current.voorstel.goedgekeurdDoor,
        huidigeGebruikerId,
      ];
      return goedgekeurdDoor.length === current.bewoners.length
        ? { ...current, inleg: current.voorstel.nieuwBedrag, voorstel: null }
        : {
            ...current,
            voorstel: { ...current.voorstel, goedgekeurdDoor },
          };
    });
  }

  function afwijzen() {
    setBoodschappen((current) => ({ ...current, voorstel: null }));
  }

  // ---------- Weergave ----------
  return (
    <main className="mx-auto max-w-6xl p-4 font-poppins text-[var(--ink)] sm:p-6 lg:p-10">
      {/* Kop van de pagina */}
      <header className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-orange">
            {HUISNAAM} · Samen thuis
          </p>
          <h1 className="mt-2 text-3xl font-bold text-habico-navy sm:text-4xl">
            Boodschappen<span className="text-fire-orange">.</span>
          </h1>
          <p className="mt-1 text-sm text-habico-blue/70 sm:text-base">
            Alleen wat we samen gebruiken. Samen geregeld.
          </p>
        </div>

        <button
          onClick={() => setToonFormulier(!toonFormulier)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-tangy-blue px-5 py-3 font-semibold text-white transition hover:bg-habico-navy sm:w-auto"
        >
          {toonFormulier ? <X size={18} /> : <Plus size={18} />}
          {toonFormulier ? "Sluiten" : "Product toevoegen"}
        </button>
      </header>

{/* Formulier ... */}

      <section aria-label="Boodschappenoverzicht" className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
        {[
          {
            id: "lijst" as const,
            label: "Mijn lijst",
            value: nogNodig.length,
            detail: nogNodig.length === 1 ? "product nodig" : "producten nodig",
            accent: "bg-habico-soft-blue text-tangy-blue",
            icon: <ShoppingCart size={24} strokeWidth={2} />,
          },
          {
            id: "budget" as const,
            label: "Beschikbaar",
            value: euro(over, locale),
            detail: `${euro(uitgegeven, locale)} uitgegeven`,
            accent: "bg-tangy-blue text-white",
            icon: <WalletCards size={24} strokeWidth={2} />,
          },
          {
            id: "inleg" as const,
            label: "Maandelijkse inleg",
            value: euro(inleg, locale),
            detail: `${aantalBetaald} van ${bewoners.length} betaald`,
            accent: "bg-habico-landing text-habico-navy",
            icon: <UsersRound size={24} strokeWidth={2} />,
          },
          {
            id: "aanbiedingen" as const,
            label: "Aanbiedingen",
            value: "Slim inkopen",
            detail: "Bekijk supermarkten",
            accent: "bg-fire-orange text-habico-navy-dark",
            icon: <Tag size={24} strokeWidth={2} />,
          },
        ].map((tegel) => {
          const geopend = openSectie === tegel.id;
          return (
            <button
              key={tegel.id}
              type="button"
              onClick={() => sectieWisselen(tegel.id)}
              aria-expanded={geopend}
              className={`min-h-36 rounded-3xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-40 sm:p-5 ${tegel.accent} ${
                geopend ? "ring-2 ring-habico-navy ring-offset-2" : ""
              }`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {tegel.icon}
                </span>
                <span className="text-lg leading-none" aria-hidden="true">
                  {geopend ? "−" : "+"}
                </span>
              </span>
              <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
                {tegel.label}
              </span>
              <span className="mt-1 block truncate text-lg font-bold sm:text-xl">
                {tegel.value}
              </span>
              <span className="mt-1 block truncate text-xs opacity-70">
                {tegel.detail}
              </span>
            </button>
          );
        })}
      </section>

      <div className="hidden sm:block">
        <AanbiedingenBanner />
      </div>
      {openSectie === "aanbiedingen" && (
        <div className="sm:hidden">
          <AanbiedingenBanner />
        </div>
      )}

      {/* Formulier (alleen zichtbaar na klik) */}
      {toonFormulier && (
        <Card className="mt-6 p-4 sm:p-6">
          <form onSubmit={productToevoegen} className="grid gap-3 sm:grid-cols-2">
            <input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="Product, bijv. toiletpapier"
              className="rounded-xl border border-habico-grey bg-white p-3"
              required
            />
            <input
              value={omschrijving}
              onChange={(e) => setOmschrijving(e.target.value)}
              placeholder="Hoeveelheid, bijv. 12 rollen"
              className="rounded-xl border border-habico-grey bg-white p-3"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={prijsTekst}
              onChange={(e) => setPrijsTekst(e.target.value)}
              placeholder="Verwachte prijs in €"
              className="rounded-xl border border-habico-grey bg-white p-3"
            />
            <input
              value={aanbieding}
              onChange={(e) => setAanbieding(e.target.value)}
              placeholder="Aanbieding (optioneel)"
              className="rounded-xl border border-habico-grey bg-white p-3"
            />
            <button
              type="submit"
              className="rounded-xl bg-habico-orange px-5 py-3 font-semibold text-white transition hover:bg-habico-orange-red sm:col-span-2"
            >
              Toevoegen aan de lijst
            </button>
          </form>
        </Card>
      )}

      {/* Details van de gekozen tegel */}
      <div
        className={`mt-8 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] ${
          openSectie && openSectie !== "aanbiedingen" ? "grid" : "hidden"
        } sm:grid`}
      >
        {/* Linker kolom: de lijst */}
        <Card
          className={`p-4 sm:p-6 ${
            openSectie === "lijst" ? "block" : "hidden"
          } sm:block`}
        >
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Voor het hele huis
              </p>
              <h2 className="mt-1 text-xl font-medium text-habico-navy">
                Gezamenlijke boodschappenlijst
              </h2>
            </div>
            <span className="rounded-full bg-habico-grey/50 px-3 py-1 text-xs font-semibold text-habico-navy">
              {nogNodig.length} nodig
            </span>
          </div>

          {producten.length === 0 && (
            <p className="mt-6 rounded-2xl bg-habico-landing p-6 text-center text-[var(--muted)]">
              De lijst is leeg. Voeg iets toe met de knop rechtsboven.
            </p>
          )}

          <ul className="mt-6 divide-y divide-[var(--line)]">
            {gesorteerd.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 py-4 sm:flex sm:items-center sm:gap-4"
              >
                <button
                  role="checkbox"
                  aria-checked={p.gekocht}
                  aria-label={`${p.naam} markeren als gekocht`}
                  onClick={() => gekochtWisselen(p.id)}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                    p.gekocht
                      ? "border-tangy-blue bg-tangy-blue text-white"
                      : "border-habico-grey bg-white hover:border-tangy-blue"
                  }`}
                >
                  {p.gekocht && <Check size={18} />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold ${
                      p.gekocht ? "text-[var(--muted)] line-through" : ""
                    }`}
                  >
                    {p.naam}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {p.omschrijving && `${p.omschrijving} · `}
                    {p.gekocht ? "Gekocht" : `Door ${p.toegevoegdDoor}`}
                  </p>
                  {p.aanbieding && !p.gekocht && (
                    <span className="mt-1 inline-block rounded-full bg-habico-soft-blue px-2 py-0.5 text-xs font-medium text-tangy-blue">
                      🏷️ {p.aanbieding}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 sm:ml-auto sm:flex-row sm:items-center">
                  <p
                    className={`font-semibold ${
                      p.gekocht ? "text-[var(--muted)] line-through" : ""
                    }`}
                  >
                    {euro(p.prijs, locale)}
                  </p>

                  <button
                    aria-label={`${p.naam} verwijderen`}
                    onClick={() => productVerwijderen(p.id)}
                    className="flex size-10 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-habico-grey/40 hover:text-habico-orange-red"
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between rounded-2xl bg-habico-landing p-4">
            <span className="text-habico-blue/70">Nog op de lijst</span>
            <span className="text-lg font-bold">{euro(nogOpDeLijst, locale)}</span>
          </div>
        </Card>

        {/* Rechter kolom */}
        <div
          className={`space-y-6 ${
            openSectie === "lijst" ? "hidden" : "block"
          } sm:block`}
        >
          {/* Budget-card */}
          <section
            className={`rounded-3xl bg-tangy-blue p-5 text-white sm:p-6 ${
              openSectie === "budget" ? "block" : "hidden"
            } sm:block`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Ons huishoudpotje
            </p>
            <p className="mt-2 text-xl font-medium">Nog beschikbaar</p>
            <p
              className={`mt-3 text-4xl font-bold sm:text-5xl ${
                over < 0 ? "text-habico-orange" : ""
              }`}
            >
              {euro(over, locale)}
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-habico-orange transition-all"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
              <span>Uitgegeven {euro(uitgegeven, locale)}</span>
              <span>Ingelegd {euro(ingelegd, locale)}</span>
            </div>
          </section>

          {/* Inleg-card */}
          <Card
            className={`p-4 sm:p-6 ${
              openSectie === "inleg" ? "block" : "hidden"
            } sm:block`}
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-medium text-habico-navy">
                Maandelijkse inleg
              </h2>
              <span className="rounded-full bg-habico-grey/50 px-3 py-1 text-xs font-semibold text-habico-navy">
                {euro(inleg, locale)} p.p.
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {aantalBetaald} van {bewoners.length} bewoners hebben betaald
            </p>

            {/* Alleen voor testen, verwijder dit zodra je kunt inloggen */}
            <label className="mt-3 block text-xs text-[var(--muted)]">
              Testen als:{" "}
              <select
                value={huidigeGebruikerId}
                onChange={(e) => setHuidigeGebruikerId(Number(e.target.value))}
                className="rounded-lg border border-habico-grey bg-white p-1"
              >
                {bewoners.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.naam}
                  </option>
                ))}
              </select>
            </label>

            <ul className="mt-4 divide-y divide-[var(--line)]">
              {bewoners.map((b) => {
                const heeftBetaald = b.betaaldBedrag > 0;
                const isIk = b.id === huidigeGebruikerId;

                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <Avatar naam={b.naam} />
                    <span className="flex-1 font-semibold">
                      {b.naam}
                      {isIk && (
                        <span className="ml-1 text-xs font-normal text-[var(--muted)]">
                          (jij)
                        </span>
                      )}
                    </span>

                    {heeftBetaald ? (
                      <span className="rounded-full bg-habico-soft-blue px-3 py-1 text-xs font-semibold text-habico-navy">
                        Betaald ✓
                      </span>
                    ) : isIk ? (
                      <button
                        onClick={() => inlegBetalen(b.id)}
                        className="rounded-full bg-tangy-blue px-3 py-1 text-xs font-semibold text-white transition hover:bg-habico-navy"
                      >
                        Ik heb betaald
                      </button>
                    ) : (
                      <span className="rounded-full bg-fire-orange/15 px-3 py-1 text-xs font-semibold text-habico-orange-red">
                        Nog niet betaald
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Bedrag wijzigen */}
            <div className="mt-2 border-t border-[var(--line)] pt-4">
              <h3 className="mb-2 text-sm font-semibold text-habico-navy">
                Bedrag wijzigen
              </h3>

              {voorstel === null ? (
                <form onSubmit={voorstelDoen} className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={nieuwBedragTekst}
                    onChange={(e) => setNieuwBedragTekst(e.target.value)}
                    placeholder="Nieuw bedrag in €"
                    className="min-w-0 flex-1 rounded-xl border border-habico-grey bg-white p-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-habico-orange px-3 py-2 text-sm font-semibold text-white transition hover:bg-habico-orange-red"
                  >
                    Voorstel
                  </button>
                </form>
              ) : (
                <div className="space-y-3 rounded-2xl bg-habico-soft-blue p-4">
                  <p className="text-sm text-habico-navy">
                    Van <strong>{euro(inleg, locale)}</strong> naar{" "}
                    <strong>{euro(voorstel.nieuwBedrag, locale)}</strong>
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {bewoners.map((b) => {
                      const akkoord = voorstel.goedgekeurdDoor.includes(b.id);
                      return (
                        <li
                          key={b.id}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            akkoord
                              ? "bg-[var(--green)] text-white"
                              : "bg-white text-habico-navy"
                          }`}
                        >
                          {akkoord ? "✓" : "…"} {b.naam}
                        </li>
                      );
                    })}
                  </ul>
                  {!ikHebGoedgekeurd && (
                    <div className="flex gap-2">
                      <button
                        onClick={goedkeuren}
                        className="rounded-xl bg-[var(--green)] px-3 py-1 text-sm font-semibold text-white"
                      >
                        Goedkeuren
                      </button>
                      <button
                        onClick={afwijzen}
                        className="rounded-xl bg-habico-orange-red px-3 py-1 text-sm font-semibold text-white"
                      >
                        Afwijzen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}