"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useBinnenkomst } from "../_hooks/useBinnenkomst";

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
