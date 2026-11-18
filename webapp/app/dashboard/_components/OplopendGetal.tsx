"use client";

import { useEffect, useRef, useState } from "react";
import { euro } from "../_lib/euro";
import { useReducedMotion } from "../_hooks/useReducedMotion";

// ---------- Animaties: cijfers en elementen komen rustig in beeld ----------
// Geen extra pakket nodig. De browserinstelling voor minder beweging gaat voor.
export function OplopendGetal({ waarde, bedrag = false }: { waarde: number; bedrag?: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  const huidig = useRef(0);
  const frame = useRef(0);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const [getal, setGetal] = useState(0);
  const voorkeur = useReducedMotion();
  const voorkeurActueel = useRef(false);


  useEffect(() => {
    voorkeurActueel.current = voorkeur;
    if (!voorkeur) return;
    observer.current?.disconnect();
    cancelAnimationFrame(frame.current);
    huidig.current = waarde;
  }, [voorkeur, waarde]);

  useEffect(() => {
    function directTonen() {
      cancelAnimationFrame(frame.current);
      huidig.current = waarde;
      setGetal(waarde);
    }

    function starten() {
      if (voorkeurActueel.current) return directTonen();
      const begin = huidig.current;
      const starttijd = performance.now();

      function stap(tijd: number) {
        const voortgang = Math.min((tijd - starttijd) / 1000, 1);
        // Ease-out: snel beginnen, zacht afremmen bij het juiste getal.
        const soepel = 1 - Math.pow(1 - voortgang, 3);
        huidig.current = begin + (waarde - begin) * soepel;
        setGetal(huidig.current);
        if (voortgang < 1) frame.current = requestAnimationFrame(stap);
      }
      frame.current = requestAnimationFrame(stap);
    }

    if (voorkeurActueel.current || !("IntersectionObserver" in window)) {
      directTonen();
    } else {
      observer.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.current?.disconnect();
          starten();
        }
      });
      if (element.current) observer.current.observe(element.current);
    }

    return () => {
      observer.current?.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [waarde]);

  return (
    <span ref={element} className="tabular-nums">
      {/* Screenreaders lezen alleen de uiteindelijke waarde. */}
      <span aria-hidden="true">
        {bedrag ? euro(voorkeur ? waarde : getal) : Math.round(voorkeur ? waarde : getal)}
      </span>
      <span className="sr-only">{bedrag ? euro(waarde) : waarde}</span>
    </span>
  );
}
