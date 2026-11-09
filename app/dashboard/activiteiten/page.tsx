import { Card } from '@/components/Card';
import { recentActivity } from '@/data/mock';

export default function ActivitiesPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
        MAPLE HOUSE
      </p>
      <h2 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
        Activiteiten<span className="text-habico-orange">.</span>
      </h2>
      <Card className="mt-6">
        <h3 className="text-habico-navy-dark mb-4 text-base font-bold">Recente activiteit</h3>
        <div className="grid gap-4">
          {recentActivity.map((item) => (
            <article
              className="border-habico-grey/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4 first:border-t-0 first:pt-0"
              key={item.id}
            >
              <div>
                <h4 className="text-habico-navy-dark text-sm font-bold">{item.name}</h4>
                <p className="text-habico-blue/60 mt-1 text-xs">{item.detail}</p>
              </div>
              <span className="text-habico-blue/55 text-xs">{item.time}</span>
            </article>
          ))}
        </div>
      </Card>
    </main>
  );
}
