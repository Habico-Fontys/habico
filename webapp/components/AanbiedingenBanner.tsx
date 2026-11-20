"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";

type Supermarkt = {
  id: string;
  naam: string;
  label: string;
  href: string;
  eigen?: boolean; // true = door een bewoner toegevoegd, mag verwijderd worden
};

const STORAGE_KEY = "habico-supermarkten";

const standaard: Supermarkt[] = [
  { id: "ah", naam: "Albert Heijn", label: "Bonus", href: "https://www.ah.nl/bonus" },
  { id: "jumbo", naam: "Jumbo", label: "Aanbiedingen", href: "https://www.jumbo.com/aanbiedingen" },
  { id: "lidl", naam: "Lidl", label: "Aanbiedingen", href: "https://www.lidl.nl/aanbiedingen" },
  { id: "plus", naam: "Plus", label: "Aanbiedingen", href: "https://www.plus.nl/aanbiedingen" },
];

export default function AanbiedingenBanner() {
  const [supermarkten, setSupermarkten] = useState<Supermarkt[]>(standaard);
  const [geladen, setGeladen] = useState(false);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [naam, setNaam] = useState("");
  const [link, setLink] = useState("");
  const [fout, setFout] = useState("");

  // Eenmalig bij het openen van de pagina: opgeslagen lijst ophalen
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const opgeslagen = localStorage.getItem(STORAGE_KEY);
        if (opgeslagen) setSupermarkten(JSON.parse(opgeslagen));
      } catch {
        // kapotte of geblokkeerde opslag: we gebruiken gewoon de standaardlijst
      }
      setGeladen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Bij elke wijziging opslaan, maar pas nadat het laden klaar is
  useEffect(() => {
    if (!geladen) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supermarkten));
    } catch {}
  }, [supermarkten, geladen]);

  function supermarktToevoegen(e: React.FormEvent) {
    e.preventDefault();

    if (naam.trim() === "" || link.trim() === "") {
      setFout("Vul een naam en een link in.");
      return;
    }

    // "dirk.nl/aanbiedingen" mag ook: we zetten er zelf https:// voor
    const metProtocol = /^https?:\/\//i.test(link.trim())
      ? link.trim()
      : `https://${link.trim()}`;

    let href: string;
    try {
      const url = new URL(metProtocol); // gooit een fout bij een ongeldige link
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
      href = url.toString();
    } catch {
      setFout("Dat is geen geldige link. Probeer bijvoorbeeld dirk.nl/aanbiedingen.");
      return;
    }

    setSupermarkten([
      ...supermarkten,
      { id: String(Date.now()), naam: naam.trim(), label: "Aanbiedingen", href, eigen: true },
    ]);
    setNaam("");
    setLink("");
    setFout("");
    setToonFormulier(false);
  }

  function supermarktVerwijderen(id: string) {
    setSupermarkten(supermarkten.filter((s) => s.id !== id));
  }

  return (
    <section
      aria-label="Supermarktaanbiedingen"
      className="relative mt-8 overflow-hidden rounded-3xl bg-fire-orange p-4 text-habico-navy-dark sm:p-6 lg:p-8"
    >
      {/* Decoratieve cirkels */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-habico-orange-red/40" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-habico-orange/50" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Links: huisje met winkelwagen en uitleg */}
        <div className="flex items-start gap-4 lg:w-2/5 lg:items-center">
          <div className="relative shrink-0">
            <Image
              src="/habico-logo-transparent-v2.png"
              alt=""
              width={96}
              height={105}
              className="h-auto w-16 shrink-0 sm:w-20"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-2 -right-4 flex size-10 items-center justify-center rounded-full bg-habico-white text-tangy-blue shadow-md motion-safe:animate-wiggle sm:-right-6 sm:size-12"
            >
              <ShoppingCart size={24} />
            </span>
          </div>

          <div className="min-w-0 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Supermarktacties
            </p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">Slim samen inkopen</h2>
            <p className="mt-1 text-sm">
              Bekijk de aanbiedingen voordat je gaat en zet de beste deals op de lijst.
            </p>
          </div>
        </div>

        {/* Rechts: supermarkten en toevoegen */}
        <div className="flex-1">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {supermarkten.map((s) => (
              <li key={s.id} className="relative">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-16 items-center gap-2 rounded-2xl bg-habico-white py-2.5 pl-2.5 pr-3 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-habico-navy-dark sm:gap-3 sm:pr-4"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-tangy-blue text-xs font-semibold text-white"
                  >
                    {s.naam.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="leading-tight">
                    <span className="block font-semibold">{s.naam}</span>
                    <span className="flex items-center gap-1 text-xs text-tangy-blue">
                      {s.label}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </span>
                  <span className="sr-only">(opent in een nieuw tabblad)</span>
                </a>

                {s.eigen && (
                  <button
                    onClick={() => supermarktVerwijderen(s.id)}
                    aria-label={`${s.naam} verwijderen`}
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-habico-navy-dark text-white transition hover:bg-tangy-blue"
                  >
                    <X size={14} />
                  </button>
                )}
              </li>
            ))}

            <li>
              <button
                onClick={() => {
                  setToonFormulier(!toonFormulier);
                  setFout("");
                }}
                aria-expanded={toonFormulier}
                className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-habico-navy-dark/60 px-3 py-3 text-sm font-semibold transition hover:bg-habico-white/30 sm:w-auto sm:px-4"
              >
                {toonFormulier ? <X size={18} /> : <Plus size={18} />}
                {toonFormulier ? "Sluiten" : "Supermarkt toevoegen"}
              </button>
            </li>
          </ul>

          {toonFormulier && (
            <form
              onSubmit={supermarktToevoegen}
              className="mt-4 flex flex-col gap-2 rounded-2xl bg-habico-white p-3 sm:flex-row sm:flex-wrap"
            >
              <label className="sr-only" htmlFor="sm-naam">Naam van de supermarkt</label>
              <input
                id="sm-naam"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="Naam, bijv. Dirk"
                className="min-w-0 flex-1 rounded-xl border border-habico-grey bg-white p-2.5 text-[var(--ink)] focus:border-tangy-blue focus:outline-none sm:basis-36"
              />
              <label className="sr-only" htmlFor="sm-link">Link naar de aanbiedingen</label>
              <input
                id="sm-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link, bijv. dirk.nl/aanbiedingen"
                className="min-w-0 flex-[2] rounded-xl border border-habico-grey bg-white p-2.5 text-[var(--ink)] focus:border-tangy-blue focus:outline-none sm:basis-52"
              />
              <button
                type="submit"
                className="rounded-xl bg-tangy-blue px-5 py-2.5 font-semibold text-white transition hover:bg-habico-navy sm:shrink-0"
              >
                Opslaan
              </button>
              {fout && (
                <p role="alert" className="basis-full text-sm font-medium text-habico-orange-red">
                  {fout}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}