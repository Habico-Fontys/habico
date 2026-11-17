import Link from 'next/link';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { DashboardChart } from '@/components/DashboardChart';
import { StatCard } from '@/components/StatCard';
import { dashboardStats, recentActivity, upcomingItems } from '@/data/mock';
import { Datum } from '@/components/Datum';
import { Voornaam } from '@/components/Voornaam';
import { Begroeting } from '@/components/Begroeting';
import { HuidigHuisBadge } from '@/components/HuidigHuisBadge';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-[1480px] px-4 pt-6 pb-10 sm:px-7 sm:pt-8 lg:px-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
            <Datum variant="lang" />
          </p>
          <h2 className="text-habico-navy-dark mt-2 text-[26px] leading-tight font-extrabold sm:text-[32px]">
            <Begroeting />, <Voornaam />
            <span className="text-habico-orange">.</span>
          </h2>
          <p className="text-habico-blue/65 mt-2 text-sm">Hier is wat er speelt in jouw huis.</p>
        </div>
        <HuidigHuisBadge />
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
        <Card className="relative overflow-hidden bg-tangy-blue p-7 text-habico-white sm:p-12">
          <div
            aria-hidden="true"
            className="dashboard-diamond-dots pointer-events-none absolute top-4 right-4 size-20 opacity-80"
          />
          <div
            aria-hidden="true"
            className="bg-habico-orange pointer-events-none absolute right-[-50px] bottom-[-60px] size-40 rounded-full"
          />
          <span
            aria-hidden="true"
            className="bg-habico-white/15 text-habico-white pointer-events-none absolute right-5 bottom-5 z-20 grid size-10 place-items-center rounded-xl text-lg"
          >
            ✳
          </span>
          <div className="relative z-10">
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-habico-white text-xs font-normal tracking-[0.12em] uppercase">
                  Samen vooruit
                </p>
                <h2 className="text-habico-white mt-1 text-lg font-normal">Deze week</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-1">
              {upcomingItems.map((item, index) => (
                <div
                  className="border-habico-grey/50 flex items-center gap-3 border-t py-3 first:border-t-0"
                  key={item.title}
                >
                  
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl text-center ${index === 0 ? 'bg-habico-orange text-habico-white' : 'bg-tangy-blue/8 text-habico-white'}`}
                    
                  >
                    
                    <span>
                      <span className="block text-[20px] leading-none font-semibold">{item.day}</span>
                      <span className="mt-1 block text-[10px] font-bold">{item.month}</span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-habico-white block truncate text-m font-semibold">
                      {item.title}
                    </span>
                    <span className="text-habico-white mt-1 block truncate text-[12px]">
                      {item.person}
                    </span>
                  </span>
                  <span className="text-habico-white text-[14px] font-semibold">{item.time}</span>
                </div>
              ))}
            </div>
            <Link
              className="text-habico-white hover:text-habico-orange-red mt-2 inline-flex items-center gap-2 pt-4 text-xs font-bold transition"
              href="/dashboard/activiteiten"
            >
              Bekijk agenda <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Card>
      </section>
      <section className="mt-4">
        <Card className="overflow-hidden">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-habico-blue/55 text-xs font-normal tracking-[0.12em] uppercase">
                In één oogopslag
              </p>
              <h2 className="text-habico-navy-dark mt-1 text-lg font-normal">
                Recente activiteit
              </h2>
            </div>
            <Link
              className="text-white hover:text-habico-orange-red text-xs font-bold transition"
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
