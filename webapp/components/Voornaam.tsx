"use client";

import { useProfiel } from "@/components/ProfielProvider";

export function Voornaam() {
  const { profiel, geladen } = useProfiel();

  return (
    <span className={`transition-opacity duration-300 ${geladen ? "opacity-100" : "opacity-0"}`}>
      {profiel.voornaam}
    </span>
  );
}