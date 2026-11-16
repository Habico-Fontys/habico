'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';



const items = [
  { href: '/dashboard', label: 'Overzicht', icon: 'grid' },
  { href: '/dashboard/activiteiten', label: 'Activiteiten', icon: 'activity' },
  { href: '/dashboard/instellingen', label: 'Instellingen', icon: 'settings' },
  { href: '/dashboard/boodschappenlijst', label: 'Boodschappen', icon: 'shoppingcart' },
  { href: '/dashboard/takenlijst', label: 'Takenlijst', icon: 'listchecks' },
];

const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  activity: 
  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',

  settings:
  'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',

  shoppingcart:
    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  
  listchecks:
    'M13 6h8M13 12h8M13 18h8M3 7l2 2 4-4M3 17l2 2 4-4',

};

export function Sidebar() {
  const pathname = usePathname();
  const huisgenotenActief = pathname.startsWith('/dashboard/huisgenoten');
  const [huisOpen, setHuisOpen] = useState(huisgenotenActief);
  const activeIndex = items.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href)),
  );

  return (
    <aside className="bg-habico-white text-ink flex w-full shrink-0 flex-col px-4 py-4 md:sticky md:top-0 md:h-screen md:w-[248px] md:px-5 md:py-7">
      <Link
        href="/dashboard"
        aria-label="Habico dashboard"
        className="flex w-fit items-center px-1 md:px-2"
      >
        <Logo />
      </Link>
      <button
        type="button"
        aria-expanded={huisOpen}
        aria-controls="huisgenoten-menu"
        onClick={() => setHuisOpen((open) => !open)}
        className={`border-habico-white/10 bg-habico-landing mt-5 hidden w-full items-center gap-3 border px-3 py-3 text-left transition-colors hover:bg-habico-landing/80 md:flex ${
          huisOpen ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'
        }`}
      >
        <span className="bg-habico-white text-tangy-blue grid size-9 place-items-center rounded-full text-xs font-extrabold">
          <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 10 9-7 9 7" />
            <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="mt-0.5 block truncate text-sm font-bold">Maple House</span>
          <span className="text-habico-grey block text-[10px] font-semibold tracking-[0.12em] uppercase">
            Jouw huis
          </span>
        </span>
        <span
          className={`text-habico-white/50 ml-auto text-xs transition-transform duration-300 motion-reduce:transition-none ${
            huisOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>
      <div
        id="huisgenoten-menu"
        aria-hidden={!huisOpen}
        className={`-mt-px hidden overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:grid ${
          huisOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="border-habico-grey bg-habico-grey/30 min-h-0 overflow-hidden rounded-b-xl border border-t-0 p-0.5">
          <Link
            href="/dashboard/huisgenoten"
            aria-current={huisgenotenActief ? 'page' : undefined}
            tabIndex={huisOpen ? 0 : -1}
            className={`flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors ${
              huisgenotenActief
                ? 'bg-habico-grey text-habico-navy shadow-sm'
                : 'text-habico-blue/75 hover:bg-habico-grey/70 hover:text-habico-navy'
            }`}
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
              <path d={paths.users} />
            </svg>
            <span>Huisgenoten</span>
          </Link>
        </div>
      </div>
      <p className="text-habico-white/40 mt-7 mb-2 hidden px-3 text-[10px] font-extrabold tracking-[0.18em] uppercase md:block">
        Menu
      </p>
      <nav
        aria-label="Hoofdnavigatie"
        className="relative mt-4 hidden gap-2 overflow-x-auto md:mt-0 md:flex md:flex-col md:overflow-visible"
      >
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="bg-habico-soft-blue pointer-events-none absolute inset-x-0 top-0 h-12 rounded-xl shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateY(${activeIndex * 56}px)` }}
          />
        )}
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative z-10 flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition-colors md:min-h-12 md:text-sm ${active ? 'text-tangy-blue' : 'text-habico-white/65 hover:bg-habico-white/[0.07] hover:text-habico-white'}`}
            >
              <svg
                aria-hidden="true"
                className={`size-4 shrink-0 ${active ? 'text-tangy-blue' : undefined}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={paths[item.icon]} />
              </svg>
              <span className={active ? 'text-tangy-blue' : 'text-habico-blue/70'}>
                {item.label}
              </span>
              {active && (
                <span className="bg-habico-orange ml-auto hidden h-5 w-1 rounded-full md:block" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="from-habico-blue to-tangy-blue relative mt-5 hidden overflow-hidden rounded-2xl bg-gradient-to-br p-4 md:mt-auto md:block">
        <div
          aria-hidden="true"
          className="bg-habico-orange absolute -top-16 -left-12 size-40 rounded-full"
        />
        <div className="relative z-10">
          <span className="bg-habico-white/15 text-habico-white grid size-8 place-items-center rounded-lg">
            ✳
          </span>
          <p className="mt-3 text-sm font-bold text-habico-white">Samen sterk.</p>
          <p className="text-habico-white/70 mt-1 text-[11px] leading-relaxed">
            Een fijn huis begint met kleine dingen samen doen.
          </p>
        </div>
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
