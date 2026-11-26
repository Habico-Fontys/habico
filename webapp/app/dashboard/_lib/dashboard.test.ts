import { afterAll, describe, expect, it } from "vitest";
import {
  bepaalBegroeting,
  bepaalHoogsteDag,
  berekenBudget,
  berekenDagen,
  berekenGrafiekDagen,
  berekenWeekTotalen,
  filterBijdragen,
  selecteerAgendaItems,
  type Bijdrage,
} from "./dashboard";
import { datumSleutel, startVanWeek } from "./datum";

const originalTimezone = process.env.TZ;

afterAll(() => {
  process.env.TZ = originalTimezone;
});

function localDate(year: number, month: number, day: number, hour = 12) {
  return new Date(year, month - 1, day, hour);
}

function bijdrage(datum: string, minuten = 15): Bijdrage {
  return { bewoner: "Mila", minuten, datum };
}

describe("dashboard date helpers", () => {
  it.each([
    [2026, 11, 15, "2026-11-15", "2026-11-09"],
    [2026, 11, 16, "2026-11-16", "2026-11-16"],
    [2026, 11, 1, "2026-11-01", "2026-10-26"],
    [2026, 11, 30, "2026-11-30", "2026-11-30"],
    [2026, 12, 1, "2026-12-01", "2026-11-30"],
  ])(
    "formats and finds Monday for %i-%i-%i",
    (year, month, day, key, monday) => {
      const date = localDate(year, month, day);
      expect(datumSleutel(date)).toBe(key);
      expect(datumSleutel(startVanWeek(date))).toBe(monday);
    },
  );

  it("keeps local calendar days through the Amsterdam DST transition week", () => {
    process.env.TZ = "Europe/Amsterdam";
    const weekStart = localDate(2026, 10, 25);
    const monday = startVanWeek(weekStart);
    const followingMonday = new Date(monday);
    followingMonday.setDate(followingMonday.getDate() + 7);

    expect(datumSleutel(monday)).toBe("2026-10-19");
    expect(datumSleutel(weekStart)).toBe("2026-10-25");
    expect(datumSleutel(followingMonday)).toBe("2026-10-26");
    expect((followingMonday.getTime() - monday.getTime()) / 3_600_000).toBe(169);
  });
});

