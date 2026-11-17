export type ActiviteitSoort = "Samen doen" | "Spontaan" | "Feestje";

export type AgendaActiviteit = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  type: ActiviteitSoort;
  attendees: number;
  attending: boolean;
  reminder: boolean;
  noiseNotice?: string;
};

export const ACTIVITEITEN_OPSLAG = "habico-activiteiten-v1";

export const BEGIN_ACTIVITEITEN: AgendaActiviteit[] = [
  {
    id: "activity-cooking",
    title: "Samen koken",
    description: "Wie kookt er mee? We maken samen iets lekkers.",
    date: "2026-11-12",
    time: "18:30",
    location: "Gedeelde keuken",
    organizer: "Mila",
    type: "Samen doen",
    attendees: 3,
    attending: true,
    reminder: true,
  },
  {
    id: "activity-sports",
    title: "Hardlopen in het park",
    description: "Ik ga een rondje hardlopen. Sluit gezellig aan!",
    date: "2026-11-12",
    time: "19:00",
    location: "Verzamelen bij de voordeur",
    organizer: "Marvin",
    type: "Spontaan",
    attendees: 1,
    attending: false,
    reminder: false,
  },
  {
    id: "activity-movie",
    title: "Filmavond",
    description: "Kies mee welke film we kijken en neem je favoriete snacks mee.",
    date: "2026-11-13",
    time: "20:00",
    location: "Woonkamer",
    organizer: "Sam",
    type: "Samen doen",
    attendees: 4,
    attending: false,
    reminder: true,
  },
  {
    id: "activity-party",
    title: "Verjaardagsfeestje",
    description: "Een klein feestje voor mijn verjaardag. Huisgenoten zijn welkom!",
    date: "2026-11-14",
    time: "21:00",
    location: "Woonkamer",
    organizer: "Jonas",
    type: "Feestje",
    attendees: 8,
    attending: false,
    reminder: false,
    noiseNotice: "Er kan deze avond wat extra geluid zijn. Bedankt voor je begrip!",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAgendaActiviteiten(
  value: unknown,
): value is AgendaActiviteit[] {
  return (
    Array.isArray(value) &&
    value.every(
      (activity) =>
        isRecord(activity) &&
        typeof activity.id === "string" &&
        typeof activity.title === "string" &&
        typeof activity.description === "string" &&
        typeof activity.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(activity.date) &&
        typeof activity.time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(activity.time) &&
        typeof activity.location === "string" &&
        typeof activity.organizer === "string" &&
        (activity.type === "Samen doen" ||
          activity.type === "Spontaan" ||
          activity.type === "Feestje") &&
        typeof activity.attendees === "number" &&
        Number.isFinite(activity.attendees) &&
        typeof activity.attending === "boolean" &&
        typeof activity.reminder === "boolean" &&
        (activity.noiseNotice === undefined ||
          typeof activity.noiseNotice === "string"),
    )
  );
}
