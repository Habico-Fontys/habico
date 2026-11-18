"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

// Speel een binnenkomst één keer af zodra het element zichtbaar wordt.
export function useBinnenkomst<T extends HTMLElement>(grafiek = false) {
  const ref = useRef<T>(null);
  const animatie = useRef<Animation | undefined>(undefined);
  const voorkeurActueel = useRef(false);
  const voorkeur = useReducedMotion();

  useEffect(() => {
    voorkeurActueel.current = voorkeur;
    if (voorkeur) animatie.current?.cancel();
  }, [voorkeur]);

  useEffect(() => {
    const element = ref.current;
    if (!element || voorkeurActueel.current || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (voorkeurActueel.current) return;
        animatie.current = element.animate(
          grafiek
            ? [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }]
            : [
                { opacity: 0, transform: "translateY(12px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
          { duration: grafiek ? 950 : 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      },
      { threshold: 0.1 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      animatie.current?.cancel();
    };
  }, [grafiek]);

  return ref;
}
