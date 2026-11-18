"use client";

import { useBinnenkomst } from "../_hooks/useBinnenkomst";

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
