import { connection } from "next/server";
import {
  DatabaseSetupError,
  getPostgresPool,
  isLocalDevelopmentRequest,
} from "@/lib/postgres";

export async function GET(request: Request) {
  await connection();

  if (!isLocalDevelopmentRequest(request)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const result = await getPostgresPool().query<{
      database: string;
      schema: string;
    }>("SELECT current_database() AS database, current_schema() AS schema");

    return Response.json(
      { connected: true, ...result.rows[0] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("PostgreSQL health check failed.", error);
    return Response.json(
      { error: "Could not connect to the local PostgreSQL database." },
      { status: 503 },
    );
  }
}
