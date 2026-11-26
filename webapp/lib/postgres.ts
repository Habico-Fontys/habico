import "server-only";
import { Pool } from "pg";

declare global {
  var habicoPostgresPool: Pool | undefined;
}

export class DatabaseSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseSetupError";
  }
}

export function getPostgresPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DatabaseSetupError("DATABASE_URL is not configured.");
  }

  let hostname: string;
  try {
    hostname = new URL(connectionString).hostname.replace(/^\[|\]$/g, "");
  } catch {
    throw new DatabaseSetupError("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new DatabaseSetupError(
      "DATABASE_URL must point to a local PostgreSQL host.",
    );
  }

  if (!globalThis.habicoPostgresPool) {
    globalThis.habicoPostgresPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      max: 5,
    });
  }

  return globalThis.habicoPostgresPool;
}

export function getConfiguredPropertyId() {
  const value = process.env.HABICO_PROPERTY_ID;
  if (!value || !/^\d+$/.test(value)) {
    throw new DatabaseSetupError(
      "HABICO_PROPERTY_ID must be set to the property_id to display.",
    );
  }

  const propertyId = Number(value);
  if (!Number.isSafeInteger(propertyId) || propertyId < 1) {
    throw new DatabaseSetupError(
      "HABICO_PROPERTY_ID must be a positive integer.",
    );
  }

  return propertyId;
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalDevelopmentRequest(request: Request) {
  if (process.env.NODE_ENV !== "development") return false;

  try {
    const requestHostname = new URL(request.url).hostname.replace(/^\[|\]$/g, "");
    const hostHeader = request.headers.get("host");
    const headerHostname = hostHeader
      ? new URL(`http://${hostHeader}`).hostname.replace(/^\[|\]$/g, "")
      : "";

    return localHosts.has(requestHostname) && localHosts.has(headerHostname);
  } catch {
    return false;
  }
}

export type DatabaseOverview = {
  property: {
    propertyId: number;
    city: string | null;
    roomsAvailable: number | null;
    squareMeters: number | null;
  };
  residents: Array<{
    studentId: number;
    name: string;
  }>;
  tasks: Array<{
    taskId: number;
    name: string;
    description: string | null;
    dueDate: Date;
    previousDate: Date;
    status: string | null;
    durationMinutes: number | null;
    studentId: number | null;
    studentName: string | null;
  }>;
  bins: Array<{
    binId: number;
    measurement: {
      measurementId: number;
      lidStatus: boolean | null;
      weight: number | null;
      depth: number | null;
      fullness: number | null;
      measuredAt: Date | null;
    } | null;
  }>;
  energy: Array<{
    year: number | null;
    month: number | null;
    gasBill: number | null;
    electricityBill: number | null;
  }>;
};

type PropertyRow = DatabaseOverview["property"];
type ResidentRow = DatabaseOverview["residents"][number];
type TaskRow = DatabaseOverview["tasks"][number];
type BinRow = {
  binId: number;
  measurementId: number | null;
  lidStatus: boolean | null;
  weight: number | null;
  depth: number | null;
  fullness: number | null;
  measuredAt: Date | null;
};
type EnergyRow = DatabaseOverview["energy"][number];

export async function getDatabaseOverview(
  propertyId: number,
): Promise<DatabaseOverview | null> {
  const pool = getPostgresPool();
  const [propertyResult, residentsResult, tasksResult, binsResult, energyResult] =
    await Promise.all([
      pool.query<PropertyRow>(
        `SELECT
          propertie_id AS "propertyId",
          city,
          rooms_available AS "roomsAvailable",
          square_meters::float8 AS "squareMeters"
        FROM propertie
        WHERE propertie_id = $1`,
        [propertyId],
      ),
      pool.query<ResidentRow>(
        `SELECT DISTINCT
          s.student_id AS "studentId",
          concat_ws(' ', s.first_name, s.last_name) AS name
        FROM room_student rs
        JOIN room r ON r.room_id = rs.room_id
        JOIN student s ON s.student_id = rs.student_id
        WHERE r.propertie_id = $1
          AND rs.start_year <= EXTRACT(YEAR FROM CURRENT_DATE)
          AND (rs.end_year IS NULL OR rs.end_year >= EXTRACT(YEAR FROM CURRENT_DATE))
        ORDER BY name`,
        [propertyId],
      ),
      pool.query<TaskRow>(
        `SELECT
          t.task_id AS "taskId",
          t.task_name AS name,
          t.description,
          t.due_date AS "dueDate",
          t.previous_date AS "previousDate",
          t.status,
          t.duration_minute AS "durationMinutes",
          t.student_id AS "studentId",
          concat_ws(' ', s.first_name, s.last_name) AS "studentName"
        FROM task t
        LEFT JOIN student s ON s.student_id = t.student_id
        WHERE t.propertie_id = $1
        ORDER BY t.due_date, t.task_id`,
        [propertyId],
      ),
      pool.query<BinRow>(
        `SELECT
          b.bin_id AS "binId",
          latest.measurement_id AS "measurementId",
          latest.lid_status AS "lidStatus",
          latest.weight::float8 AS weight,
          latest.depth,
          latest.fullness,
          latest.measured_at AS "measuredAt"
        FROM bin b
        LEFT JOIN LATERAL (
          SELECT
            m.measurement_id,
            m.lid_status,
            m.weight,
            m.depth,
            m.fullness,
            m.measured_at
          FROM measurement m
          WHERE m.bin_id = b.bin_id
            AND m.propertie_id = b.propertie_id
          ORDER BY m.measured_at DESC NULLS LAST, m.measurement_id DESC
          LIMIT 1
        ) latest ON true
        WHERE b.propertie_id = $1
        ORDER BY b.bin_id`,
        [propertyId],
      ),
      pool.query<EnergyRow>(
        `SELECT year, month, gas_bill AS "gasBill", electricity_bill AS "electricityBill"
        FROM energy
        WHERE propertie_id = $1
        ORDER BY year, month`,
        [propertyId],
      ),
    ]);

  const property = propertyResult.rows[0];
  if (!property) return null;

  return {
    property,
    residents: residentsResult.rows,
    tasks: tasksResult.rows,
    bins: binsResult.rows.map((row) => ({
      binId: row.binId,
      measurement:
        row.measurementId === null
          ? null
          : {
              measurementId: row.measurementId,
              lidStatus: row.lidStatus,
              weight: row.weight,
              depth: row.depth,
              fullness: row.fullness,
              measuredAt: row.measuredAt,
            },
    })),
    energy: energyResult.rows,
  };
}
