"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  MAX_BIO,
  kleurSleutels,
  standaardProfiel,
  type AvatarKleur,
  type Profiel,
} from "@/lib/profiel";

const STORAGE_KEY = "habico-profiel";

type ProfielContextType = {
  profiel: Profiel;
  geladen: boolean;
  bewaarProfiel: (nieuw: Profiel) => boolean; // true = gelukt
};

const ProfielContext = createContext<ProfielContextType | null>(null);

// Data uit localStorage controleren voordat we hem gebruiken
function leesOpgeslagen(): Profiel | null {
  try {
    const ruw = localStorage.getItem(STORAGE_KEY);
    if (!ruw) return null;
    const data: unknown = JSON.parse(ruw);
    if (typeof data !== "object" || data === null) return null;
    const p = data as Record<string, unknown>;

    const tekst = (waarde: unknown, max: number, terug: string) =>
      typeof waarde === "string" ? waarde.slice(0, max) : terug;

    return {
      voornaam: tekst(p.voornaam, 40, standaardProfiel.voornaam),
      achternaam: tekst(p.achternaam, 60, standaardProfiel.achternaam),
      kamer: tekst(p.kamer, 30, ""),
      bio: tekst(p.bio, MAX_BIO, ""),
      kleur: kleurSleutels.includes(p.kleur as AvatarKleur)
        ? (p.kleur as AvatarKleur)
        : "oranje",
      // Alleen een JPEG die wij zelf hebben gemaakt is toegestaan
      foto:
        typeof p.foto === "string" && p.foto.startsWith("data:image/jpeg;base64,")
          ? p.foto
          : null,
    };
  } catch {
    return null;
  }
}

export function ProfielProvider({ children }: { children: React.ReactNode }) {
  const [profiel, setProfiel] = useState<Profiel>(standaardProfiel);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    const opgeslagen = leesOpgeslagen();
    if (opgeslagen) setProfiel(opgeslagen);
    setGeladen(true);
  }, []);

  function bewaarProfiel(nieuw: Profiel): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nieuw));
    } catch {
      return false; // opslag vol of geblokkeerd
    }
    setProfiel(nieuw);
    return true;
  }

  return (
    <ProfielContext.Provider value={{ profiel, geladen, bewaarProfiel }}>
      {children}
    </ProfielContext.Provider>
  );
}

export function useProfiel() {
  const context = useContext(ProfielContext);
  if (!context) {
    throw new Error("useProfiel moet binnen <ProfielProvider> gebruikt worden");
  }
  return context;
}   