describe("dashboard calculations", () => {
  it("calculates weekly minutes and leaves percentages uncapped", () => {
    expect(
      berekenWeekTotalen(
        [bijdrage("2026-11-09", 80), bijdrage("2026-11-10", 25)],
        100,
      ),
    ).toEqual({ minuten: 105, percentage: 105 });
  });

  it("returns zero totals for empty inputs", () => {
    expect(berekenWeekTotalen([], 100)).toEqual({ minuten: 0, percentage: 0 });
    expect(berekenBudget({ bewoners: [], producten: [], inleg: 0, voorstel: null }))
      .toEqual({
        ingelegd: 0,
        uitgegeven: 0,
        beschikbaar: 0,
        productenNodig: [],
      });
    expect(selecteerAgendaItems([])).toEqual([]);
    expect(berekenDagen(null, [])).toEqual([
      { naam: "M", minuten: 0 },
      { naam: "D", minuten: 0 },
      { naam: "W", minuten: 0 },
      { naam: "D", minuten: 0 },
      { naam: "V", minuten: 0 },
      { naam: "Z", minuten: 0 },
      { naam: "Z", minuten: 0 },
    ]);
    expect(bepaalHoogsteDag([])).toBe(30);
  });

  it("calculates the budget and keeps only unpurchased products needed", () => {
    const nodig = {
      id: 1,
      naam: "Melk",
      omschrijving: "1 liter",
      prijs: 2,
      aanbieding: "",
      gekocht: false,
      toegevoegdDoor: "Mila",
    };
    const gekocht = {
      ...nodig,
      id: 2,
      naam: "Brood",
      prijs: 3,
      gekocht: true,
    };

    expect(
      berekenBudget({
        bewoners: [
          { id: 1, naam: "Mila", betaaldBedrag: 20 },
          { id: 2, naam: "Marvin", betaaldBedrag: 15 },
        ],
        producten: [nodig, gekocht],
        inleg: 10,
        voorstel: null,
      }),
    ).toEqual({
      ingelegd: 35,
      uitgegeven: 3,
      beschikbaar: 32,
      productenNodig: [nodig],
    });
  });

  it("sorts agenda items by local date and time and returns at most three", () => {
    const activities = [
      { id: "late", date: "2026-11-10", time: "21:00" },
      { id: "next-day", date: "2026-11-11", time: "08:00" },
      { id: "first", date: "2026-11-10", time: "08:00" },
      { id: "middle", date: "2026-11-10", time: "13:00" },
    ].map((item) => ({
      ...item,
      title: item.id,
      description: "",
      location: "",
      organizer: "Mila",
      type: "Samen doen" as const,
      attendees: 1,
      attending: false,
      reminder: false,
    }));

    expect(selecteerAgendaItems(activities).map(({ id }) => id)).toEqual([
      "first",
      "middle",
      "late",
    ]);
    expect(activities.map(({ id }) => id)).toEqual([
      "late",
      "next-day",
      "first",
      "middle",
    ]);
  });

  it.each([
    [null, "Welkom thuis"],
    [localDate(2026, 11, 16, 11).setMinutes(59), "Goedemorgen"],
    [localDate(2026, 11, 16, 12), "Goedemiddag"],
    [localDate(2026, 11, 16, 17).setMinutes(59), "Goedemiddag"],
    [localDate(2026, 11, 16, 18), "Goedenavond"],
  ])("returns the greeting for the supplied time", (timestamp, expected) => {
    const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
    expect(bepaalBegroeting(date)).toBe(expected);
  });

  it("sums each local weekday and keeps the existing minimum chart scale", () => {
    const days = berekenDagen(localDate(2026, 11, 15), [
      bijdrage("2026-11-09", 20),
      bijdrage("2026-11-11", 45),
    ]);

    expect(days.map(({ minuten }) => minuten)).toEqual([20, 0, 45, 0, 0, 0, 0]);
    expect(bepaalHoogsteDag(days)).toBe(45);
  });

  it("prepares chart heights and weekday titles for presentation", () => {
    expect(
      berekenGrafiekDagen(
        [
          { naam: "M", minuten: 0 },
          { naam: "D", minuten: 15 },
        ],
        30,
      ),
    ).toEqual([
      { naam: "M", minuten: 0, hoogte: 5, titel: "Maandag: 0 min" },
      { naam: "D", minuten: 15, hoogte: 50, titel: "Dinsdag: 15 min" },
    ]);
    expect(
      berekenDagen(null, [], "en").map(({ naam }) => naam),
    ).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(
      berekenGrafiekDagen([{ naam: "M", minuten: 0 }], 30, "en")[0].titel,
    ).toBe("Monday: 0 min");
  });
});

describe("registration row filter", () => {
  const weekStart = "2026-11-09";
  const weekEnd = "2026-11-15";

  it("uses an empty contributions list for non-array storage values", () => {
    expect(filterBijdragen(null, weekStart, weekEnd) ?? []).toEqual([]);
    expect(filterBijdragen({ items: [] }, weekStart, weekEnd) ?? []).toEqual([]);
  });

  it("keeps only rows with the existing accepted fields, minutes and inclusive dates", () => {
    const acceptedStart = bijdrage(weekStart);
    const acceptedEnd = bijdrage(weekEnd);
    const rejectedRows: unknown[] = [
      null,
      { ...acceptedStart, bewoner: 1 },
      { ...acceptedStart, minuten: "15" },
      { ...acceptedStart, datum: 15 },
      { ...acceptedStart, minuten: Number.NaN },
      { ...acceptedStart, minuten: Number.POSITIVE_INFINITY },
      { ...acceptedStart, minuten: 0 },
      { ...acceptedStart, minuten: -1 },
      bijdrage("2026-11-08"),
      bijdrage("2026-11-16"),
    ];

    expect(
      filterBijdragen(
        [...rejectedRows, acceptedStart, acceptedEnd],
        weekStart,
        weekEnd,
      ),
    ).toEqual([acceptedStart, acceptedEnd]);
  });
});
