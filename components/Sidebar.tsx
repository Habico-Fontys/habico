'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';

const items = [
  { href: '/dashboard', label: 'Overzicht', icon: 'grid' },
  { href: '/dashboard/huisgenoten', label: 'Huisgenoten', icon: 'users' },
  { href: '/dashboard/activiteiten', label: 'Activiteiten', icon: 'activity' },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: 'settings' },
];

const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64',
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-habico-navy-dark text-habico-white flex w-full shrink-0 flex-col px-4 py-4 md:sticky md:top-0 md:h-screen md:w-[248px] md:px-5 md:py-7">
      <Link
        href="/dashboard"
        aria-label="Habico dashboard"
        className="flex w-fit items-center px-1 md:px-2"
      >
        <Logo variant="light" />
      </Link>
      <div className="border-habico-white/10 bg-habico-white/[0.04] mt-5 hidden items-center gap-3 rounded-xl border px-3 py-3 md:flex">
        <span className="bg-habico-orange text-habico-white grid size-9 place-items-center rounded-full text-xs font-extrabold">
          MH
        </span>
        <span className="min-w-0">
          <span className="text-habico-white/45 block text-[10px] font-semibold tracking-[0.12em] uppercase">
            Jouw huis
          </span>
          <span className="mt-0.5 block truncate text-sm font-bold">Maple House</span>
        </span>
        <span className="text-habico-white/50 ml-auto text-xs" aria-hidden="true">
          ⌄
        </span>
      </div>
      <p className="text-habico-white/40 mt-7 mb-2 hidden px-3 text-[10px] font-extrabold tracking-[0.18em] uppercase md:block">
        Menu
      </p>
      <nav
        aria-label="Hoofdnavigatie"
        className="mt-4 flex gap-2 overflow-x-auto md:mt-0 md:flex-col md:overflow-visible"
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition-colors md:min-h-12 md:text-sm ${active ? 'bg-habico-blue text-habico-white shadow-sm' : 'text-habico-white/65 hover:bg-habico-white/[0.07] hover:text-habico-white'}`}
            >
              <svg
                aria-hidden="true"
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={paths[item.icon]} />
              </svg>
              <span>{item.label}</span>
              {active && (
                <span className="bg-habico-orange ml-auto hidden h-5 w-1 rounded-full md:block" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="from-habico-blue to-tangy-blue mt-5 hidden rounded-2xl bg-gradient-to-br p-4 md:mt-auto md:block">
        <span className="bg-habico-white/15 text-habico-orange grid size-8 place-items-center rounded-lg">
          ✳
        </span>
        <p className="mt-3 text-sm font-bold">Samen sterk.</p>
        <p className="text-habico-white/70 mt-1 text-[11px] leading-relaxed">
          Een fijn huis begint met kleine dingen samen doen.
        </p>
      </div>
      <div className="border-habico-white/10 mt-4 hidden items-center gap-3 border-t pt-5 md:flex">
        <span className="bg-habico-orange/20 text-habico-orange grid size-9 place-items-center rounded-full text-xs font-bold">
          AD
        </span>
        <span>
          <span className="block text-xs font-bold">Marvin Verspeek</span>
          <span className="text-habico-white/45 mt-0.5 block text-[10px]">Huisbeheerder</span>
        </span>
        <span className="text-habico-white/45 ml-auto" aria-hidden="true">
          •••
        </span>
      </div>
    </aside>
  );
}
