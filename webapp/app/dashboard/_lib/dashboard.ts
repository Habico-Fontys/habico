import type { AgendaActiviteit } from "../activiteiten/data";
import type { BoodschappenData, Product } from "../boodschappenlijst/data";
import { translateText, type Locale } from "../../../lib/localization";
import { datumSleutel, startVanWeek } from "./datum";

export type Bijdrage = { bewoner: string; minuten: number; datum: string };
export type Dag = { naam: string; minuten: number };
export type GrafiekDag = Dag & { hoogte: number; titel: string };

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
  locale: Locale = "nl",
): Dag[] {
  return Array.from({ length: 7 }, (_, index) => {
    const datum = vandaag ? startVanWeek(vandaag) : null;
    if (datum) datum.setDate(datum.getDate() + index);
    const dagLabelDatum = new Date(2026, 0, 5 + index, 12);
    return {
      naam: dagLabelDatum.toLocaleDateString(locale, { weekday: "narrow" }),
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

export function berekenGrafiekDagen(
  dagen: Dag[],
  hoogsteDag: number,
  locale: Locale = "nl",
): GrafiekDag[] {
  return dagen.map((dag, index) => {
    const weekday = new Date(2026, 0, 5 + index, 12).toLocaleDateString(
      locale,
      { weekday: "long" },
    );
    const title = `${weekday.charAt(0).toLocaleUpperCase(locale)}${weekday.slice(1)}`;

    return {
      ...dag,
      hoogte: Math.max(5, (dag.minuten / hoogsteDag) * 100),
      titel: `${title}: ${dag.minuten} ${translateText("min", locale)}`,
    };
  });
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
