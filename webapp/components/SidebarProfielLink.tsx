"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfiel } from "@/components/ProfielProvider";
import ProfielAvatar from "@/components/ProfielAvatar";
import { volledigeNaam } from "@/lib/profiel";

export default function SidebarProfielLink({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { profiel, geladen } = useProfiel();
  const pathname = usePathname();
  const isActief = pathname.startsWith("/dashboard/profiel");

  return (
    <Link
      href="/dashboard/profiel"
      aria-current={isActief ? "page" : undefined}
      title="Mijn profiel"
      className={`relative flex min-h-12 items-center rounded-xl transition duration-300 hover:bg-habico-soft-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-habico-navy-dark motion-reduce:transition-none ${
        collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2"
      } ${isActief ? "bg-habico-soft-blue" : ""} ${
        geladen ? "opacity-100" : "opacity-0"
      }`}
    >
      <ProfielAvatar profiel={profiel} className="size-9" tekstKlasse="text-xs" />

      <span
        className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 motion-reduce:transition-none ${
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
        }`}
      >
        <span className="block truncate text-sm font-bold text-habico-navy">
          {volledigeNaam(profiel)}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[var(--muted)]">
          {profiel.kamer || "Mijn profiel"}
        </span>
      </span>

      {isActief && !collapsed && (
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-habico-orange"
        />
      )}
    </Link>
  );
}