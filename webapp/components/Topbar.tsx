'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/Button';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/huisgenoten': 'Huisgenoten',
  '/dashboard/activiteiten': 'Activiteiten',
  '/dashboard/instellingen': 'Instellingen',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="border-habico-grey/70 color-habico-landing/90 flex min-h-[76px] items-center justify-between gap-4 sm:px-7 lg:px-10">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-habico-navy">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="bg-habico-blue/5 text-habico-blue hidden items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold sm:inline-flex">
          <span className="bg-habico-orange size-2 rounded-full" /> Maandag, 9 november
        </span>
        <Button
          className="min-h-10 rounded-lg px-3 text-xs sm:px-4"
          variant="secondary"
          onClick={() => router.push('/login')}
        >
          <span className="hidden sm:inline">Uitloggen</span>
          <span className="sm:hidden">Uit</span>
          <span aria-hidden="true">↗</span>
        </Button>
      </div>
    </header>
  );
}
