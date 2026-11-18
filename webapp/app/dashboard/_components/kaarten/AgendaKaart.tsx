import { ArrowUpRight, CalendarDays, ChevronRight } from "lucide-react";
import { DashboardKaart } from "../DashboardKaart";
import { Pijl } from "../Pijl";
import type { AgendaActiviteit } from "../../activiteiten/data";
import { HUISNAAM } from "../../huisgenoten/data";

export type AgendaKaartProps = {
  href: string;
  agendaItems: AgendaActiviteit[];
};

export function AgendaKaart({ href, agendaItems }: AgendaKaartProps) {
  // Hoge witte agendakaart: gestapelde kaarten als in de referentie.
  return (
    <DashboardKaart
      href={href}
      label="Open de gezamenlijke agenda"
      className="border border-dashboard-border bg-dashboard-surface xl:col-start-3 xl:row-span-2 xl:row-start-1"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Samen vooruit</h2>
        <Pijl />
      </div>
      <p className="mt-3 text-xs text-dashboard-muted">Maak ruimte voor elkaar.</p>
      {/* Gestapelde kaarten met een effen primaire blauwe voorkant. */}
      <div aria-hidden="true" className="relative mb-6 mt-8 h-40">
        <div className="absolute inset-x-6 top-0 h-28 -rotate-6 rounded-2xl bg-dashboard-stack-blue" />
        <div className="absolute inset-x-3 top-4 h-28 rotate-3 rounded-2xl bg-fire-orange" />
        <div className="absolute inset-x-0 top-8 flex h-32 flex-col justify-between rounded-2xl bg-tangy-blue p-5 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            {HUISNAAM}
          </span>
          <div className="flex items-end justify-between gap-3">
            <span className="text-2xl font-semibold leading-tight text-white">
              Meer samen.
              <br />
              Meer thuis.
            </span>
            <CalendarDays
              size={30}
              strokeWidth={1.5}
              className="shrink-0 text-white"
            />
          </div>
        </div>
      </div>
      <h3 className="mb-3 text-xs font-semibold text-dashboard-muted">
        Uit de huisagenda
      </h3>
      <div className="space-y-2">
        {agendaItems.length > 0 ? agendaItems.map((activiteit) => {
          const datum = new Date(`${activiteit.date}T12:00:00`);
          return (
            <div
              key={activiteit.id}
              className="flex items-center gap-3 rounded-2xl bg-dashboard-soft-surface p-3"
            >
              <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-sm font-bold">
                {datum.getDate()}
                <span className="text-[8px] font-medium uppercase text-dashboard-muted">
                  {datum.toLocaleDateString("nl-NL", { month: "short" })}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold">{activiteit.title}</p>
                <p className="mt-1 text-[10px] leading-4 text-dashboard-muted">
                  {activiteit.time} · {activiteit.location}
                </p>
              </div>
              <ChevronRight size={14} className="ml-auto shrink-0 text-dashboard-muted" />
            </div>
          );
        }) : (
          <p className="rounded-2xl bg-dashboard-soft-surface p-4 text-xs text-dashboard-muted">
            Er staan nog geen activiteiten in de agenda.
          </p>
        )}
      </div>
      <span className="mt-6 flex items-center gap-2 text-xs font-semibold text-tangy-blue">
        Bekijk de agenda <ArrowUpRight size={14} />
      </span>
    </DashboardKaart>
  );
}
