"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  LayoutDashboard,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  ShoppingCart,
  User,
  Users,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

// Elke pagina krijgt een vaste id. De balk onthoudt alleen die id's.
type NavItem = { id: string; href: string; label: string; icon: LucideIcon };

const alleItems: NavItem[] = [
  { id: "overzicht", href: "/dashboard", label: "Overzicht", icon: LayoutDashboard },
  { id: "boodschappen", href: "/dashboard/boodschappenlijst", label: "Boodschappen", icon: ShoppingCart },
  { id: "activiteiten", href: "/dashboard/activiteiten", label: "Activiteiten", icon: CalendarDays },
  { id: "huisgenoten", href: "/dashboard/huisgenoten", label: "Huisgenoten", icon: Users },
  { id: "instellingen", href: "/dashboard/instellingen", label: "Instellingen", icon: Settings },
  { id: "takenlijst", href: "/dashboard/takenlijst", label: "Takenlijst", icon: ListChecks },
  { id: "profiel", href: "/dashboard/profiel", label: "Profiel", icon: User },
];

// Zo ziet de balk eruit totdat de gebruiker iets aanpast
const standaardIds = ["overzicht", "boodschappen", "activiteiten", "takenlijst"];

const STORAGE_KEY = "habico-nav-balk";



function zoekHuidigId(pathname: string): string | null {
  let beste: NavItem | null = null;
  for (const item of alleItems) {
    const past = pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (past && (!beste || item.href.length > beste.href.length)) beste = item;
  }
  return beste?.id ?? null;
}

// Opgeslagen data controleren: 4 verschillende, bestaande id's, anders de standaard
function leesOpgeslagen(): string[] | null {
  try {
    const ruw = localStorage.getItem(STORAGE_KEY);
    if (!ruw) return null;
    const ids: unknown = JSON.parse(ruw);
    if (!Array.isArray(ids) || ids.length !== 4) return null;
    const geldig = ids.every(
      (id) => typeof id === "string" && alleItems.some((i) => i.id === id)
    );
    if (!geldig || new Set(ids).size !== 4) return null;
    return ids as string[];
  } catch {
    return null;
  }
}

