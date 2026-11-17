"use client";

import { useRef, useState } from "react";
import { Camera, Check, Trash2 } from "lucide-react";
import { useProfiel } from "@/components/ProfielProvider";
import ProfielAvatar from "@/components/ProfielAvatar";
import {
  MAX_BIO,
  MAX_FOTO_BYTES,
  TOEGESTANE_TYPES,
  avatarKleuren,
  kleurSleutels,
  verkleinFoto,
  volledigeNaam,
  type Profiel,
} from "@/lib/profiel";

const kaart = "rounded-3xl border border-[var(--line)] bg-habico-white p-4 sm:p-6";
const invoer =
  "w-full rounded-xl border border-habico-grey bg-white p-3 text-base text-[var(--ink)] focus:border-tangy-blue focus:outline-none";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-habico-navy-dark";

export default function ProfielPage() {
  const { profiel, geladen } = useProfiel();

  return (
    <main className="mx-auto max-w-4xl p-4 font-poppins text-[var(--ink)] sm:p-6 lg:p-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fire-orange">
          Maple House · Jouw profiel
        </p>
        <h1 className="mt-2 text-3xl font-bold text-habico-navy sm:text-4xl">
          Profiel<span className="text-fire-orange">.</span>
        </h1>
        <p className="mt-1 text-habico-blue/70">
          Zo zien je huisgenoten jou in de app.
        </p>
      </header>

      {geladen ? (
        <ProfielFormulier profiel={profiel} />
      ) : (
        <div className={`${kaart} mt-8 h-64 animate-pulse`} aria-hidden="true" />
      )}
    </main>
  );
}

