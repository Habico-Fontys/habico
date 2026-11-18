import type { AgendaActiviteit } from "../activiteiten/data";
import type { BoodschappenData, Product } from "../boodschappenlijst/data";
import { datumSleutel, startVanWeek } from "./datum";

export type Bijdrage = { bewoner: string; minuten: number; datum: string };
export type Dag = { naam: string; minuten: number };

export function berekenWeekTotalen(bijdragen: Bijdrage[], weekdoel: number) {
  const minuten = bijdragen.reduce((som, item) => som + item.minuten, 0);
  return { minuten, percentage: Math.round((minuten / weekdoel) * 100) };
}

export function berekenBudget(boodschappen: BoodschappenData): {
  ingelegd: number;
  uitgegeven: number;
  beschikbaar: number;
  productenNodig: Product[];
} {
  const ingelegd = boodschappen.bewoners.reduce(
    (totaal, bewoner) => totaal + bewoner.betaaldBedrag,
    0,
  );
  const uitgegeven = boodschappen.producten
    .filter((product) => product.gekocht)
    .reduce((totaal, product) => totaal + product.prijs, 0);
  const beschikbaar = ingelegd - uitgegeven;
  const productenNodig = boodschappen.producten.filter(
    (product) => !product.gekocht,
  );
  return { ingelegd, uitgegeven, beschikbaar, productenNodig };
}

export function selecteerAgendaItems(activiteiten: AgendaActiviteit[]) {
  return [...activiteiten]
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 3);
}

export function bepaalBegroeting(vandaag: Date | null) {
  return !vandaag
    ? "Welkom thuis"
    : vandaag.getHours() < 12
      ? "Goedemorgen"
      : vandaag.getHours() < 18
        ? "Goedemiddag"
        : "Goedenavond";
}

export function berekenDagen(
  vandaag: Date | null,
  bijdragen: Bijdrage[],
): Dag[] {
  return Array.from({ length: 7 }, (_, index) => {
    const datum = vandaag ? startVanWeek(vandaag) : null;
    if (datum) datum.setDate(datum.getDate() + index);
    return {
      naam: ["M", "D", "W", "D", "V", "Z", "Z"][index],
      minuten: datum
        ? bijdragen
            .filter((item) => item.datum === datumSleutel(datum))
            .reduce((som, item) => som + item.minuten, 0)
        : 0,
    };
  });
}

export function bepaalHoogsteDag(dagen: Dag[]) {
  return Math.max(30, ...dagen.map((dag) => dag.minuten));
}

export function filterBijdragen(
  opgeslagen: unknown,
  weekStart: string,
  weekEinde: string,
): Bijdrage[] | null {
  if (!Array.isArray(opgeslagen)) return null;

  return opgeslagen.filter(
    (item): item is Bijdrage =>
      item !== null &&
      typeof item === "object" &&
      typeof item.bewoner === "string" &&
      typeof item.minuten === "number" &&
      Number.isFinite(item.minuten) &&
      item.minuten > 0 &&
      typeof item.datum === "string" &&
      item.datum >= weekStart &&
      item.datum <= weekEinde,
  );
}
