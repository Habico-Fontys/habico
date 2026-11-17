export type Categorie = "schoonmaak" | "huishoudelijk";

export type Taak = {
  id: number;
  naam: string;
  ruimte: string;
  minuten: number;
  dag: number;
  bewoner: string;
  categorie: Categorie;
};

export const REGISTRATIES_OPSLAG = "habico-takenregistraties-v1";

export const TAKEN: Taak[] = [
  { id: 1, naam: "Keuken schoonmaken", ruimte: "Keuken · 18 m²", minuten: 30, dag: 0, bewoner: "Mila", categorie: "schoonmaak" },
  { id: 2, naam: "Woonkamer stofzuigen", ruimte: "Woonkamer · 32 m²", minuten: 40, dag: 2, bewoner: "Marvin", categorie: "schoonmaak" },
  { id: 3, naam: "Badkamer schoonmaken", ruimte: "Badkamer · 8 m²", minuten: 25, dag: 1, bewoner: "Sophie", categorie: "schoonmaak" },
  { id: 4, naam: "Gang dweilen", ruimte: "Gang · 12 m²", minuten: 20, dag: 4, bewoner: "Emma", categorie: "schoonmaak" },
  { id: 5, naam: "Hal poetsen", ruimte: "Hal · 10 m²", minuten: 20, dag: 5, bewoner: "Daan", categorie: "schoonmaak" },
  { id: 6, naam: "Vaatwasser uitruimen", ruimte: "Keuken", minuten: 10, dag: 0, bewoner: "Marvin", categorie: "huishoudelijk" },
  { id: 7, naam: "Gezamenlijke was ophangen", ruimte: "Wasruimte", minuten: 15, dag: 2, bewoner: "Mila", categorie: "huishoudelijk" },
  { id: 8, naam: "Planten water geven", ruimte: "Woonkamer", minuten: 5, dag: 4, bewoner: "Sophie", categorie: "huishoudelijk" },
  { id: 9, naam: "Voorraad controleren", ruimte: "Keuken", minuten: 10, dag: 6, bewoner: "Jonas", categorie: "huishoudelijk" },
];

export const WEEKDOEL_MINUTEN = TAKEN.reduce(
  (totaal, taak) => totaal + taak.minuten,
  0,
);