function Blob({ zichtbaar }: { zichtbaar: boolean }) {
  return (
    <span
      className={`absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tangy-blue transition-transform duration-300 motion-reduce:transition-none ${
        zichtbaar ? "scale-100" : "scale-0"
      }`}
    />
  );
}

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const huidigId = zoekHuidigId(pathname);
  const [open, setOpen] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [gekozenSlot, setGekozenSlot] = useState<number | null>(null);
  const [balkIds, setBalkIds] = useState<string[]>(standaardIds);
  const [geladen, setGeladen] = useState(false);
  const [flashingId, setFlashingId] = useState<string | null>(null);

  // ---------- Opslaan en laden ----------
  useEffect(() => {
    const opgeslagen = leesOpgeslagen();
    if (opgeslagen) setBalkIds(opgeslagen);
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (!geladen) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(balkIds));
    } catch {}
  }, [balkIds, geladen]);

  // Escape sluit het menu en stopt het aanpassen
  useEffect(() => {
    if (!open) return;
    const sluitMetEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setBewerken(false);
        setGekozenSlot(null);
      }
    };
    window.addEventListener("keydown", sluitMetEscape);
    return () => window.removeEventListener("keydown", sluitMetEscape);
  }, [open]);

  // ---------- Afgeleide waarden (geen state) ----------
  const perId = new Map(alleItems.map((i) => [i.id, i]));
  const hoofdItems = balkIds.map((id) => perId.get(id)!);
  const overigeItems = alleItems.filter((i) => !balkIds.includes(i.id));

  const actiefIndex = hoofdItems.findIndex((i) => i.id === huidigId);
  // Tijdens het aanpassen volgt de blob het gekozen icoon, anders de huidige pagina
  const blobIndex = bewerken ? gekozenSlot ?? -1 : actiefIndex;
  const kolom = Math.max(blobIndex, 0);
  const blobZichtbaar = blobIndex >= 0;

  const hint =
    gekozenSlot === null
      ? "Tik op een icoon in de balk om het te vervangen of te verplaatsen."
      : `Kies een pagina om ${hoofdItems[gekozenSlot].label} te vervangen, of tik op een ander icoon in de balk om te wisselen.`;

  // ---------- Functies ----------
  function sluit() {
    setOpen(false);
    setBewerken(false);
    setGekozenSlot(null);
  }

  function navigeerViaMenu(item: NavItem) {
    if (flashingId) return;
    setFlashingId(item.id);
    window.setTimeout(() => {
      setFlashingId(null);
      sluit();
      router.push(item.href);
    }, 250);
  }

  // Tik op een icoon in de balk (alleen tijdens het aanpassen)
  function kiesSlot(index: number) {
    if (gekozenSlot === null) {
      setGekozenSlot(index);
    } else if (gekozenSlot === index) {
      setGekozenSlot(null); // nog een keer tikken = kiezen ongedaan maken
    } else {
      // Twee iconen in de balk: wissel ze van plek
      const nieuw = [...balkIds];
      [nieuw[gekozenSlot], nieuw[index]] = [nieuw[index], nieuw[gekozenSlot]];
      setBalkIds(nieuw);
      setGekozenSlot(null);
    }
  }

  // Tik op een pagina in het menu: die komt in het gekozen vakje
  function kiesMenuItem(id: string) {
    if (gekozenSlot === null) return;
    const nieuw = [...balkIds];
    nieuw[gekozenSlot] = id;
    setBalkIds(nieuw);
    setGekozenSlot(null);
  }

  const menuItemKlasse =
    "flex min-h-14 w-full items-center gap-3 rounded-2xl p-3 text-left text-sm font-semibold leading-tight transition active:scale-[0.97]";

  return (
    <>
      {/* Donkere laag achter het menu */}
      <div
        aria-hidden="true"
        onClick={sluit}
        className={`fixed inset-0 z-40 bg-habico-navy-dark/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Hoofdmenu"
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] transition-opacity duration-300 md:hidden ${
          geladen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative mx-auto max-w-sm">
          {/* Voor screenreaders: meldt wat er gebeurt tijdens het aanpassen */}
          <p className="sr-only" aria-live="polite">
            {bewerken ? hint : ""}
          </p>

          {/* Menu */}
          <div
            id="meer-menu"
            inert={!open}
            className={`absolute bottom-full left-0 right-0 mb-10 origin-bottom transition duration-300 motion-reduce:transition-none ${
              open
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-90 opacity-0"
            }`}
          >
            <div className="rounded-3xl border border-habico-grey/80 bg-habico-white p-3 shadow-2xl backdrop-blur-xl">
              {/* Kopregel */}
              <div className="mb-3 flex items-start justify-between gap-2 px-1">
                <p className="min-w-0 flex-1 pt-1.5 text-sm font-semibold text-habico-navy">
                  {bewerken ? hint : "Meer pagina's"}
                </p>

                {bewerken ? (
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBalkIds(standaardIds);
                        setGekozenSlot(null);
                      }}
                      aria-label="Standaardbalk herstellen"
                      className="flex size-9 items-center justify-center rounded-full bg-habico-soft-blue text-habico-navy transition active:scale-95"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBewerken(false);
                        setGekozenSlot(null);
                      }}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-tangy-blue px-3 text-sm font-semibold text-white transition active:scale-95"
                    >
                      <Check size={16} aria-hidden="true" />
                      Klaar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBewerken(true)}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-habico-soft-blue px-3 text-sm font-semibold text-habico-navy transition active:scale-95"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Aanpassen
                  </button>
                )}
              </div>

              {/* De pagina's die niet in de balk staan */}
              <ul className="grid grid-cols-2 gap-3">
                {overigeItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      {bewerken ? (
                        <button
                          type="button"
                          disabled={gekozenSlot === null}
                          onClick={() => kiesMenuItem(item.id)}
                          className={`${menuItemKlasse} bg-habico-soft-blue text-habico-navy disabled:opacity-50`}
                        >
                          <Icon size={20} aria-hidden="true" className="shrink-0" />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={(event) => {
                            event.preventDefault();
                            navigeerViaMenu(item);
                          }}
                          aria-current={item.id === huidigId ? "page" : undefined}
                          className={`${menuItemKlasse} bg-habico-soft-blue transition-colors duration-150 ${
                            flashingId === item.id
                              ? "text-tangy-blue"
                              : "text-habico-navy"
                          }`}
                        >
                          <Icon
                            size={20}
                            aria-hidden="true"
                            className={`shrink-0 transition-[color,filter] duration-200 ${
                              flashingId === item.id
                                ? "text-tangy-blue drop-shadow-[0_0_8px_rgba(29,56,255,0.95)]"
                                : ""
                            }`}
                          />
                          <span
                            className={
                              flashingId === item.id
                                ? "font-extrabold text-tangy-blue drop-shadow-[0_0_8px_rgba(29,56,255,0.95)]"
                                : ""
                            }
                          >
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* De pill bar */}
          <div className="pointer-events-auto relative h-16 rounded-full border border-habico-grey/80 bg-habico-white shadow-[0_10px_40px_rgba(0,35,71,0.2)] backdrop-blur-xl">
            <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
              <defs>
                <filter id="goo-nav" colorInterpolationFilters="sRGB">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                  />
                </filter>
              </defs>
            </svg>

            {/* Twee blobs die op een iets andere snelheid bewegen = gooey effect */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ filter: "url(#goo-nav)" }}
            >
              <div
                className="absolute inset-y-0 left-0 w-1/4 transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(${kolom * 100}%)` }}
              >
                <Blob zichtbaar={blobZichtbaar} />
              </div>
              <div
                className="absolute inset-y-0 left-0 w-1/4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
                style={{ transform: `translateX(${kolom * 100}%)` }}
              >
                <Blob zichtbaar={blobZichtbaar} />
              </div>
            </div>

            {/* De iconen */}
            <ul className="relative z-10 grid h-full grid-cols-4">
              {hoofdItems.map((item, index) => {
                const Icon = item.icon;
                const opBlob = index === blobIndex;
                const knopKlasse =
                  "flex h-full w-full items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-habico-navy-dark";
                const icoon = (
                  <span
                    className={bewerken ? "motion-safe:animate-wiggle" : ""}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <Icon
                      size={22}
                      aria-hidden="true"
                      className={`transition-colors duration-300 ${
                        opBlob ? "text-white" : "text-habico-navy"
                      }`}
                    />
                  </span>
                );

                return (
                  <li key={item.id}>
                    {bewerken ? (
                      <button
                        type="button"
                        onClick={() => kiesSlot(index)}
                        aria-pressed={gekozenSlot === index}
                        aria-label={`${item.label}, tik om te vervangen of te verplaatsen`}
                        className={knopKlasse}
                      >
                        {icoon}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={sluit}
                        aria-current={index === actiefIndex ? "page" : undefined}
                        className={knopKlasse}
                      >
                        {icoon}
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Plusje op de bovenrand, in het midden */}
            <button
              type="button"
              onClick={() => (open ? sluit() : setOpen(true))}
              aria-expanded={open}
              aria-controls="meer-menu"
              aria-label={open ? "Sluit menu" : "Meer pagina's"}
              className="absolute left-1/2 top-0 z-20 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-fire-orange text-habico-navy-dark shadow-lg ring-4 ring-habico-grey transition active:scale-95"
            >
              <Plus
                size={26}
                aria-hidden="true"
                className={`transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}