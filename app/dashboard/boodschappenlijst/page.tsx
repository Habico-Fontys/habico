"use client";

import { useState } from "react";

// 1. Het "model": hoe ziet een product eruit?
type Product = {
  id: number;
  naam: string;
  toegevoegdDoor: string;
  aanbieding: string;
  gekocht: boolean;
  prijs: number;
};

// Tijdelijke vaste waarden, later komen die uit een database
const INLEG_PER_BEWONER = 20;
const AANTAL_BEWONERS = 5;

export default function BoodschappenlijstPage() {
  const [producten, setProducten] = useState<Product[]>([]);
  const [naam, setNaam] = useState("");
  const [aanbieding, setAanbieding] = useState("");

  // 2. Berekende waarden (géén state, zie uitleg hieronder)
  const beschikbaar = INLEG_PER_BEWONER * AANTAL_BEWONERS;
  const uitgegeven = producten
    .filter((p) => p.gekocht)
    .reduce((totaal, p) => totaal + p.prijs, 0);
  const over = beschikbaar - uitgegeven;

  // 3. Product toevoegen
  function productToevoegen(e: React.FormEvent) {
    e.preventDefault(); // voorkomt dat de pagina herlaadt
    if (naam.trim() === "") return;

    const nieuwProduct: Product = {
      id: Date.now(),
      naam: naam.trim(),
      toegevoegdDoor: "Ik", // later: ingelogde gebruiker
      aanbieding: aanbieding.trim(),
      gekocht: false,
      prijs: 0,
    };

    setProducten([...producten, nieuwProduct]);
    setNaam("");
    setAanbieding("");
  }

  // 4. Eén product aanpassen (gekocht / prijs)
  function productAanpassen(id: number, wijziging: Partial<Product>) {
    setProducten(
      producten.map((p) => (p.id === id ? { ...p, ...wijziging } : p))
    );
  }

  const nogTeKopen = producten.filter((p) => !p.gekocht);
  const gekocht = producten.filter((p) => p.gekocht);

  return (
    <main className="min-h-screen bg-[var(--paper)] p-6 font-poppins text-[var(--ink)]">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-habico-navy">
          Gezamenlijke boodschappen
        </h1>

        {/* Budget */}
        <section className="grid grid-cols-3 gap-3">
          <BudgetKaart label="Budget" bedrag={beschikbaar} />
          <BudgetKaart label="Uitgegeven" bedrag={uitgegeven} />
          <BudgetKaart
            label="Te besteden"
            bedrag={over}
            kleur={over < 0 ? "text-habico-orange-red" : "text-[var(--green)]"}
          />
        </section>

        {/* Toevoegen */}
        <form
          onSubmit={productToevoegen}
          className="space-y-3 rounded-2xl border border-[var(--line)] bg-habico-white p-4"
        >
          <h2 className="font-semibold text-habico-navy">Product toevoegen</h2>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Bijv. toiletpapier"
            className="w-full rounded-lg border border-habico-grey p-2"
          />
          <input
            value={aanbieding}
            onChange={(e) => setAanbieding(e.target.value)}
            placeholder="Aanbieding (optioneel), bijv. 1+1 gratis bij Albert Heijn"
            className="w-full rounded-lg border border-habico-grey p-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-habico-orange px-4 py-2 font-semibold text-white hover:bg-habico-orange-red"
          >
            Toevoegen
          </button>
        </form>

        {/* Nog te kopen */}
        <section>
          <h2 className="mb-2 font-semibold text-habico-navy">Nog te kopen</h2>
          {nogTeKopen.length === 0 && (
            <p className="text-[var(--muted)]">Alles is gekocht 🎉</p>
          )}
          <ul className="space-y-2">
            {nogTeKopen.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white p-3"
              >
                <div>
                  <p className="font-medium">{p.naam}</p>
                  <p className="text-sm text-[var(--muted)]">
                    Toegevoegd door {p.toegevoegdDoor}
                  </p>
                  {p.aanbieding && (
                    <span className="mt-1 inline-block rounded-full bg-habico-soft-blue px-2 py-0.5 text-xs text-tangy-blue">
                      🏷️ {p.aanbieding}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="€"
                    onChange={(e) =>
                      productAanpassen(p.id, { prijs: Number(e.target.value) })
                    }
                    className="w-24 rounded-lg border border-habico-grey p-1"
                  />
                  <button
                    onClick={() => productAanpassen(p.id, { gekocht: true })}
                    className="rounded-lg bg-habico-navy px-3 py-1 text-sm text-white hover:bg-habico-navy-dark"
                  >
                    Gekocht
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Uitgaven */}
        <section>
          <h2 className="mb-2 font-semibold text-habico-navy">Uitgaven</h2>
          <ul className="space-y-1">
            {gekocht.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-[var(--line)] py-1">
                <span>{p.naam}</span>
                <span>€ {p.prijs.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

// Een klein, herbruikbaar onderdeel (component)
function BudgetKaart({
  label,
  bedrag,
  kleur = "text-habico-navy",
}: {
  label: string;
  bedrag: number;
  kleur?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-habico-white p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className={`text-2xl font-bold ${kleur}`}>€ {bedrag.toFixed(2)}</p>
    </div>
  );
}