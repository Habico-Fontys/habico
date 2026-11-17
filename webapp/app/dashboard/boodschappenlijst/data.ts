import { HUISGENOTEN } from "../huisgenoten/data";

export type Product = {
  id: number;
  naam: string;
  omschrijving: string;
  prijs: number;
  aanbieding: string;
  gekocht: boolean;
  toegevoegdDoor: string;
};

export type Bewoner = {
  id: number;
  naam: string;
  betaaldBedrag: number;
};

export type Voorstel = {
  nieuwBedrag: number;
  goedgekeurdDoor: number[];
};

export type BoodschappenData = {
  producten: Product[];
  bewoners: Bewoner[];
  inleg: number;
  voorstel: Voorstel | null;
};

export const BOODSCHAPPEN_OPSLAG = "habico-boodschappen-v1";

export const BEGIN_BOODSCHAPPEN_DATA: BoodschappenData = {
  producten: [
    { id: 1, naam: "Toiletpapier", omschrijving: "12 rollen", prijs: 5.49, aanbieding: "", gekocht: false, toegevoegdDoor: "Marvin" },
    { id: 2, naam: "Allesreiniger", omschrijving: "1 fles", prijs: 2.79, aanbieding: "2e halve prijs", gekocht: false, toegevoegdDoor: "Mila" },
    { id: 3, naam: "Afwasmiddel", omschrijving: "2 flessen", prijs: 3.5, aanbieding: "", gekocht: true, toegevoegdDoor: "Marvin" },
  ],
  bewoners: HUISGENOTEN.map((bewoner, index) => ({
    ...bewoner,
    betaaldBedrag: index < 3 ? 35 : 0,
  })),
  inleg: 35,
  voorstel: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    typeof value.naam === "string" &&
    typeof value.omschrijving === "string" &&
    typeof value.prijs === "number" &&
    Number.isFinite(value.prijs) &&
    typeof value.aanbieding === "string" &&
    typeof value.gekocht === "boolean" &&
    typeof value.toegevoegdDoor === "string"
  );
}

function isBewoner(value: unknown): value is Bewoner {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    typeof value.naam === "string" &&
    typeof value.betaaldBedrag === "number" &&
    Number.isFinite(value.betaaldBedrag)
  );
}

function isVoorstel(value: unknown): value is Voorstel {
  return (
    isRecord(value) &&
    typeof value.nieuwBedrag === "number" &&
    Number.isFinite(value.nieuwBedrag) &&
    Array.isArray(value.goedgekeurdDoor) &&
    value.goedgekeurdDoor.every(
      (id) => typeof id === "number" && Number.isFinite(id),
    )
  );
}

export function isBoodschappenData(value: unknown): value is BoodschappenData {
  return (
    isRecord(value) &&
    Array.isArray(value.producten) &&
    value.producten.every(isProduct) &&
    Array.isArray(value.bewoners) &&
    value.bewoners.every(isBewoner) &&
    typeof value.inleg === "number" &&
    Number.isFinite(value.inleg) &&
    (value.voorstel === null || isVoorstel(value.voorstel))
  );
}
