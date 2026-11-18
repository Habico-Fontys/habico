"use client";

import { useEffect, useRef } from "react";

// Speel een binnenkomst één keer af zodra het element zichtbaar wordt.
export function useBinnenkomst<T extends HTMLElement>(grafiek = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    const voorkeur = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || voorkeur.matches || !("IntersectionObserver" in window)) return;

    let animatie: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (voorkeur.matches) return;
        animatie = element.animate(
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

    function voorkeurGewijzigd() {
      if (voorkeur.matches) animatie?.cancel();
    }
    voorkeur.addEventListener("change", voorkeurGewijzigd);
    return () => {
      observer.disconnect();
      animatie?.cancel();
      voorkeur.removeEventListener("change", voorkeurGewijzigd);
    };
  }, [grafiek]);

  return ref;
}
