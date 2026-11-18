"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { euro } from "../_lib/euro";
import { useBinnenkomst } from "../_hooks/useBinnenkomst";

// ---------- Animaties: cijfers en elementen komen rustig in beeld ----------
// Geen extra pakket nodig. De browserinstelling voor minder beweging gaat voor.
export function OplopendGetal({ waarde, bedrag = false }: { waarde: number; bedrag?: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  const huidig = useRef(0);
  const [getal, setGetal] = useState(0);

  useEffect(() => {
    const voorkeur = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observer: IntersectionObserver | undefined;

    function directTonen() {
      cancelAnimationFrame(frame);
      huidig.current = waarde;
      setGetal(waarde);
    }

    function starten() {
      if (voorkeur.matches) return directTonen();
      const begin = huidig.current;
      const starttijd = performance.now();

      function stap(tijd: number) {
        const voortgang = Math.min((tijd - starttijd) / 1000, 1);
        // Ease-out: snel beginnen, zacht afremmen bij het juiste getal.
        const soepel = 1 - Math.pow(1 - voortgang, 3);
        huidig.current = begin + (waarde - begin) * soepel;
        setGetal(huidig.current);
        if (voortgang < 1) frame = requestAnimationFrame(stap);
      }
      frame = requestAnimationFrame(stap);
    }

    if (voorkeur.matches || !("IntersectionObserver" in window)) {
      directTonen();
    } else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer?.disconnect();
          starten();
        }
      });
      if (element.current) observer.observe(element.current);
    }

    function voorkeurGewijzigd() {
      if (voorkeur.matches) {
        observer?.disconnect();
        directTonen();
      }
    }
    voorkeur.addEventListener("change", voorkeurGewijzigd);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      voorkeur.removeEventListener("change", voorkeurGewijzigd);
    };
  }, [waarde]);

  return (
    <span ref={element} className="tabular-nums">
      {/* Screenreaders lezen alleen de uiteindelijke waarde. */}
      <span aria-hidden="true">{bedrag ? euro(getal) : Math.round(getal)}</span>
      <span className="sr-only">{bedrag ? euro(waarde) : waarde}</span>
    </span>
  );
}

// De hoogte blijft gekoppeld aan de minuten; de balk groeit vanaf de onderkant.
export function GrafiekBalk({ hoogte }: { hoogte: number }) {
  const ref = useBinnenkomst<HTMLDivElement>(true);
  return (
    <div
      ref={ref}
      className="min-h-1.5 origin-bottom rounded-t-xl bg-[#1D38FF] transition-[height] duration-700 ease-out motion-reduce:transition-none"
      style={{ height: `${hoogte}%` }}
    />
  );
}

// ---------- 4. Herbruikbare kaart ----------
// De hele kaart is één link. Er zitten geen losse knoppen in een link.
export function DashboardKaart({
  href,
  label,
  className = "",
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const kaartRef = useBinnenkomst<HTMLAnchorElement>();

  return (
    <Link
      ref={kaartRef}
      href={href}
      aria-label={label}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[30px] p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FD7702] motion-reduce:transform-none motion-reduce:transition-none sm:p-7 ${className}`}
    >
      {children}
    </Link>
  );
}

// Het pijltje beweegt mee wanneer je over de kaart gaat.
export function Pijl({ donker = false }: { donker?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 motion-reduce:transition-none ${
        donker ? "bg-white/10 text-white" : "bg-[#f1f2f7] text-[#032747]"
      }`}
    >
      <ArrowUpRight size={18} />
    </span>
  );
}
