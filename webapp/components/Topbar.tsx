'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Settings, Sun } from 'lucide-react';
import { Button } from '@/components/Button';
import { useDashboardTheme } from '@/components/DashboardThemeProvider';
import { Datum } from '@/components/Datum';

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const instellingenActief = pathname.startsWith('/dashboard/instellingen');
  const { theme, toggleTheme } = useDashboardTheme();
  const darkModeActief = theme === 'dark';

  return (
    <header className="flex min-h-[76px] items-center justify-between gap-4 bg-habico-landing/90 px-4 sm:px-7 lg:px-10">
      <div className="min-w-0">
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
       <span className="bg-habico-blue/5 text-habico-blue hidden items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold sm:inline-flex">
       <span className="bg-habico-orange size-2 rounded-full" /> <Datum variant="kort" />
      </span>
        <button
          type="button"
          aria-label={darkModeActief ? 'Schakel lichte modus in' : 'Schakel donkere modus in'}
          aria-pressed={darkModeActief}
          title={darkModeActief ? 'Lichte modus' : 'Donkere modus'}
          onClick={toggleTheme}
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-habico-grey bg-habico-white text-habico-blue/70 transition-colors hover:border-tangy-blue hover:text-tangy-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-habico-navy-dark"
        >
          {darkModeActief ? (
            <Sun aria-hidden="true" size={18} strokeWidth={1.8} />
          ) : (
            <Moon aria-hidden="true" size={18} strokeWidth={1.8} />
          )}
        </button>
        <Link
          href="/dashboard/instellingen"
          aria-label="Instellingen"
          aria-current={instellingenActief ? 'page' : undefined}
          title="Instellingen"
          className={`grid size-10 shrink-0 place-items-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-habico-navy-dark ${
            instellingenActief
              ? 'border-habico-soft-blue bg-habico-soft-blue text-tangy-blue'
              : 'border-habico-grey bg-habico-white text-habico-blue/70 hover:border-tangy-blue hover:text-tangy-blue'
          }`}
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
        </Link>
        <Button
          className="min-h-10 whitespace-nowrap rounded-lg px-3 text-xs sm:px-4"
          variant="secondary"
          onClick={() => router.push('/login')}
        >
          Uitloggen
          <span aria-hidden="true">↗</span>
        </Button>
      </div>
    </header>
  );
}
