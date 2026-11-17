export type SensorData = {
  naam: string;
  soort: string;
  vulgraad: number;
  batterij: number;
};

export const SENSOR_OPSLAG = "habico-buitencontainer-v1";

export const BEGIN_SENSOR: SensorData = {
  naam: "Buitencontainer",
  soort: "Restafval",
  vulgraad: 68,
  batterij: 84,
};

export function isSensorData(value: unknown): value is SensorData {
  if (typeof value !== "object" || value === null) return false;
  const sensor = value as Record<string, unknown>;
  return (
    typeof sensor.naam === "string" &&
    typeof sensor.soort === "string" &&
    typeof sensor.vulgraad === "number" &&
    Number.isFinite(sensor.vulgraad) &&
    sensor.vulgraad >= 0 &&
    sensor.vulgraad <= 100 &&
    typeof sensor.batterij === "number" &&
    Number.isFinite(sensor.batterij) &&
    sensor.batterij >= 0 &&
    sensor.batterij <= 100
  );
}
