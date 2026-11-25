'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, PartyPopper, Trash2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import SidebarProfielLink from '@/components/SidebarProfielLink'; // NIEUW
import { useHuidigHuis } from '@/components/HuidigHuisBadge';

const items = [
  { href: '/dashboard', label: 'Overzicht', icon: 'grid' },
  { href: '/dashboard/kalender', label: 'Agenda', icon: 'calendar-days' },
  { href: '/dashboard/activiteiten', label: 'Activiteiten', icon: 'party-popper' },
  { href: '/dashboard/boodschappenlijst', label: 'Boodschappen', icon: 'shoppingcart' },
  { href: '/dashboard/takenlijst', label: 'Takenlijst', icon: 'listchecks' },
  { href: '/dashboard/afval', label: 'Afval', icon: 'trash' },
];

const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  'calendar-days': 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  shoppingcart:
    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  listchecks: 'M13 6h8M13 12h8M13 18h8M3 7l2 2 4-4M3 17l2 2 4-4',
};

export function Sidebar() {
  const pathname = usePathname();
  const currentHouse = useHuidigHuis();
  const huisgenotenActief = pathname.startsWith('/dashboard/huisgenoten');
  const huisgenotenPaginaActief = pathname === '/dashboard/huisgenoten';
  const [huisOpen, setHuisOpen] = useState(huisgenotenActief);
  const [collapsed, setCollapsed] = useState(false);
  const activeIndex = items.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href)),
  );

  return (
    <aside
      className={`bg-habico-white text-ink flex w-full shrink-0 flex-col px-4 py-4 transition-[width] duration-300 ease-in-out motion-reduce:transition-none md:sticky md:top-0 md:h-screen md:py-7 ${
        collapsed ? 'md:w-[76px] md:px-3' : 'md:w-[248px] md:px-5'
      }`}
    >
      <div
        className={`flex min-h-[52px] items-center justify-between transition-[min-height] duration-300 motion-reduce:transition-none ${
          collapsed ? 'md:min-h-[104px] md:flex-col md:items-end md:justify-start md:gap-2' : ''
        }`}
      >
        <Link
          href="/dashboard"
          aria-label="Habico dashboard"
          className={`flex h-[52px] w-[154px] items-center overflow-hidden ${
            collapsed ? 'md:order-2 md:w-[52px] md:justify-center md:self-center' : 'md:order-1'
          }`}
        >
          {collapsed ? (
            <>
              <span className="block md:hidden">
                <Logo />
              </span>
              <Image
                src="/brand/Habico_Logo_Icon.svg"
                alt=""
                width={48}
                height={51}
                className="hidden h-12 w-auto object-contain md:block"
              />
            </>
          ) : (
            <Logo />
          )}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
          aria-expanded={!collapsed}
          aria-controls="hoofdnavigatie"
          title={collapsed ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
          onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
          className={`hidden size-10 shrink-0 place-items-center bg-transparent text-habico-grey transition-colors hover:text-habico-blue focus-visible:outline-tangy-blue focus-visible:outline-2 focus-visible:outline-offset-2 md:grid ${
            collapsed ? 'md:order-1' : 'md:order-2'
          }`}
        >
          {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>
      <button
        type="button"
        title={`${currentHouse.name} — huisgenotenmenu`}
        aria-expanded={huisOpen}
        aria-controls="huisgenoten-menu"
        onClick={() => setHuisOpen((open) => !open)}
        className={`border-habico-white/10 bg-habico-landing mt-5 hidden w-full items-center border py-3 text-left transition-all duration-300 hover:bg-habico-landing/80 motion-reduce:transition-none md:flex ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${huisOpen ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'}`}
      >
        <span className="bg-habico-white text-tangy-blue grid size-9 place-items-center rounded-full text-xs font-extrabold">
          <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 10 9-7 9 7" />
            <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
          </svg>
        </span>
        <span
          className={`min-w-0 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity] duration-300 motion-reduce:transition-none ${
            collapsed ? 'md:max-w-0 md:opacity-0' : 'md:max-w-40'
          }`}
        >
          <span className="mt-0.5 block truncate text-sm font-bold">{currentHouse.name}</span>
          <span className="text-habico-grey block text-[10px] font-semibold tracking-[0.12em] uppercase">
            Jouw huis
          </span>
        </span>
        {!collapsed && (
          <span
            className={`text-habico-white/50 ml-auto text-xs transition-transform duration-300 motion-reduce:transition-none ${
              huisOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            ⌄
          </span>
        )}
      </button>
      <div
        id="huisgenoten-menu"
        aria-hidden={!huisOpen}
        className={`-mt-px hidden  transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:grid ${
          huisOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="border-habico-grey bg-habico-grey/30 min-h-0 overflow-hidden rounded-b-xl border border-t-0 p-0.5">
          <Link
            href="/dashboard/huisgenoten"
            aria-current={huisgenotenPaginaActief ? 'page' : undefined}
            tabIndex={huisOpen ? 0 : -1}
            title="Huisgenoten"
            className={`flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold transition-colors ${
              collapsed ? 'justify-center gap-0 md:px-0' : 'gap-2'
            } ${
              huisgenotenPaginaActief
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
            <span
              className={`max-w-40 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity] duration-300 motion-reduce:transition-none ${
                collapsed ? 'md:max-w-0 md:opacity-0' : ''
              }`}
            >
              Huisgenoten
            </span>
          </Link>
          <Link
            href="/dashboard/huisgenoten/wisselen"
            aria-current={pathname === '/dashboard/huisgenoten/wisselen' ? 'page' : undefined}
            tabIndex={huisOpen ? 0 : -1}
            title="Van huis wisselen"
            className={`flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold transition-colors ${
              collapsed ? 'justify-center gap-0 md:px-0' : 'gap-2'
            } ${
              pathname === '/dashboard/huisgenoten/wisselen'
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
              <path d="M7 7h11l-3-3M17 17H6l3 3" />
              <path d="M18 7a6 6 0 0 1 1 3M6 17a6 6 0 0 1-1-3" />
            </svg>
            <span
              className={`max-w-40 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity] duration-300 motion-reduce:transition-none ${
                collapsed ? 'md:max-w-0 md:opacity-0' : ''
              }`}
            >
              Van huis wisselen
            </span>
          </Link>
        </div>
      </div>
      {!collapsed && (
        <p className="text-habico-white/40 mt-7 mb-2 hidden px-3 text-[10px] font-extrabold tracking-[0.18em] uppercase md:block">
          Menu
        </p>
      )}
      <nav
        aria-label="Hoofdnavigatie"
        id="hoofdnavigatie"
        className={`relative mt-4 hidden gap-2 overflow-x-auto md:flex md:flex-col md:overflow-visible ${
          collapsed ? 'md:mt-7' : 'md:mt-0'
        }`}
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
              title={item.label}
              className={`relative z-10 flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition-colors md:min-h-12 md:text-sm ${
                collapsed ? 'md:justify-center md:gap-0 md:px-0' : ''
              } ${active ? 'text-tangy-blue' : 'text-habico-white/65 hover:bg-habico-white/[0.07] hover:text-habico-white'}`}
            >
              {item.icon === 'trash' ? (
                <Trash2
                  aria-hidden="true"
                  className={`size-4 shrink-0 ${active ? 'text-tangy-blue' : undefined}`}
                  strokeWidth={1.8}
                />
              ) : item.icon === 'party-popper' ? (
                <PartyPopper
                  aria-hidden="true"
                  className={`size-4 shrink-0 ${active ? 'text-tangy-blue' : undefined}`}
                  strokeWidth={1.8}
                />
              ) : (
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
              )}
              <span
                className={`max-w-[160px] overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity] duration-300 motion-reduce:transition-none ${
                  collapsed ? 'md:max-w-0 md:opacity-0' : ''
                } ${active ? 'text-tangy-blue' : 'text-habico-blue/70'}`}
              >
                {item.label}
              </span>
              {active && (
                <span className="bg-habico-orange absolute top-1/2 right-0 hidden h-5 w-1 -translate-y-1/2 rounded-full md:block" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={`from-habico-blue to-tangy-blue relative mt-5 hidden overflow-hidden rounded-2xl bg-gradient-to-br p-4 transition-[max-height,opacity,margin,padding] duration-300 motion-reduce:transition-none md:block ${
          collapsed
            ? 'md:mt-0 md:max-h-0 md:p-0 md:opacity-0'
            : 'md:mt-auto md:max-h-64 md:opacity-100'
        }`}
      >
        <div
          aria-hidden="true"
          className="bg-habico-orange absolute -top-18 -left-12 size-40 rounded-full"
        />
        <div className="relative z-10">
          <span className="bg-habico-white/15 text-habico-white grid size-8 place-items-center rounded-lg" margin-bottom="2">
            ✳
          </span>
          <p className="mt-3 text-sm font-bold text-habico-white">Samen sterk.</p>
          <p className="text-habico-white/70 mt-1 text-[11px] leading-relaxed">
            Een fijn huis begint met kleine dingen samen doen.
          </p>
        </div>
      </div>

      {/* NIEUW: het oude blok met "AD" en "Marvin Verspeek" is vervangen door een
          link naar het profiel. Ingeklapt blijft alleen de avatar zichtbaar. */}
      <div
        className={`mt-4 hidden border-t border-[var(--line)] pt-4 md:block ${
          collapsed ? 'md:mt-auto' : ''
        }`}
      >
        <SidebarProfielLink collapsed={collapsed} />
      </div>
    </aside>
  );
}