function Veld({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-habico-navy">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfielFormulier({ profiel }: { profiel: Profiel }) {
  const { bewaarProfiel } = useProfiel();
  const bestandRef = useRef<HTMLInputElement>(null);

  // "concept" = wat er nu in het formulier staat, "profiel" = wat is opgeslagen
  const [concept, setConcept] = useState<Profiel>(profiel);
  const [melding, setMelding] = useState<{ type: "ok" | "fout"; tekst: string } | null>(null);
  const [fotoBezig, setFotoBezig] = useState(false);

  const gewijzigd = JSON.stringify(concept) !== JSON.stringify(profiel);

  function wijzig<K extends keyof Profiel>(veld: K, waarde: Profiel[K]) {
    setConcept((huidig) => ({ ...huidig, [veld]: waarde }));
    setMelding(null);
  }

  async function fotoKiezen(e: React.ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0];
    e.target.value = ""; // zodat je dezelfde foto nog eens kunt kiezen
    if (!bestand) return;

    if (!TOEGESTANE_TYPES.includes(bestand.type)) {
      setMelding({ type: "fout", tekst: "Kies een JPG-, PNG- of WebP-foto." });
      return;
    }
    if (bestand.size > MAX_FOTO_BYTES) {
      setMelding({ type: "fout", tekst: "Die foto is te groot. Kies een foto kleiner dan 8 MB." });
      return;
    }

    setFotoBezig(true);
    try {
      wijzig("foto", await verkleinFoto(bestand));
    } catch {
      setMelding({ type: "fout", tekst: "Die foto kon niet worden gelezen. Probeer een andere." });
    } finally {
      setFotoBezig(false);
    }
  }

  function opslaan(e: React.FormEvent) {
    e.preventDefault();

    if (concept.voornaam.trim() === "") {
      setMelding({ type: "fout", tekst: "Vul minstens je voornaam in." });
      return;
    }

    const schoon: Profiel = {
      ...concept,
      voornaam: concept.voornaam.trim(),
      achternaam: concept.achternaam.trim(),
      kamer: concept.kamer.trim(),
      bio: concept.bio.trim(),
    };

    if (bewaarProfiel(schoon)) {
      setConcept(schoon);
      setMelding({ type: "ok", tekst: "Profiel opgeslagen." });
    } else {
      setMelding({
        type: "fout",
        tekst: "Opslaan is mislukt. Je browser blokkeert opslag of is vol.",
      });
    }
  }

  function ongedaanMaken() {
    setConcept(profiel);
    setMelding(null);
  }

  return (
    <form onSubmit={opslaan} className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      {/* Links: foto */}
      <section className={`${kaart} flex flex-col items-center text-center`}>
        <ProfielAvatar profiel={concept} className="size-28" tekstKlasse="text-3xl" />
        <p className="mt-4 text-xl font-semibold text-habico-navy">
          {volledigeNaam(concept) || "Jouw naam"}
        </p>
        {concept.kamer && <p className="text-sm text-[var(--muted)]">{concept.kamer}</p>}

        <input
          ref={bestandRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={fotoKiezen}
          className="hidden"
          tabIndex={-1}
        />

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => bestandRef.current?.click()}
            disabled={fotoBezig}
            className={`flex min-h-11 items-center gap-2 rounded-xl bg-tangy-blue px-4 font-semibold text-white transition hover:bg-habico-navy disabled:opacity-60 ${focus}`}
          >
            <Camera size={18} aria-hidden="true" />
            {fotoBezig ? "Bezig…" : concept.foto ? "Andere foto" : "Foto kiezen"}
          </button>

          {concept.foto && (
            <button
              type="button"
              onClick={() => wijzig("foto", null)}
              className={`flex min-h-11 items-center gap-2 rounded-xl border border-habico-grey bg-white px-4 font-semibold text-habico-navy transition hover:border-habico-orange-red hover:text-habico-orange-red ${focus}`}
            >
              <Trash2 size={18} aria-hidden="true" />
              Verwijderen
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          JPG, PNG of WebP. Je foto wordt bijgesneden tot een vierkant.
        </p>
      </section>

      {/* Rechts: gegevens */}
      <section className={`${kaart} space-y-4`}>
        <h2 className="text-xl font-medium text-habico-navy">Over jou</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Veld label="Voornaam" htmlFor="voornaam">
            <input
              id="voornaam"
              value={concept.voornaam}
              onChange={(e) => wijzig("voornaam", e.target.value)}
              maxLength={40}
              autoComplete="given-name"
              className={invoer}
            />
          </Veld>
          <Veld label="Achternaam" htmlFor="achternaam">
            <input
              id="achternaam"
              value={concept.achternaam}
              onChange={(e) => wijzig("achternaam", e.target.value)}
              maxLength={60}
              autoComplete="family-name"
              className={invoer}
            />
          </Veld>
        </div>

        <Veld label="Kamer" htmlFor="kamer">
          <input
            id="kamer"
            value={concept.kamer}
            onChange={(e) => wijzig("kamer", e.target.value)}
            maxLength={30}
            placeholder="Bijv. Kamer 4, bovenverdieping"
            className={invoer}
          />
        </Veld>

        <Veld label="Korte bio" htmlFor="bio">
          <textarea
            id="bio"
            value={concept.bio}
            onChange={(e) => wijzig("bio", e.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            placeholder="Bijv. Eerstejaars ICT, kookt graag en haalt altijd het afval."
            className={`${invoer} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-[var(--muted)]">
            {concept.bio.length}/{MAX_BIO}
          </p>
        </Veld>

        <div>
          <p id="kleur-label" className="mb-2 text-sm font-semibold text-habico-navy">
            Kleur van je initialen
          </p>
          <div role="radiogroup" aria-labelledby="kleur-label" className="flex gap-3">
            {kleurSleutels.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={concept.kleur === k}
                aria-label={avatarKleuren[k].naam}
                onClick={() => wijzig("kleur", k)}
                className={`size-11 rounded-full transition ${avatarKleuren[k].swatch} ${
                  concept.kleur === k
                    ? "ring-2 ring-habico-navy-dark ring-offset-2"
                    : "hover:scale-110"
                } ${focus}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Je ziet deze kleur zolang je geen foto hebt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
          <button
            type="submit"
            disabled={!gewijzigd || fotoBezig}
            className={`flex min-h-11 items-center gap-2 rounded-xl bg-tangy-blue px-5 font-semibold text-white transition hover:bg-habico-navy disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
          >
            <Check size={18} aria-hidden="true" />
            Opslaan
          </button>
          <button
            type="button"
            onClick={ongedaanMaken}
            disabled={!gewijzigd}
            className={`min-h-11 rounded-xl border border-habico-grey bg-white px-5 font-semibold text-habico-navy transition disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
          >
            Ongedaan maken
          </button>

          {/* Altijd aanwezig, zodat screenreaders de melding voorlezen */}
          <p
            role="status"
            className={`text-sm font-medium ${
              melding?.type === "fout" ? "text-habico-orange-red" : "text-[var(--green)]"
            }`}
          >
            {melding?.tekst}
          </p>
        </div>
      </section>
    </form>
  );
}