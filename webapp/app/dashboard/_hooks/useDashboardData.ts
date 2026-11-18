"use client";

import { useMemo } from "react";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { datumSleutel, startVanWeek } from "../_lib/datum";
import {
  bepaalBegroeting,
  bepaalHoogsteDag,
  berekenBudget,
  berekenDagen,
  berekenGrafiekDagen,
  berekenWeekTotalen,
  filterBijdragen,
  selecteerAgendaItems,
  type GrafiekDag,
} from "../_lib/dashboard";
import { useVandaag } from "./useVandaag";
import {
  ACTIVITEITEN_OPSLAG,
  BEGIN_ACTIVITEITEN,
  isAgendaActiviteiten,
  type AgendaActiviteit,
} from "../activiteiten/data";
import {
  BOODSCHAPPEN_OPSLAG,
  BEGIN_BOODSCHAPPEN_DATA,
  isBoodschappenData,
  type Product,
} from "../boodschappenlijst/data";
import {
  REGISTRATIES_OPSLAG,
  WEEKDOEL_MINUTEN,
} from "../takenlijst/data";
import {
  BEGIN_SENSOR,
  isSensorData,
  SENSOR_OPSLAG,
  type SensorData,
} from "../afval/sensor";

const GEEN_REGISTRATIES: unknown[] = [];
const isLijst = (waarde: unknown): waarde is unknown[] =>
  Array.isArray(waarde);

export type DashboardData = {
  begroeting: string;
  beschikbaar: number;
  uitgegeven: number;
  minuten: number;
  percentage: number;
  weekdoel: number;
  grafiekDagen: GrafiekDag[];
  agendaItems: AgendaActiviteit[];
  productenNodig: Product[];
  sensor: SensorData;
  afvalBeschikbaar: number;
};

export function useDashboardData(): DashboardData {
  const vandaag = useVandaag();
  const [registraties] = useLocalStorageValue(
    REGISTRATIES_OPSLAG,
    GEEN_REGISTRATIES,
    isLijst,
    { onInvalid: "fallback" },
  );
  const [boodschappen] = useLocalStorageValue(
    BOODSCHAPPEN_OPSLAG,
    BEGIN_BOODSCHAPPEN_DATA,
    isBoodschappenData,
  );
  const [activiteiten] = useLocalStorageValue(
    ACTIVITEITEN_OPSLAG,
    BEGIN_ACTIVITEITEN,
    isAgendaActiviteiten,
  );
  const [sensor] = useLocalStorageValue(
    SENSOR_OPSLAG,
    BEGIN_SENSOR,
    isSensorData,
  );

  const bijdragen = useMemo(() => {
    if (!vandaag) return [];

    const maandag = startVanWeek(vandaag);
    const zondag = new Date(maandag);
    zondag.setDate(maandag.getDate() + 6);
    return (
      filterBijdragen(
        registraties,
        datumSleutel(maandag),
        datumSleutel(zondag),
      ) ?? []
    );
  }, [registraties, vandaag]);

  // ---------- 6. Totalen voor de kaarten ----------
  const { minuten, percentage } = berekenWeekTotalen(
    bijdragen,
    WEEKDOEL_MINUTEN,
  );
  const { uitgegeven, beschikbaar, productenNodig } = berekenBudget(boodschappen);
  const agendaItems = selecteerAgendaItems(activiteiten);
  const begroeting = bepaalBegroeting(vandaag);
  const dagen = berekenDagen(vandaag, bijdragen);
  const hoogsteDag = bepaalHoogsteDag(dagen);
  const grafiekDagen = berekenGrafiekDagen(dagen, hoogsteDag);
  const afvalBeschikbaar = 100 - sensor.vulgraad;

  return {
    begroeting,
    beschikbaar,
    uitgegeven,
    minuten,
    percentage,
    weekdoel: WEEKDOEL_MINUTEN,
    grafiekDagen,
    agendaItems,
    productenNodig,
    sensor,
    afvalBeschikbaar,
  };
}
