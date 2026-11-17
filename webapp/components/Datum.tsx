"use client";

import { useEffect, useState } from "react";

type Variant = "kort" | "lang";

// Gives "Maandag, 9 november" (kort) or "maandag 9 november 2026" (lang)
function formatteer(variant: Variant, datum: Date): string {
  const dag = new Intl.DateTimeFormat("nl-NL", { weekday: "long" }).format(datum);
  const rest = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    ...(variant === "lang" ? { year: "numeric" } : {}),
  }).format(datum);

  return variant === "kort"
    ? `${dag.charAt(0).toUpperCase()}${dag.slice(1)}, ${rest}`
    : `${dag} ${rest}`;
}

export function Datum({ variant = "kort" }: { variant?: Variant }) {
  const [tekst, setTekst] = useState<string | null>(null);

  useEffect(() => {
    const bijwerken = () => setTekst(formatteer(variant, new Date()));
    bijwerken();

    // Check every minute, so a tab left open past midnight updates too
    const timer = window.setInterval(bijwerken, 60_000);
    return () => window.clearInterval(timer);
  }, [variant]);

  return (
    // Until the date is known, an invisible placeholder reserves the space,
    // so the layout doesn't jump
    <span
      className={`transition-opacity duration-300 ${
        tekst ? "opacity-100" : "opacity-0"
      }`}
    >
      {tekst ?? (variant === "kort" ? "Woensdag, 30 september" : "woensdag 30 september 2026")}
    </span>
  );
}