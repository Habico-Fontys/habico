import Link from 'next/link';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { DashboardChart } from '@/components/DashboardChart';
import { StatCard } from '@/components/StatCard';
import { dashboardStats, recentActivity, upcomingItems } from '@/data/mock';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-[1480px] px-4 pt-6 pb-10 sm:px-7 sm:pt-8 lg:px-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
            MAANDAG 9 NOVEMBER 2026
          </p>
          <h2 className="text-habico-navy-dark mt-2 text-[26px] leading-tight font-extrabold sm:text-[32px]">
            Goedemorgen, Marvin<span className="text-habico-orange">.</span>
          </h2>
          <p className="text-habico-blue/65 mt-2 text-sm">Hier is wat er speelt in Maple House.</p>
        </div>
        <div className="border-habico-grey/80 bg-habico-white text-habico-blue/70 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold">
          <span className="bg-habico-orange size-2 rounded-full" /> Alles loopt lekker
        </div>
      </div>
      <section
        aria-label="Kerncijfers"
        className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4"
      >
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.85fr)]">
        <DashboardChart />
        <Card className="relative overflow-hidden">
          <div className="bg-habico-orange/10 absolute -top-16 -right-12 size-40 rounded-full" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-habico-blue/55 text-xs font-bold tracking-[0.12em] uppercase">
                Samen vooruit
              </p>
              <h2 className="text-habico-navy-dark mt-1 text-lg font-extrabold">Deze week</h2>
            </div>
            <span className="bg-habico-orange/15 text-habico-orange grid size-10 place-items-center rounded-xl text-lg">
              ✳
            </span>
          </div>
          <div className="mt-5 grid gap-1">
            {upcomingItems.map((item, index) => (
              <div
                className="border-habico-grey/50 flex items-center gap-3 border-t py-3 first:border-t-0"
                key={item.title}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl text-center ${index === 0 ? 'bg-habico-orange text-habico-white' : 'bg-tangy-blue/8 text-habico-blue'}`}
                >
                  <span>
                    <span className="block text-sm leading-none font-extrabold">{item.day}</span>
                    <span className="mt-1 block text-[7px] font-bold">{item.month}</span>
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-habico-navy-dark block truncate text-xs font-bold">
                    {item.title}
                  </span>
                  <span className="text-habico-blue/60 mt-1 block truncate text-[10px]">
                    {item.person}
                  </span>
                </span>
                <span className="text-habico-blue/55 text-[10px] font-semibold">{item.time}</span>
              </div>
            ))}
          </div>
          <Link
            className="text-habico-blue hover:text-habico-orange-red mt-2 inline-flex items-center gap-2 text-xs font-bold transition"
            href="/dashboard/activiteiten"
          >
            Bekijk agenda <span aria-hidden="true">→</span>
          </Link>
        </Card>
      </section>
      <section className="mt-4">
        <Card className="overflow-hidden">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-habico-blue/55 text-xs font-bold tracking-[0.12em] uppercase">
                In één oogopslag
              </p>
              <h2 className="text-habico-navy-dark mt-1 text-lg font-extrabold">
                Recente activiteit
              </h2>
            </div>
            <Link
              className="text-habico-blue hover:text-habico-orange-red text-xs font-bold transition"
              href="/dashboard/activiteiten"
            >
              Alles bekijken <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <DataTable rows={recentActivity} />
        </Card>
      </section>
      <footer className="text-habico-blue/40 mt-7 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] font-medium">
        <span>© 2026 HABICO</span>
        <span>Connecting People, Creating Solutions.</span>
      </footer>
    </main>
  );
}
