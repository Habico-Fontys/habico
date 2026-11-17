import { Card } from '@/components/Card';
import { HUISGENOTEN, HUISNAAM } from './data';

export default function HousematesPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
        {HUISNAAM.toUpperCase()}
      </p>
      <h2 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
        Huisgenoten<span className="text-habico-orange">.</span>
      </h2>
      <Card className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-habico-navy-dark text-base font-bold">Huisgenoten</h3>
          <span className="text-habico-blue/65 text-sm">
            {HUISGENOTEN.length} bewoners
          </span>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HUISGENOTEN.map((huisgenoot) => (
            <li
              key={huisgenoot.id}
              className="flex items-center gap-3 rounded-2xl bg-habico-landing p-3"
            >
              <span className="bg-habico-soft-blue text-tangy-blue grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold">
                {huisgenoot.naam.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-habico-navy-dark text-sm font-semibold">
                {huisgenoot.naam}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
