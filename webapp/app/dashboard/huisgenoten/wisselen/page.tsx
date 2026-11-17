'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  CURRENT_HOUSE_CHANGE_EVENT,
  CURRENT_HOUSE_STORAGE_KEY,
} from '@/lib/huis';

type House = {
  id: string;
  name: string;
  city: string;
  description: string;
  members: number;
  code: string;
  accent: string;
};

const houses: House[] = [
  {
    id: 'maple-house',
    name: 'Maple House',
    city: 'Eindhoven · Strijp-S',
    description: 'Samen wonen, samen plannen en altijd iemand in de keuken.',
    members: 6,
    code: 'MAPLE-2H7K',
    accent: 'bg-orange-50 text-fire-orange',
  },
  {
    id: 'canal-house',
    name: 'Canal House',
    city: 'Eindhoven · Centrum',
    description: 'Een creatieve plek voor makers, eters en weekendplannen.',
    members: 7,
    code: 'CANAL-7K2P',
    accent: 'bg-orange-50 text-fire-orange',
  },
  {
    id: 'green-loft',
    name: 'The Green Loft',
    city: 'Eindhoven · Woensel',
    description: 'Rustig wonen met veel groen, gezamenlijke diners en een dakterras.',
    members: 5,
    code: 'GREEN-4M8Q',
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'blue-door',
    name: 'Blue Door',
    city: 'Eindhoven · Tongelre',
    description: 'Een actieve groep die graag samen sport en de stad ontdekt.',
    members: 8,
    code: 'BLUE-9R3T',
    accent: 'bg-habico-soft-blue text-tangy-blue',
  },
];

