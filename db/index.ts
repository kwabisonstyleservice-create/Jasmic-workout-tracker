import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cachedDb: NeonHttpDatabase<typeof schema> | undefined;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!cachedDb) {
    cachedDb = drizzle(neon(databaseUrl), { schema });
  }

  return cachedDb;
}

