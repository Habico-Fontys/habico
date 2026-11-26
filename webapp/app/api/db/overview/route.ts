import { connection } from "next/server";
import {
  DatabaseSetupError,
  getConfiguredPropertyId,
  getDatabaseOverview,
  isLocalDevelopmentRequest,
} from "@/lib/postgres";

export async function GET(request: Request) {
  await connection();

  if (!isLocalDevelopmentRequest(request)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const propertyId = getConfiguredPropertyId();
    const overview = await getDatabaseOverview(propertyId);
    if (!overview) {
      return Response.json(
        { error: `No property found for HABICO_PROPERTY_ID=${propertyId}.` },
        { status: 404 },
      );
    }

    return Response.json(overview, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    console.error("PostgreSQL overview query failed.", error);
    return Response.json(
      { error: "Could not load data from the local PostgreSQL database." },
      { status: 503 },
    );
  }
}