export default function SwitchHousePage() {
  const [currentHouse, setCurrentHouse] = useState(houses[0]);
  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [showTestCodes, setShowTestCodes] = useState(false);
  const [code, setCode] = useState('');
  const [foundHouse, setFoundHouse] = useState<House | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  function findHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredCode = code.replace(/\s/g, '').toUpperCase();
    const house = houses.find((item) => item.code === enteredCode);

    setError('');
    setFeedback('');

    if (!house) {
      setFoundHouse(null);
      setError('Deze huiscode bestaat niet. Controleer de code en probeer het opnieuw.');
      return;
    }

    if (house.id === currentHouse.id) {
      setFoundHouse(null);
      setError(`Je bent al onderdeel van ${house.name}.`);
      return;
    }

    setFoundHouse(house);
  }

  function joinHouse() {
    if (!foundHouse) return;

    setCurrentHouse(foundHouse);
    localStorage.setItem(
      CURRENT_HOUSE_STORAGE_KEY,
      JSON.stringify({ id: foundHouse.id, name: foundHouse.name }),
    );
    window.dispatchEvent(new Event(CURRENT_HOUSE_CHANGE_EVENT));
    setCode('');
    setFoundHouse(null);
    setFeedback(`Je bent nu onderdeel van ${foundHouse.name}. Welkom bij je nieuwe huis!`);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mb-7">
        <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
          BEWONERS · HUIS WISSELEN
        </p>
        <h1 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
          Sluit aan bij een huis<span className="text-habico-orange">.</span>
        </h1>
        <p className="text-habico-blue/65 mt-2 max-w-2xl text-sm">
          Vul de unieke huiscode in die je van de bewoners of beheerder hebt gekregen.
        </p>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <Card className="border-tangy-blue/20 bg-habico-soft-blue/40 p-5 sm:p-7">
          <p className="text-tangy-blue text-[10px] font-bold tracking-[0.15em] uppercase">
            Jouw huidige huis
          </p>
          <h2 className="text-habico-navy-dark mt-2 text-xl font-extrabold">{currentHouse.name}</h2>
          <p className="text-habico-blue/65 mt-1 text-xs">
            {currentHouse.city} · {currentHouse.members} bewoners
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              className="min-h-10 rounded-lg px-3 text-xs"
              aria-expanded={showCurrentCode}
              onClick={() => setShowCurrentCode((visible) => !visible)}
            >
              {showCurrentCode ? 'Verberg huiscode' : 'Toon huiscode'}
            </Button>
            {showCurrentCode && (
              <div
                role="status"
                aria-live="polite"
                className="border-tangy-blue/20 bg-habico-white mt-3 rounded-xl border px-3 py-2.5"
              >
                <p className="text-habico-blue/55 text-[10px] font-semibold">
                  Deel deze code met nieuwe bewoners
                </p>
                <p className="text-tangy-blue mt-1 font-mono text-sm font-bold tracking-wider">
                  {currentHouse.code}
                </p>
              </div>
            )}
          </div>
          <div className="border-habico-grey/70 mt-5 border-t pt-4">
            <p className="text-habico-navy-dark text-xs font-bold">Zo werkt overstappen</p>
            <ol className="text-habico-blue/65 mt-2 grid gap-2 text-xs leading-relaxed">
              <li><span className="text-tangy-blue font-bold">1.</span> Vraag de huiscode aan de bewoners.</li>
              <li><span className="text-tangy-blue font-bold">2.</span> Controleer het gevonden huis.</li>
              <li><span className="text-tangy-blue font-bold">3.</span> Bevestig en stap direct over.</li>
            </ol>
          </div>
          <p className="text-habico-blue/55 mt-5 rounded-xl bg-white/70 px-3 py-2.5 text-[11px] leading-relaxed">
            Je verlaat je huidige huis pas wanneer je de overstap bevestigt.
          </p>
        </Card>

        <section aria-labelledby="join-house">
          <Card className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="bg-tangy-blue text-habico-white grid size-11 shrink-0 place-items-center rounded-xl text-lg">
                #
              </span>
              <div>
                <p className="text-habico-blue/55 text-[10px] font-bold tracking-[0.15em] uppercase">
                  Unieke toegang
                </p>
                <h2 id="join-house" className="text-habico-navy-dark mt-1 text-lg font-bold">
                  Gebruik een huiscode
                </h2>
                <p className="text-habico-blue/65 mt-1 text-xs leading-relaxed">
                  Geen zoeklijst of aanvraag nodig. Alleen iemand met de juiste code kan je uitnodigen.
                </p>
              </div>
            </div>

            <form className="mt-6 grid gap-3" onSubmit={findHouse}>
              <label className="text-habico-navy-dark grid gap-1.5 text-xs font-semibold">
                Huiscode
                <input
                  required
                  maxLength={12}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    setError('');
                    setFeedback('');
                  }}
                  placeholder="Bijv. CANAL-7K2P"
                  className="border-habico-grey/80 bg-habico-white text-habico-navy-dark placeholder:text-habico-blue/40 focus:border-tangy-blue min-h-12 rounded-xl border px-3 font-mono text-sm tracking-wider uppercase outline-none"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-habico-blue/50 text-[11px]">
                  De code is hoofdletterongevoelig.
                </p>
                <Button type="submit" className="min-h-10 rounded-lg px-4 text-xs">
                  Code controleren
                </Button>
              </div>
            </form>

            {process.env.NODE_ENV !== 'production' && (
              <div className="border-orange-200 bg-orange-50/60 mt-5 rounded-xl border border-dashed p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-orange-800 text-[10px] font-bold tracking-[0.12em] uppercase">
                      Dev testfunctie
                    </p>
                    <p className="text-orange-800/70 mt-1 text-[11px]">
                      Alleen zichtbaar tijdens development.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="min-h-9 rounded-lg px-3 text-xs"
                    aria-expanded={showTestCodes}
                    onClick={() => setShowTestCodes((visible) => !visible)}
                  >
                    {showTestCodes ? 'Verberg testcodes' : 'Toon alle testcodes'}
                  </Button>
                </div>
                {showTestCodes && (
                  <div className="mt-3 grid gap-1.5 border-t border-orange-200 pt-3">
                    {houses.map((house) => (
                      <div
                        key={house.id}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="text-orange-800/80">{house.name}</span>
                        <code className="rounded bg-white/80 px-2 py-1 font-mono font-bold tracking-wider text-orange-800">
                          {house.code}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            {foundHouse && (
              <div className="border-emerald-200 bg-emerald-50/70 mt-5 rounded-xl border p-4">
                <p className="text-emerald-700 text-[10px] font-bold tracking-[0.15em] uppercase">
                  Huis gevonden
                </p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-habico-navy-dark font-bold">{foundHouse.name}</h3>
                    <p className="text-habico-blue/60 mt-0.5 text-xs">
                      {foundHouse.city} · {foundHouse.members} bewoners
                    </p>
                  </div>
                  <Button onClick={joinHouse} className="min-h-10 rounded-lg px-4 text-xs">
                    Dit huis joinen
                  </Button>
                </div>
                <p className="text-habico-blue/60 mt-3 text-[11px] leading-relaxed">
                  Door te bevestigen verlaat je {currentHouse.name} en word je lid van {foundHouse.name}.
                </p>
              </div>
            )}

            {feedback && (
              <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                {feedback}
              </p>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
