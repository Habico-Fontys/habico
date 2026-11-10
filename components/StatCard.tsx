import type { DashboardStat } from '@/data/mock';
import { Card } from '@/components/Card';

const iconPaths: Record<DashboardStat['icon'], string> = {
  people:
    'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  check: 'm5 12 4 4L19 6',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  spark: 'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z',
};

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className="group relative overflow-hidden px-5 py-4 sm:px-5 sm:py-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(0,35,71,0.09)]">
      <div className="bg-tangy-blue/[0.04] absolute -top-8 -right-7 size-24 rounded-full transition group-hover:scale-125" />
      <div className="relative flex items-center gap-4">
        <span className="bg-tangy-blue/10 text-tangy-blue grid size-10 shrink-0 place-items-center rounded-xl">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={iconPaths[stat.icon]} />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-habico-blue/70 text-xs font-semibold">{stat.label}</p>
          <p className="text-habico-navy-dark mt-3 text-3xl leading-none font-extrabold">
            {stat.value}
          </p>
          <p
            className={`mt-3 text-[11px] font-bold ${stat.positive ? 'text-habico-blue' : 'text-fire-orange'}`}
          >
            {stat.change}
          </p>
        </div>
      </div>
    </Card>
  );
}
