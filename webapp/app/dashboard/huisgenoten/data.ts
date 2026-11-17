export type Huisgenoot = { id: number; naam: string };

export const HUISNAAM = "Maple House";

export const HUISGENOTEN: Huisgenoot[] = [
  { id: 1, naam: "Marvin" },
  { id: 2, naam: "Mila" },
  { id: 3, naam: "Jonas" },
  { id: 4, naam: "Sophie" },
  { id: 5, naam: "Emma" },
  { id: 6, naam: "Daan" },
];

export const HUISGENOTEN_NAMEN = HUISGENOTEN.map((huisgenoot) => huisgenoot.naam);
